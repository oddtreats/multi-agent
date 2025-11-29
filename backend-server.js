// backend-server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Configuration
const agents = [
  { name: 'Agent1', port: 12000, model: 'llama3.1:latest' },
  { name: 'Agent2', port: 12001, model: 'llama3.1:latest' },
  { name: 'Agent3', port: 12002, model: 'llama3.1:latest' }
  // Agents 4 & 5 disabled to reduce memory usage
  // All using same model to avoid pulling additional large models
];

// Search API configuration (using Brave Search as example)
const BRAVE_API_KEY = process.env.BRAVE_API_KEY || 'BSA6yiZrTLxhNaNkmgGbFV2_9az6IAi';

/**
 * Perform web search using Brave Search API
 */
async function searchInternet(query) {
  if (BRAVE_API_KEY === 'YOUR_API_KEY_HERE') {
    console.log('⚠️  No search API key configured, returning mock results');
    return [
      `Mock search result 1 for: ${query}`,
      `Mock search result 2 for: ${query}`,
      `Mock search result 3 for: ${query}`
    ];
  }

  try {
    const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
      params: {
        q: query,
        count: 5
      },
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': BRAVE_API_KEY
      }
    });

    return response.data.web?.results?.map(r => 
      `${r.title}: ${r.description}`
    ) || [];
  } catch (error) {
    console.error('Search error:', error.message);
    return [`Search unavailable: ${error.message}`];
  }
}

/**
 * Call individual Ollama agent
 */
async function callAgent(agent, prompt, timeout = 60000) {
  try {
    console.log(`📞 Calling ${agent.name} (${agent.model})...`);
    
    const response = await axios.post(
      `http://localhost:${agent.port}/api/generate`,
      {
        model: agent.model,
        prompt: prompt,
        stream: false
      },
      { timeout }
    );

    console.log(`✅ ${agent.name} responded`);
    return response.data.response;
  } catch (error) {
    console.error(`❌ Error calling ${agent.name}:`, error.message);
    throw new Error(`${agent.name} failed: ${error.message}`);
  }
}

/**
 * Determine if search is needed based on query keywords
 */
function needsSearch(query) {
  const searchKeywords = [
    'current', 'latest', 'recent', 'today', 'news', 'price',
    'weather', '2024', '2025', 'now', 'update', 'compare',
    'versus', 'vs', 'best', 'top', 'ranking'
  ];
  
  const lowerQuery = query.toLowerCase();
  return searchKeywords.some(keyword => lowerQuery.includes(keyword));
}

/**
 * Main orchestration function
 */
async function processQuery(userQuery) {
  console.log('\n🚀 Starting multi-agent process');
  console.log('Query:', userQuery);

  // Step 1: Determine if search is needed
  const shouldSearch = needsSearch(userQuery);
  let searchResults = null;

  if (shouldSearch) {
    console.log('🔍 Performing web search...');
    searchResults = await searchInternet(userQuery);
    console.log(`Found ${searchResults.length} search results`);
  } else {
    console.log('ℹ️  No search needed for this query');
  }

  // Step 2: Get initial responses from all agents
  console.log('\n📝 Phase 1: Getting initial responses...');
  
  const searchContext = searchResults 
    ? `\n\nInternet search results:\n${searchResults.join('\n')}\n\n`
    : '';

  const initialPrompt = `${searchContext}Question: ${userQuery}\n\nProvide a clear, concise answer:`;

  const initialResponses = await Promise.all(
    agents.map(async (agent) => {
      try {
        const response = await callAgent(agent, initialPrompt);
        return { agent: agent.name, response };
      } catch (error) {
        return { 
          agent: agent.name, 
          response: `Error: ${error.message}` 
        };
      }
    })
  );

  console.log('✅ All initial responses received');

  // Step 3: Deliberation phase
  console.log('\n💭 Phase 2: Agent deliberation...');
  
  const deliberationPrompt = `Original question: ${userQuery}

${searchContext}

Here are responses from all 5 agents:

${initialResponses.map((r, i) => `${r.agent}: ${r.response}`).join('\n\n')}

After reviewing all responses above, provide:
1. Your analysis of which parts are most accurate
2. Your refined answer incorporating the best insights
3. Any disagreements or concerns you have

Keep your response focused and concise.`;

  const deliberations = await Promise.all(
    agents.map(async (agent) => {
      try {
        const response = await callAgent(agent, deliberationPrompt);
        return { agent: agent.name, deliberation: response };
      } catch (error) {
        return { 
          agent: agent.name, 
          deliberation: `Error: ${error.message}` 
        };
      }
    })
  );

  console.log('✅ All deliberations received');

  // Step 4: Final consensus
  console.log('\n🎯 Phase 3: Building final consensus...');
  
  const consensusPrompt = `Original question: ${userQuery}

${searchContext}

INITIAL RESPONSES:
${initialResponses.map((r, i) => `${r.agent}: ${r.response}`).join('\n\n')}

DELIBERATIONS:
${deliberations.map((d, i) => `${d.agent}: ${d.deliberation}`).join('\n\n')}

Based on ALL the information above, synthesize the single BEST, most accurate, and complete answer to the original question. 

Your response should:
- Be clear and well-structured
- Incorporate the strongest points from all agents
- Resolve any disagreements
- Be concise but comprehensive

Final answer:`;

  const finalResponse = await callAgent(agents[0], consensusPrompt);

  console.log('✅ Final consensus reached\n');

  return {
    userQuery,
    searchResults,
    initialResponses,
    deliberations,
    finalResponse
  };
}

// API Endpoints
app.post('/query', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log('\n' + '='.repeat(60));
    const result = await processQuery(query);
    console.log('='.repeat(60) + '\n');
    
    res.json(result);
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Make sure all Ollama containers are running and models are pulled'
    });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const status = await Promise.all(
    agents.map(async (agent) => {
      try {
        await axios.get(`http://localhost:${agent.port}/api/tags`, { timeout: 2000 });
        return { agent: agent.name, status: 'online', port: agent.port };
      } catch (error) {
        return { agent: agent.name, status: 'offline', port: agent.port };
      }
    })
  );

  res.json({ status: 'ok', agents: status });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║        🤖 Multi-Agent AI Orchestrator Server 🤖           ║
║                                                            ║
║  Server running on: http://localhost:${PORT}                 ║
║                                                            ║
║  Endpoints:                                                ║
║  • POST /query - Process multi-agent query                ║
║  • GET /health - Check agent status                       ║
║                                                            ║
║  Expected Ollama agents:                                   ║
${agents.map(a => `║  • ${a.name.padEnd(10)} - localhost:${a.port} (${a.model.padEnd(10)}) ║`).join('\n')}
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
  
  console.log('\n💡 Tips:');
  console.log('   - Set BRAVE_API_KEY environment variable for real web search');
  console.log('   - Make sure all Ollama containers are running');
  console.log('   - Pull models: ollama pull <model-name>');
  console.log('   - Test health: curl http://localhost:3000/health\n');
});

module.exports = app;
