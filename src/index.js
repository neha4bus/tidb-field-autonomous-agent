const express = require('express');
const multer = require('multer');
const cors = require('cors');
const pdfParse = require('pdf-parse');
const ContractAgent = require('./agent/contractAgent');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Initialize the contract agent
const contractAgent = new ContractAgent();

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Contract Analysis Agent',
    version: '1.0.0',
    endpoints: {
      'POST /analyze': 'Analyze a contract (JSON)',
      'POST /upload': 'Upload and analyze a contract file',
      'GET /history': 'Get analysis history',
      'GET /health': 'Health check'
    }
  });
});

app.post('/analyze', async (req, res) => {
  try {
    const { title, content, metadata } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        error: 'Title and content are required'
      });
    }
    
    console.log(`📄 Received contract analysis request: ${title}`);
    
    const result = await contractAgent.processContract({
      title,
      content,
      metadata
    });
    
    res.json(result);
    
  } catch (error) {
    console.error('Error processing contract:', error);
    res.status(500).json({
      error: 'Failed to process contract',
      message: error.message
    });
  }
});

app.post('/upload', upload.single('contract'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }
    
    const { originalname, mimetype, buffer } = req.file;
    let content = '';
    
    // Extract text based on file type
    if (mimetype === 'application/pdf') {
      const pdfData = await pdfParse(buffer);
      content = pdfData.text;
    } else if (mimetype === 'text/plain') {
      content = buffer.toString('utf-8');
    } else {
      return res.status(400).json({
        error: 'Unsupported file type. Please upload PDF or TXT files.'
      });
    }
    
    if (!content.trim()) {
      return res.status(400).json({
        error: 'No text content found in the uploaded file'
      });
    }
    
    console.log(`📎 Processing uploaded file: ${originalname}`);
    
    const result = await contractAgent.processContract({
      title: originalname,
      content: content.trim(),
      metadata: {
        originalFilename: originalname,
        mimeType: mimetype,
        fileSize: buffer.length,
        uploadedAt: new Date().toISOString()
      }
    });
    
    res.json(result);
    
  } catch (error) {
    console.error('Error processing uploaded file:', error);
    res.status(500).json({
      error: 'Failed to process uploaded file',
      message: error.message
    });
  }
});

app.get('/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const history = await contractAgent.getAnalysisHistory(limit);
    
    res.json({
      success: true,
      count: history.length,
      data: history
    });
    
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      error: 'Failed to fetch analysis history',
      message: error.message
    });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Smart Contract Analysis Agent running on port ${port}`);
  console.log(`📊 Dashboard: http://localhost:${port}`);
  console.log(`🔗 API endpoints available at http://localhost:${port}`);
  console.log('\n🤖 Agent ready to analyze contracts!');
});