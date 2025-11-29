# 🎮 GPU & CUDA Configuration Guide

## Docker Compose Versions Explained

You now have **3 versions** of the Docker Compose configuration:

### 1. `docker-compose.yml` (Original GPU Version)
**Best for:** Most users with NVIDIA GPUs

```yaml
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

**Features:**
- ✅ Works with Docker Compose v3.8+
- ✅ Automatically uses CUDA through Ollama
- ✅ Simple and clean configuration
- ⚠️ Requires nvidia-docker2 or NVIDIA Container Toolkit

**When to use:** Standard GPU setup, works for 99% of users with NVIDIA GPUs

---

### 2. `docker-compose-gpu-enhanced.yml` (Enhanced GPU Version) ⭐
**Best for:** Users who want explicit CUDA control

```yaml
environment:
  - NVIDIA_VISIBLE_DEVICES=all
  - NVIDIA_DRIVER_CAPABILITIES=compute,utility
runtime: nvidia
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

**Features:**
- ✅ Explicit CUDA environment variables
- ✅ Explicit nvidia runtime specification
- ✅ More control over GPU visibility
- ✅ Better for debugging GPU issues
- ⚠️ Requires nvidia-docker2 or NVIDIA Container Toolkit

**When to use:** 
- You want explicit CUDA configuration
- You're troubleshooting GPU issues
- You want to control which GPUs are used
- You have multiple GPUs

---

### 3. `docker-compose-cpu.yml` (CPU-Only Version)
**Best for:** No GPU or for testing

```yaml
# No GPU configuration
# Just basic Ollama containers
```

**Features:**
- ✅ Works on any system
- ✅ No GPU drivers needed
- ⚠️ Much slower inference (10-50x slower)

**When to use:**
- No NVIDIA GPU
- Testing the system
- Low-resource environments

---

## How Ollama Uses CUDA

Ollama's Docker image (`ollama/ollama:latest`) includes:

1. **Built-in CUDA support** - Multiple CUDA versions included
2. **Automatic detection** - Finds and uses GPU automatically
3. **CPU fallback** - Uses CPU if no GPU available

**You don't need to:**
- Install CUDA in the container (already included)
- Specify CUDA version (Ollama handles it)
- Configure CUDA paths (automatic)

**You DO need to:**
- Have NVIDIA drivers on host system
- Install nvidia-docker2 or NVIDIA Container Toolkit
- Use one of the GPU docker-compose files

---

## Verification Steps

### Step 1: Check Your GPU
```bash
nvidia-smi
```

You should see your GPU listed.

### Step 2: Verify Docker GPU Support
```bash
./verify-gpu.sh
```

This script will check:
- ✅ GPU detected
- ✅ NVIDIA drivers installed
- ✅ Docker can access GPU
- ✅ Ollama containers can use GPU

### Step 3: Start Containers
```bash
# Use enhanced version for maximum compatibility:
docker-compose -f docker-compose-gpu-enhanced.yml up -d

# Or use standard version:
docker-compose up -d
```

### Step 4: Verify GPU Usage
```bash
# Check if containers can see GPU
docker exec ollama-agent1 nvidia-smi

# Monitor GPU usage in real-time
watch -n 1 nvidia-smi
```

---

## Which Version Should You Use?

### Use `docker-compose.yml` (original) if:
- ✅ You have a standard NVIDIA GPU setup
- ✅ You want the simplest configuration
- ✅ Everything "just works"

### Use `docker-compose-gpu-enhanced.yml` if:
- ✅ You want explicit CUDA control
- ✅ You have multiple GPUs and want to control which ones are used
- ✅ You're experiencing GPU detection issues
- ✅ You want maximum compatibility

### Use `docker-compose-cpu.yml` if:
- ✅ You don't have an NVIDIA GPU
- ✅ You want to test without GPU
- ✅ You're okay with slower performance

---

## Environment Variables Explained

