# Ollama Setup Guide

This guide will help you set up Ollama to run local LLMs for the Smart Contract Analysis Agent.

## 1. Install Ollama

### Windows
```bash
# Download and run the installer from https://ollama.ai
# Or use winget
winget install Ollama.Ollama
```

### macOS
```bash
# Download from https://ollama.ai or use Homebrew
brew install ollama
```

### Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

## 2. Start Ollama Service

```bash
# Start Ollama (runs on http://localhost:11434 by default)
ollama serve
```

## 3. Pull Required Models

Open a new terminal and pull the models:

```bash
# Main LLM for contract analysis (choose one based on your hardware)
ollama pull llama3.1:8b      # 4.7GB - Good balance of speed and quality
ollama pull llama3.1:70b     # 40GB - Best quality (requires 64GB+ RAM)
ollama pull mistral:7b       # 4.1GB - Fast and efficient alternative

# Embedding model for vector search
ollama pull nomic-embed-text # 274MB - Optimized for text embeddings
```

## 4. Test Your Setup

```bash
# Test the LLM
ollama run llama3.1:8b "Analyze this contract clause: The party agrees to indemnify..."

# Test embeddings
curl http://localhost:11434/api/embeddings \
  -d '{"model": "nomic-embed-text", "prompt": "test text"}'
```

## 5. Configure Environment

Update your `.env` file:

```bash
# Ollama Configuration
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b          # or mistral:7b
EMBEDDING_MODEL=nomic-embed-text
```

## Model Recommendations

### For 8GB RAM or less:
- **LLM**: `mistral:7b` (4.1GB)
- **Embeddings**: `nomic-embed-text` (274MB)

### For 16GB RAM:
- **LLM**: `llama3.1:8b` (4.7GB) 
- **Embeddings**: `nomic-embed-text` (274MB)

### For 32GB+ RAM:
- **LLM**: `llama3.1:70b` (40GB) - Best quality
- **Embeddings**: `nomic-embed-text` (274MB)

## Troubleshooting

### Ollama not responding:
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama service
ollama serve
```

### Model not found:
```bash
# List installed models
ollama list

# Pull missing model
ollama pull llama3.1:8b
```

### Performance issues:
- Use smaller models (mistral:7b instead of llama3.1:70b)
- Close other applications to free up RAM
- Consider using GPU acceleration if available

## Benefits of Local LLMs

✅ **Free**: No API costs or usage limits  
✅ **Private**: Your contracts never leave your machine  
✅ **Fast**: No network latency once models are loaded  
✅ **Offline**: Works without internet connection  
✅ **Customizable**: Fine-tune models for your specific needs