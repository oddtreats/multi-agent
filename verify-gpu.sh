#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║            🎮 GPU/CUDA Verification Script 🎮             ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if nvidia-smi is available
echo "📊 Step 1: Checking NVIDIA GPU..."
if command -v nvidia-smi &> /dev/null; then
    nvidia-smi
    echo ""
    echo "✅ NVIDIA GPU detected!"
else
    echo "❌ nvidia-smi not found. No NVIDIA GPU or drivers not installed."
    echo ""
    exit 1
fi

echo ""
echo "─────────────────────────────────────────────────────────────"
echo ""

# Check Docker
echo "🐳 Step 2: Checking Docker..."
if command -v docker &> /dev/null; then
    docker --version
    echo "✅ Docker is installed"
else
    echo "❌ Docker not found"
    exit 1
fi

echo ""
echo "─────────────────────────────────────────────────────────────"
echo ""

# Check NVIDIA Docker runtime
echo "🔧 Step 3: Checking NVIDIA Docker runtime..."
if docker info 2>/dev/null | grep -i nvidia &> /dev/null; then
    echo "✅ NVIDIA Docker runtime is available"
else
    echo "⚠️  NVIDIA Docker runtime not detected"
    echo ""
    echo "To install nvidia-docker:"
    echo "https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html"
    echo ""
fi

echo ""
echo "─────────────────────────────────────────────────────────────"
echo ""

# Test GPU access in Docker
echo "🧪 Step 4: Testing GPU access in Docker container..."
echo "Running: docker run --rm --gpus all nvidia/cuda:12.0-base-ubuntu20.04 nvidia-smi"
echo ""

if docker run --rm --gpus all nvidia/cuda:12.0-base-ubuntu20.04 nvidia-smi 2>/dev/null; then
    echo ""
    echo "✅ Docker can access GPU successfully!"
else
    echo "❌ Docker cannot access GPU"
    echo ""
    echo "Possible fixes:"
    echo "1. Install nvidia-docker2:"
    echo "   https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html"
    echo ""
    echo "2. Configure Docker daemon (/etc/docker/daemon.json):"
    echo '   {'
    echo '     "runtimes": {'
    echo '       "nvidia": {'
    echo '         "path": "nvidia-container-runtime",'
    echo '         "runtimeArgs": []'
    echo '       }'
    echo '     }'
    echo '   }'
    echo ""
    echo "3. Restart Docker: sudo systemctl restart docker"
    echo ""
    exit 1
fi

echo ""
echo "─────────────────────────────────────────────────────────────"
echo ""

# Check if Ollama containers are running
echo "📦 Step 5: Checking Ollama containers..."
CONTAINERS=$(docker ps --filter "name=ollama-agent" --format "{{.Names}}")

if [ -z "$CONTAINERS" ]; then
    echo "⚠️  No Ollama containers running"
    echo "   Start them with: docker-compose up -d"
else
    echo "Running Ollama containers:"
    docker ps --filter "name=ollama-agent" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    
    # Check GPU usage in Ollama containers
    echo "🎮 Checking GPU usage in Ollama containers..."
    for container in $CONTAINERS; do
        echo ""
        echo "Container: $container"
        docker exec $container nvidia-smi --query-gpu=name,memory.used,memory.total --format=csv,noheader 2>/dev/null || echo "  GPU info not available (might not be in use yet)"
    done
fi

echo ""
echo "═════════════════════════════════════════════════════════════"
echo ""
echo "📋 Summary:"
echo ""

# Summary
if command -v nvidia-smi &> /dev/null && docker info 2>/dev/null | grep -i nvidia &> /dev/null; then
    echo "✅ GPU: Available"
    echo "✅ CUDA: Working"
    echo "✅ Docker GPU Support: Enabled"
    echo ""
    echo "🎉 Your system is ready for GPU-accelerated Ollama!"
    echo ""
    echo "💡 Tips:"
    echo "   - Use docker-compose.yml (GPU version)"
    echo "   - GPU will be used automatically by Ollama"
    echo "   - Check GPU usage: nvidia-smi"
    echo "   - Monitor in real-time: watch -n 1 nvidia-smi"
else
    echo "⚠️  GPU support not fully configured"
    echo ""
    echo "Options:"
    echo "   1. Fix GPU support (see errors above)"
    echo "   2. Use docker-compose-cpu.yml instead"
fi

echo ""