### `NVIDIA_VISIBLE_DEVICES=all`
- Controls which GPUs are visible to the container
- `all` = Use all available GPUs
- `0` = Use only GPU 0
- `0,1` = Use GPU 0 and GPU 1

### `NVIDIA_DRIVER_CAPABILITIES=compute,utility`
- `compute` = CUDA compute capabilities
- `utility` = nvidia-smi and other utilities
- Can also add: `graphics`, `video`, `display`

### `runtime: nvidia`
- Explicitly tells Docker to use NVIDIA runtime
- Alternative to `--gpus all` flag
- More compatible with older Docker versions

---

## Installing NVIDIA Docker Support

### Ubuntu/Debian
```bash
# Add NVIDIA package repositories
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | \
  sudo tee /etc/apt/sources.list.d/nvidia-docker.list

# Install nvidia-docker2
sudo apt-get update
sudo apt-get install -y nvidia-docker2

# Restart Docker
sudo systemctl restart docker

# Test
docker run --rm --gpus all nvidia/cuda:12.0-base-ubuntu20.04 nvidia-smi
```

### Docker Compose Configuration (Alternative Method)
If you don't want to modify docker-compose files, you can configure Docker daemon:

Create/edit `/etc/docker/daemon.json`:
```json
{
  "default-runtime": "nvidia",
  "runtimes": {
    "nvidia": {
      "path": "nvidia-container-runtime",
      "runtimeArgs": []
    }
  }
}
```

Then restart: `sudo systemctl restart docker`

---

## Troubleshooting GPU Issues

### Issue: "nvidia-smi: command not found"
**Solution:** Install NVIDIA drivers on your host system

### Issue: "could not select device driver"
**Solution:** Install nvidia-docker2
```bash
sudo apt-get install nvidia-docker2
sudo systemctl restart docker
```

### Issue: GPU not being used by Ollama
**Check:**
1. Run `docker exec ollama-agent1 nvidia-smi`
2. If it works, GPU is available
3. GPU will only be used during inference (when answering questions)
4. Monitor: `watch -n 1 nvidia-smi` while making a query

### Issue: "runtime: nvidia not found"
**Solutions:**
1. Remove `runtime: nvidia` from docker-compose file
2. Or install nvidia-docker2
3. Or use `--gpus all` in docker run instead

### Issue: Multiple GPUs, want to use specific one
**Solution:** In enhanced version, change:
```yaml
environment:
  - NVIDIA_VISIBLE_DEVICES=0  # Use only GPU 0
```

---

## Performance Comparison

### With GPU (CUDA):
- First query: 30-60 seconds
- Subsequent: 10-30 seconds
- Can handle larger models (70B)

### Without GPU (CPU):
- First query: 5-10 minutes
- Subsequent: 2-5 minutes
- Limited to smaller models (7B, 13B)

**GPU is 10-50x faster!**

---

## Recommendations

### For Development:
Use `docker-compose.yml` - simple and fast

### For Production:
Use `docker-compose-gpu-enhanced.yml` - explicit and debuggable

### For Testing:
Use `docker-compose-cpu.yml` - works anywhere

### For Multi-GPU Systems:
Use `docker-compose-gpu-enhanced.yml` and configure `NVIDIA_VISIBLE_DEVICES`

---

## Quick Reference Commands

```bash
# Verify GPU setup
./verify-gpu.sh

# Start with enhanced GPU version
docker-compose -f docker-compose-gpu-enhanced.yml up -d

# Check GPU usage
nvidia-smi

# Monitor in real-time
watch -n 1 nvidia-smi

# Check in container
docker exec ollama-agent1 nvidia-smi

# View logs
docker-compose logs -f ollama-agent1

# Restart containers
docker-compose restart
```

---

## Summary

**The answer to your question:**
Yes, the Docker Compose GPU versions **do** use CUDA! 

- Ollama has CUDA built-in
- Docker provides GPU access
- CUDA is used automatically
- The enhanced version gives you more control

All three versions are now available - choose the one that fits your needs!
