# 🤖 Multi-Agent AI System with Ollama

A powerful multi-agent system where 5 different AI models collaborate to provide the best possible answers to your questions. Each agent can search the internet and they deliberate together to reach a consensus.

## 🌟 Features

- **5 AI Agents** running simultaneously (Llama 3, Mistral, Gemma 2, Phi 3, Qwen 2)
- **Internet Search Capability** for real-time information
- **Multi-Phase Deliberation** where agents review each other's responses
- **Consensus Building** to synthesize the best answer
- **Beautiful Web UI** to interact with the system
- **Docker-based** for easy deployment
- **Real-time Progress** tracking in the UI

## 📋 Prerequisites

- Docker and Docker Compose installed
- Node.js 16+ installed
- At least 16GB RAM (32GB recommended)
- GPU recommended but not required (will be slower on CPU)
- ~20GB free disk space for models

## 🚀 Quick Start

### 1. Clone or Download Files

Make sure you have all these files in the same directory:
- `docker-compose.yml`
- `backend-server.js`
- `package.json`
- `setup-models.js`
- `multi-agent-ui.html`

### 2. Start Ollama Containers

```bash
# Start all 5 Ollama containers
docker-compose up -d

# Verify containers are running
docker ps
```

You should see 5 containers running:
- `ollama-agent1` on port 12000
- `ollama-agent2` on port 12001
- `ollama-agent3` on port 12002
- `ollama-agent4` on port 12003
- `ollama-agent5` on port 12004

### 3. Install Node.js Dependencies

```bash
npm install
```

### 4. Pull AI Models

This will download the AI models into each container (this takes time!):

```bash
npm run setup:models
```

**Note:** Each model is several GB. Total download size is ~15-20GB. This can take 30-60 minutes depending on your internet speed.

### 5. Start the Backend Server

```bash
npm start
```

You should see:
```
╔════════════════════════════════════════════════════════════╗
║        🤖 Multi-Agent AI Orchestrator Server 🤖           ║
║  Server running on: http://localhost:3000                 ║
╚════════════════════════════════════════════════════════════╝
```

### 6. Open the Web UI

Open `multi-agent-ui.html` in your web browser. That's it! 🎉

## 💡 Usage

1. **Type your question** in the text area
2. **Click Submit** and watch the agents work together
3. **View the progress** as agents search, think, and deliberate
4. **See the final consensus answer** with full transparency of each agent's thinking

### Example Questions

Try these to see the system in action:

- "What are the latest developments in AI technology?"
- "Compare Python vs JavaScript for web development in 2024"
- "What's the current state of electric vehicles?"
- "Explain quantum computing in simple terms"
- "What are the best practices for React development?"

## 🔧 Configuration

### Change Models

Edit `docker-compose.yml`, `backend-server.js`, and `setup-models.js` to use different models:

Available models:
- `llama3`, `llama3:70b`
- `mistral`, `mistral:7b`
- `gemma2`, `gemma2:27b`
- `phi3`, `phi3:medium`
- `qwen2`, `qwen2:72b`
- `codellama`
- And many more at https://ollama.com/library

### Enable Real Web Search

By default, the system uses mock search results. To enable real internet search:

1. Get a Brave Search API key from https://brave.com/search/api/
2. Set the environment variable:

```bash
export BRAVE_API_KEY=your_api_key_here
npm start
```

Or modify `backend-server.js` line 15 to hardcode your key.

### Adjust Ports

If ports 12000-12004 are already in use, edit `docker-compose.yml` to change them:

```yaml
ports:
  - "YOUR_PORT:11434"
```

Then update the port numbers in `backend-server.js`.

## 🛠️ Useful Commands

```bash
# Start containers
npm run docker:up
# or
docker-compose up -d

# Stop containers
npm run docker:down
# or
docker-compose down

# View logs
npm run docker:logs
# or
docker-compose logs -f

# Check health of all agents
curl http://localhost:3000/health

# Manually pull a model
docker exec ollama-agent1 ollama pull llama3

# List models in a container
docker exec ollama-agent1 ollama list

# Restart backend server
npm start

# Development mode (auto-restart on changes)
npm run dev
```

## 📊 Architecture

```
User
  ↓
Web UI (multi-agent-ui.html)
  ↓
Backend Orchestrator (Node.js)
  ↓
┌─────────┬─────────┬─────────┬─────────┬─────────┐
│ Agent 1 │ Agent 2 │ Agent 3 │ Agent 4 │ Agent 5 │
│ :12000  │ :12001  │ :12002  │ :12003  │ :12004  │
│ Llama3  │ Mistral │ Gemma2  │ Phi3    │ Qwen2   │
└─────────┴─────────┴─────────┴─────────┴─────────┘
          ↓
    Search API (optional)
```

### Processing Flow

1. **User submits question** via web UI
2. **Backend determines** if internet search is needed
3. **Search performed** (if needed) and results gathered
4. **Phase 1:** All 5 agents provide initial responses
5. **Phase 2:** Each agent reviews all responses and deliberates
6. **Phase 3:** Final consensus is synthesized
7. **Result returned** to user with full transparency

## 🐛 Troubleshooting

### Containers won't start
```bash
# Check Docker is running
docker ps

# Check logs
docker-compose logs

# Try rebuilding
docker-compose down
docker-compose up -d
```

### Models not responding
```bash
# Check if models are pulled
docker exec ollama-agent1 ollama list

# Pull manually if needed
docker exec ollama-agent1 ollama pull llama3
```

### Port conflicts
```bash
# Check what's using your ports
lsof -i :12000
lsof -i :3000

# Kill the process or change ports in docker-compose.yml
```

### Backend connection errors
- Make sure backend is running: `npm start`
- Check that all containers are running: `docker ps`
- Test agent health: `curl http://localhost:3000/health`
- Verify CORS is enabled in backend

### Slow responses
- First run will be slow as models load into memory
- Consider using smaller models (remove `:70b`, use base versions)
- Ensure adequate RAM (16GB minimum, 32GB recommended)
- GPU will be much faster than CPU

### Out of memory
- Reduce number of agents to 2-3
- Use smaller models (phi3, gemma2:2b)
- Increase Docker memory limit in Docker Desktop settings

## 🔒 Security Notes

- This system is designed for local use
- The backend has no authentication
- Don't expose to the internet without adding security
- API keys should be kept in environment variables
- Consider adding rate limiting for production use

## 🎯 Performance Tips

1. **Use GPU** - Enable GPU support in Docker for faster inference
2. **Smaller models** - Use 7B models instead of 70B for faster responses
3. **Reduce agents** - Start with 2-3 agents, add more as needed
4. **Pre-warm models** - Make a test query after starting to load models into memory
5. **SSD storage** - Store Docker volumes on SSD for faster model loading

## 📝 Customization Ideas

- Add more agents (6, 7, 8...)
- Use specialized models (code-focused, creative writing, etc.)
- Implement voting system instead of consensus
- Add conversation memory across queries
- Create different "panels" for different topics
- Add streaming responses for real-time feedback
- Integrate with other APIs (weather, stocks, etc.)
- Add authentication and user management
- Deploy to cloud with load balancing

## 🤝 Contributing

Feel free to:
- Report bugs
- Suggest new features
- Share your customizations
- Improve documentation

## 📄 License

MIT License - feel free to use and modify!

## 🙏 Credits

- Built with [Ollama](https://ollama.com/)
- Uses models from Meta, Mistral AI, Google, Microsoft, and Alibaba
- Powered by React and Node.js

---

**Happy AI exploring!** 🚀

If you have questions or run into issues, check the troubleshooting section above.
