#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║       🤖 Multi-Agent AI System - Quick Setup 🤖           ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ All prerequisites found!"
echo ""

# Ask user if they have GPU
echo "Do you have an NVIDIA GPU and nvidia-docker installed? (y/n)"
read -r has_gpu

if [ "$has_gpu" = "y" ] || [ "$has_gpu" = "Y" ]; then
    COMPOSE_FILE="docker-compose.yml"
    echo "✅ Using GPU-enabled configuration"
else
    COMPOSE_FILE="docker-compose-cpu.yml"
    echo "✅ Using CPU-only configuration"
fi
echo ""

# Step 1: Start containers
echo "📦 Step 1: Starting Ollama containers..."
docker-compose -f $COMPOSE_FILE up -d

if [ $? -ne 0 ]; then
    echo "❌ Failed to start containers"
    exit 1
fi

echo "✅ Containers started successfully!"
echo ""

# Wait for containers to be ready
echo "⏳ Waiting for containers to be ready (10 seconds)..."
sleep 10

# Step 2: Install dependencies
echo "📦 Step 2: Installing Node.js dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed!"
echo ""

# Step 3: Setup models
echo "📥 Step 3: Pulling AI models..."
echo "⚠️  This will take 30-60 minutes depending on your internet speed"
echo "   Total download size: ~15-20GB"
echo ""
echo "Do you want to continue? (y/n)"
read -r continue_setup

if [ "$continue_setup" = "y" ] || [ "$continue_setup" = "Y" ]; then
    npm run setup:models
    
    if [ $? -ne 0 ]; then
        echo "⚠️  Some models may have failed to download"
        echo "   You can retry later with: npm run setup:models"
    fi
else
    echo "⏭️  Skipping model download. You'll need to run: npm run setup:models"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║                   🎉 Setup Complete! 🎉                   ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Start the backend server:"
echo "   npm start"
echo ""
echo "2. Open multi-agent-ui.html in your web browser"
echo ""
echo "3. Start asking questions!"
echo ""
echo "💡 Useful commands:"
echo "   - Check health: curl http://localhost:3000/health"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop all: docker-compose down"
echo ""
