# 🚀 Quick Start Guide

## Visual System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         YOU (User)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Web UI (multi-agent-ui.html)                   │
│  • Beautiful interface                                      │
│  • Real-time progress tracking                              │
│  • View all agent responses                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│          Backend Server (backend-server.js)                 │
│  • Port 3000                                                │
│  • Orchestrates all agents                                  │
│  • Handles search & consensus                               │
└────────┬────────┬────────┬────────┬────────┬────────────────┘
         │        │        │        │        │
         ▼        ▼        ▼        ▼        ▼
    ┌────────┬────────┬────────┬────────┬────────┐
    │Agent 1 │Agent 2 │Agent 3 │Agent 4 │Agent 5 │
    │:12000  │:12001  │:12002  │:12003  │:12004  │
    │        │        │        │        │        │
    │Llama3  │Mistral │Gemma2  │Phi3    │Qwen2   │
    └────────┴────────┴────────┴────────┴────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │Search API   │
                  │(Internet)   │
                  └─────────────┘
```

## 📦 What Each File Does

| File | Purpose |
|------|---------|
| `multi-agent-ui.html` | **The Web Interface** - Open this in your browser |
| `backend-server.js` | **The Brain** - Coordinates all agents |
| `docker-compose.yml` | **GPU Version** - For systems with NVIDIA GPU |
| `docker-compose-cpu.yml` | **CPU Version** - For systems without GPU |
| `package.json` | **Dependencies** - Lists Node.js packages needed |
| `setup-models.js` | **Model Downloader** - Downloads AI models |
| `test-system.js` | **System Tester** - Verifies everything works |
| `quick-setup.sh` | **Auto Setup** - One-click setup script |
| `README.md` | **Full Documentation** - Complete instructions |

## 🎯 Three Ways to Get Started

### Option 1: Automatic Setup (Easiest) ⭐

```bash
chmod +x quick-setup.sh
./quick-setup.sh
```

Just answer the prompts and you're done!

### Option 2: Manual Setup (Step by Step)

```bash
# 1. Start containers
docker-compose up -d

# 2. Install dependencies  
npm install

# 3. Download models (takes time!)
npm run setup:models

# 4. Start backend
npm start

# 5. Open multi-agent-ui.html in browser
```

### Option 3: Test First (For Verification)

```bash
# 1. Start everything
docker-compose up -d
npm install
npm run setup:models

# 2. Run tests
npm test

# 3. If tests pass, start backend
npm start
```

## ⚡ Quick Commands Reference

```bash
# Start everything
docker-compose up -d && npm start

# Stop everything
docker-compose down

# Check if it's working
npm test

# View container logs
docker-compose logs -f

# Restart backend
# Press Ctrl+C, then:
npm start

# Check health
curl http://localhost:3000/health

# Pull a model manually
docker exec ollama-agent1 ollama pull llama3
```

## 🎨 How It Works (Simple Version)

1. **You ask a question** in the web UI
2. **Backend decides** if it needs to search the internet
3. **All 5 agents** get your question + search results
4. **Each agent responds** with their answer
5. **Agents review** each other's responses
6. **Final answer** is synthesized from best insights
7. **You see** the consensus + all the agent thinking

## 🎓 Example Session

```
User: "What are the latest AI breakthroughs in 2024?"
  ↓
System searches internet → finds recent articles
  ↓
Agent 1 (Llama3): "Recent advances in multimodal AI..."
Agent 2 (Mistral): "OpenAI released GPT-4.5 with..."
Agent 3 (Gemma2): "Google's Gemini Ultra shows..."
Agent 4 (Phi3): "Microsoft integrated AI into..."
Agent 5 (Qwen2): "Chinese models are catching up..."
  ↓
Agents deliberate → discuss accuracy → reach consensus
  ↓
Final Answer: "The major AI breakthroughs in 2024 include..."
```

## 🔥 Pro Tips

1. **First Query is Slow** - Models need to load into memory
2. **Start Simple** - Test with "What is 2+2?" first
3. **GPU = Faster** - Use GPU version if you have NVIDIA card
4. **Smaller = Faster** - Use base models (not :70b versions)
5. **Check Health** - Run `npm test` if something seems wrong

## ❓ Common Questions

**Q: How long does setup take?**  
A: 10 minutes + 30-60 minutes for model downloads

**Q: How much disk space?**  
A: About 20GB for all models

**Q: Can I run without GPU?**  
A: Yes! Use `docker-compose-cpu.yml` (slower but works)

**Q: Which models are best?**  
A: Start with the defaults, customize later

**Q: Can I add more agents?**  
A: Yes! Copy an agent block in docker-compose.yml

## 🆘 Emergency Troubleshooting

**Nothing works?**
```bash
docker-compose down
docker-compose up -d
npm install
npm run setup:models
npm start
```

**Still broken?**
```bash
npm test
```
This will tell you exactly what's wrong!

## 🎉 You're Ready!

1. Open `multi-agent-ui.html`
2. Type your question
3. Watch the magic happen!

---

**Need help?** Check README.md for detailed documentation.
