# Quick Start Guide

Get the Smart Contract Analysis Agent running in 5 minutes!

## Prerequisites

- Node.js 16+ installed
- TiDB Serverless account (free tier available)
- 8GB+ RAM for local LLM

## Step 1: Install Ollama

### Windows
```bash
winget install Ollama.Ollama
```

### macOS
```bash
brew install ollama
```

### Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

## Step 2: Start Ollama & Pull Models

```bash
# Start Ollama service (keep this terminal open)
ollama serve

# In a new terminal, pull the required models
ollama pull llama3.1:8b        # 4.7GB - Main LLM
ollama pull nomic-embed-text   # 274MB - Embeddings
```

## Step 3: Setup the Agent

```bash
# Clone or navigate to the project directory
cd smart-contract-analysis-agent

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env with your TiDB credentials (the Ollama settings should work as-is)
# You can get free TiDB Serverless credentials at: https://tidbcloud.com

# Setup database tables
npm run setup
```

## Step 4: Start the Agent

```bash
# Start in development mode
npm run dev

# Or production mode
npm start
```

## Step 5: Test the Agent

1. Open http://localhost:3000 in your browser
2. Upload the included `test-contract.txt` file
3. Watch the multi-step workflow in action!

## Troubleshooting

### "Ollama not responding"
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not, start it
ollama serve
```

### "Model not found"
```bash
# List installed models
ollama list

# Pull missing models
ollama pull llama3.1:8b
ollama pull nomic-embed-text
```

### "Database connection failed"
- Check your TiDB credentials in `.env`
- Ensure your TiDB Serverless cluster is running
- Verify network connectivity

## What Happens Next?

The agent will:
1. 📥 **Ingest** your contract and create vector embeddings
2. 🔍 **Search** for similar clauses in the database
3. 🧠 **Analyze** risks using the local LLM
4. 📊 **Generate** a comprehensive risk report
5. 📢 **Send** notifications (if Slack is configured)

All processing happens locally with your private Ollama instance - no data leaves your machine!

## Performance Tips

- **8GB RAM**: Use `mistral:7b` instead of `llama3.1:8b`
- **16GB+ RAM**: `llama3.1:8b` works great
- **32GB+ RAM**: Try `llama3.1:70b` for best quality

Edit your `.env` file to change models:
```bash
OLLAMA_MODEL=mistral:7b  # For lower RAM usage
```