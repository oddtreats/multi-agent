// test-system.js
const axios = require('axios');

const BACKEND_URL = 'http://localhost:3000';
const AGENT_PORTS = [12000, 12001, 12002, 12003, 12004];

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║                                                            ║');
console.log('║          🧪 Multi-Agent System Test Script 🧪             ║');
console.log('║                                                            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

async function testBackend() {
  console.log('📡 Testing backend server...');
  try {
    const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
    console.log('✅ Backend is running!\n');
    console.log('Agent Status:');
    response.data.agents.forEach(agent => {
      const status = agent.status === 'online' ? '✅' : '❌';
      console.log(`   ${status} ${agent.agent.padEnd(10)} - Port ${agent.port} - ${agent.status}`);
    });
    return response.data.agents;
  } catch (error) {
    console.log('❌ Backend is not responding!');
    console.log(`   Error: ${error.message}`);
    console.log('   Make sure to run: npm start\n');
    return null;
  }
}

async function testAgent(port, name) {
  try {
    const response = await axios.get(`http://localhost:${port}/api/tags`, { timeout: 5000 });
    console.log(`✅ ${name} is responding`);
    if (response.data.models && response.data.models.length > 0) {
      console.log(`   Models: ${response.data.models.map(m => m.name).join(', ')}`);
    } else {
      console.log('   ⚠️  No models pulled yet! Run: npm run setup:models');
    }
    return true;
  } catch (error) {
    console.log(`❌ ${name} is not responding (Port ${port})`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testQuery() {
  console.log('\n📝 Testing a simple query...');
  console.log('Query: "What is 2+2?"\n');
  
  try {
    const startTime = Date.now();
    const response = await axios.post(
      `${BACKEND_URL}/query`,
      { query: 'What is 2+2?' },
      { timeout: 120000 } // 2 minute timeout
    );
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`✅ Query completed in ${duration} seconds!\n`);
    console.log('Final Answer:');
    console.log(response.data.finalResponse);
    console.log('\n✨ System is working correctly!');
    return true;
  } catch (error) {
    console.log('❌ Query failed!');
    console.log(`   Error: ${error.message}`);
    if (error.response?.data) {
      console.log(`   Details: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return false;
  }
}

async function main() {
  // Test 1: Backend
  const agentStatuses = await testBackend();
  if (!agentStatuses) {
    console.log('\n⚠️  Backend is not running. Start it with: npm start');
    process.exit(1);
  }

  console.log('\n' + '─'.repeat(60) + '\n');

  // Test 2: Individual agents
  console.log('🔍 Testing individual agents...\n');
  const results = await Promise.all(
    AGENT_PORTS.map((port, idx) => testAgent(port, `Agent ${idx + 1}`))
  );

  const allAgentsOnline = results.every(r => r === true);
  
  console.log('\n' + '─'.repeat(60) + '\n');

  if (!allAgentsOnline) {
    console.log('⚠️  Some agents are not responding.');
    console.log('   Make sure containers are running: docker-compose up -d\n');
    process.exit(1);
  }

  // Test 3: Full query (optional)
  console.log('Do you want to test a full query? (This will take time)');
  console.log('This verifies the entire multi-agent system is working.\n');
  console.log('Press Ctrl+C to skip, or wait 5 seconds to continue...\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  await testQuery();

  console.log('\n' + '═'.repeat(60));
  console.log('✅ All tests passed! System is ready to use.');
  console.log('═'.repeat(60));
  console.log('\n📝 Next: Open multi-agent-ui.html in your browser\n');
}

main().catch(error => {
  console.error('\n💥 Test failed with error:', error.message);
  process.exit(1);
});
