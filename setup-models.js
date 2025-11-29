// setup-models.js
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const agents = [
  { name: 'Agent 1', port: 12000, model: 'llama3.1:latest', container: 'ollama-agent1' },
  { name: 'Agent 2', port: 12001, model: 'llama3.1:latest', container: 'ollama-agent2' },
  { name: 'Agent 3', port: 12002, model: 'llama3.1:latest', container: 'ollama-agent3' },
  { name: 'Agent 4', port: 12003, model: 'llama3.1:latest', container: 'ollama-agent4' },
  { name: 'Agent 5', port: 12004, model: 'llama3.1:latest', container: 'ollama-agent5' }
];

async function pullModel(agent) {
  console.log(`\n📥 Pulling ${agent.model} for ${agent.name}...`);
  console.log(`   Container: ${agent.container}`);
  
  try {
    const { stdout, stderr } = await execPromise(
      `docker exec ${agent.container} ollama pull ${agent.model}`
    );
    
    if (stdout) console.log(stdout);
    if (stderr) console.log(stderr);
    
    console.log(`✅ ${agent.model} pulled successfully for ${agent.name}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to pull ${agent.model} for ${agent.name}:`, error.message);
    return false;
  }
}

async function checkContainerRunning(containerName) {
  try {
    const { stdout } = await execPromise(
      `docker ps --filter "name=${containerName}" --format "{{.Names}}"`
    );
    return stdout.trim() === containerName;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║       🚀 Multi-Agent Ollama Model Setup Script 🚀         ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('⏳ Checking if containers are running...\n');

  // Check all containers
  const containerStatuses = await Promise.all(
    agents.map(async (agent) => {
      const isRunning = await checkContainerRunning(agent.container);
      console.log(`   ${isRunning ? '✅' : '❌'} ${agent.container.padEnd(20)} - ${isRunning ? 'Running' : 'Not running'}`);
      return { agent, isRunning };
    })
  );

  const allRunning = containerStatuses.every(s => s.isRunning);

  if (!allRunning) {
    console.log('\n⚠️  Not all containers are running!');
    console.log('   Run: docker-compose up -d');
    console.log('   Or: npm run docker:up\n');
    process.exit(1);
  }

  console.log('\n✅ All containers are running!\n');
  console.log('Starting model downloads...\n');
  console.log('⚠️  Note: This will take some time depending on your internet speed');
  console.log('   Each model is several GB in size\n');

  // Pull models sequentially to avoid overwhelming the system
  const results = [];
  for (const agent of agents) {
    const success = await pullModel(agent);
    results.push({ agent: agent.name, success });
  }

  console.log('\n' + '═'.repeat(60));
  console.log('📊 Setup Summary:');
  console.log('═'.repeat(60) + '\n');

  results.forEach(result => {
    console.log(`   ${result.success ? '✅' : '❌'} ${result.agent}`);
  });

  const allSuccess = results.every(r => r.success);
  
  if (allSuccess) {
    console.log('\n🎉 All models pulled successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start the backend: npm start');
    console.log('   2. Open multi-agent-ui.html in your browser');
    console.log('   3. Start asking questions!\n');
  } else {
    console.log('\n⚠️  Some models failed to pull. Check the errors above.');
    console.log('   You can retry by running: npm run setup:models\n');
  }
}

main().catch(console.error);
