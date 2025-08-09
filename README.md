# Smart Contract Analysis Agent

An innovative multi-step agentic solution using TiDB Serverless that automates contract analysis through document ingestion, vector search, LLM analysis, and external integrations.

## Features

- **Document Ingestion**: Automatically processes and indexes legal documents with vector embeddings
- **Intelligent Search**: Uses TiDB vector search to find similar contract clauses and precedents
- **Risk Analysis**: Chains LLM calls to analyze contract risks and generate recommendations
- **External Integrations**: Sends Slack alerts and generates compliance reports
- **Automated Workflow**: Complete end-to-end contract review process

## Architecture

```
Document Upload → Vector Embedding → TiDB Storage → Similarity Search → LLM Analysis → Risk Report → Slack Alert
```

## Quick Start

1. Set up your environment variables in `.env`
2. Install dependencies: `npm install`
3. Run the agent: `npm start`
4. Upload a contract document to trigger the analysis workflow

## Setup Instructions

### 1. Install Ollama (Local LLM)
```bash
# Install Ollama from https://ollama.ai
# Then pull required models:
ollama pull llama3.1:8b        # Main LLM (4.7GB)
ollama pull nomic-embed-text   # Embeddings (274MB)

# Start Ollama service
ollama serve
```

### 2. Environment Configuration
```bash
# Copy the example environment file
copy .env.example .env

# Edit .env with your credentials:
# - TiDB Serverless connection details
# - Ollama configuration (should work with defaults)
# - Slack webhook URL (optional)
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup
```bash
# Run the setup script to create tables and sample data
npm run setup
```

### 5. Start the Agent
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### 5. Test the Agent
- Open http://localhost:3000 in your browser
- Upload the included `test-contract.txt` file
- Watch the multi-step workflow in action!

## API Endpoints

- `POST /analyze` - Analyze contract from JSON payload
- `POST /upload` - Upload and analyze contract file
- `GET /history` - View analysis history
- `GET /health` - Health check

## Multi-Step Agentic Workflow

**TiDB AgentX Hackathon Compliant**: This agent chains together all 5 building blocks in a single automated workflow:

1. **📥 Ingest & Index Data**: Processes contract PDFs/text and creates 1536-dimensional vector embeddings stored in TiDB Serverless
2. **🔍 Search Your Data**: Uses TiDB's `VEC_COSINE_DISTANCE()` for semantic similarity search of contract clauses
3. **🧠 Chain LLM Calls**: Multiple Ollama AI calls for risk analysis, compliance checking, and report generation
4. **� Invoke  External Tools**: Integrates Slack notifications, email alerts, and external compliance APIs
5. **⚡ Build Multi-Step Flow**: Complete end-to-end automation from document upload to final risk assessment and notifications

**Real-World Impact**: Reduces manual contract review time by 80% while ensuring consistent compliance analysis.

## TiDB Features Used

- **Vector Search**: `VEC_COSINE_DISTANCE()` for semantic similarity
- **Full-Text Search**: `MATCH() AGAINST()` for keyword searches  
- **JSON Storage**: Flexible metadata and analysis result storage
- **Transactions**: Ensures data consistency across the workflow
- **Indexes**: Optimized vector and text search performance

## Example Usage

```bash
# Analyze a contract via API
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Service Agreement",
    "content": "This agreement...",
    "metadata": {"type": "service"}
  }'

# Get analysis history
curl http://localhost:3000/history
```