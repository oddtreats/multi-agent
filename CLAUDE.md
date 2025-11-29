# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A multi-agent AI system where 5 different Ollama models (Llama 3, Mistral, Gemma 2, Phi 3, Qwen 2) collaborate to answer questions. The system uses a three-phase consensus process: initial responses, deliberation, and final synthesis.

## Essential Commands

### Development Workflow
```bash
# Start Docker containers (5 Ollama instances)
npm run docker:up        # or: docker-compose up -d

# Install models into containers (first-time setup)
npm run setup:models     # Downloads ~20GB of models

# Start backend orchestrator server
npm start                # Runs on port 3000

# Test the entire system
npm test                 # Verifies all components

# Stop containers
npm run docker:down      # or: docker-compose down

# View container logs
npm run docker:logs      # or: docker-compose logs -f

# Development mode (auto-restart)
npm run dev              # Uses nodemon
```

### Health & Diagnostics
```bash
# Check backend and agent health
curl http://localhost:3000/health

# Check individual agent
curl http://localhost:12000/api/tags  # Agent 1
curl http://localhost:12001/api/tags  # Agent 2
# etc. (12002, 12003, 12004)

# List models in a container
docker exec ollama-agent1 ollama list

# Manually pull a model
docker exec ollama-agent1 ollama pull llama3
```

## Architecture

### System Flow
1. User submits query via web UI (`multi-agent-ui.html`)
2. Backend (`backend-server.js`) determines if internet search is needed (keyword-based heuristic in `needsSearch()`)
3. If needed, performs web search via Brave Search API (or returns mock results if no API key)
4. **Phase 1**: All 5 agents receive query + search context, return initial responses (parallel)
5. **Phase 2**: Each agent reviews all other responses and provides deliberation (parallel)
6. **Phase 3**: Agent 1 synthesizes final consensus from all inputs
7. Results returned to UI with full transparency

### Key Components

**Backend Server** (`backend-server.js:248-273`):
- Express server on port 3000
- `/query` endpoint: POST handler for multi-agent processing
- `/health` endpoint: GET handler for agent status checks
- Main orchestration in `processQuery()` function

**Agent Configuration** (`backend-server.js:11-17`):
- 5 agents on ports 12000-12004
- Each runs a different model via Ollama
- Models: llama3, mistral, gemma2, phi3, qwen2
- All agent definitions must be synchronized across `backend-server.js`, `setup-models.js`, and `docker-compose.yml`

**Docker Setup** (`docker-compose.yml`):
- 5 separate Ollama containers with GPU support
- Named volumes for persistent model storage (ollama1-data through ollama5-data)
- Shared network: ollama-network
- Each container exposes internal port 11434 mapped to external 12000-12004

**Web Search** (`backend-server.js:25-54`):
- Brave Search API integration (optional, requires `BRAVE_API_KEY` env var)
- Falls back to mock results if API key not configured
- Search triggered by keywords: current, latest, recent, 2024, 2025, compare, vs, etc.

### Important File Locations

- **UI**: `multi-agent-ui.html` - Single-file React interface (open in browser)
- **Backend**: `backend-server.js` - Node.js orchestrator (Express + Axios)
- **Setup**: `setup-models.js` - Automated model downloader
- **Testing**: `test-system.js` - System verification script
- **Docker**: `docker-compose.yml` - GPU-enabled config
- **Docker (CPU)**: `docker-compose-gpu-enhanced.yml` - Alternative GPU config

## Common Development Scenarios

### Modifying Agent Configuration
When adding/removing/changing agents, update ALL three files:
1. `backend-server.js` - agents array (lines 11-17)
2. `setup-models.js` - agents array (lines 6-12)
3. `docker-compose.yml` - service definitions
4. Ensure port numbers, container names, and model names match across files

### Testing Individual Agent Calls
The `callAgent()` function (`backend-server.js:59-79`) is the core integration point:
- 60-second timeout by default
- Calls Ollama's `/api/generate` endpoint
- Returns plain text response (stream: false)

### Enabling Real Web Search
Set environment variable before starting backend:
```bash
export BRAVE_API_KEY=your_api_key_here
npm start
```
Or modify `backend-server.js:20` to hardcode the key (not recommended for production).

### Understanding the Multi-Phase Process
1. **Initial Prompt** (`backend-server.js:117-121`): Question + optional search results
2. **Deliberation Prompt** (`backend-server.js:142-155`): All initial responses + request for analysis
3. **Consensus Prompt** (`backend-server.js:176-194`): All responses + deliberations + synthesis request

Each phase uses `Promise.all()` for parallel execution across agents (except final consensus, which only uses Agent 1).

## Port Allocations

- **3000**: Backend orchestrator (Express server)
- **12000-12004**: Ollama agents (external ports mapping to container port 11434)
  - 12000: Agent 1 (llama3)
  - 12001: Agent 2 (mistral)
  - 12002: Agent 3 (gemma2)
  - 12003: Agent 4 (phi3)
  - 12004: Agent 5 (qwen2)

## Resource Requirements

- **RAM**: 16GB minimum, 32GB recommended
- **Disk**: ~20GB for models
- **GPU**: Optional but recommended (NVIDIA with Docker GPU support)
- **CPU**: 4+ cores (higher for CPU-only mode)

## Dependencies

Core: `express`, `cors`, `axios`
Dev: `nodemon`

All managed via npm. Run `npm install` after cloning.

## GPU Configuration

The default `docker-compose.yml` includes NVIDIA GPU configuration. If GPU is unavailable:
- Docker Compose will fall back to CPU automatically
- Inference will be slower but functional
- Consider using smaller models or fewer agents for CPU-only systems

## Common Modifications

**Change model for an agent**: Update model name in agents array (backend + setup) and corresponding docker-compose service
**Add 6th agent**: Copy agent5 block in docker-compose.yml, increment ports, add to agents array in JS files
**Adjust timeouts**: Modify `callAgent()` timeout parameter (default: 60000ms)
**Disable search for specific queries**: Modify `needsSearch()` keyword array
**Change consensus strategy**: Replace final synthesis (Phase 3) with voting or averaging logic
