const VectorService = require('../services/vectorService');
const AnalysisService = require('../services/analysisService');
const NotificationService = require('../services/notificationService');
const db = require('../config/database');

class ContractAgent {
  constructor() {
    this.vectorService = new VectorService();
    this.analysisService = new AnalysisService();
    this.notificationService = new NotificationService();
  }

  async processContract(contractData) {
    const { title, content, metadata = {} } = contractData;
    
    console.log(`🤖 Starting contract analysis for: ${title}`);
    
    let documentId = null; // Initialize documentId outside try block
    
    try {
      // Step 1: Ingest & Index - Store document with vector embeddings
      console.log('📥 Step 1: Ingesting and indexing document...');
      documentId = await this.vectorService.storeDocument(title, content, {
        ...metadata,
        processedAt: new Date().toISOString(),
        status: 'processing'
      });
      
      // Step 2: Search - Find similar contract clauses
      console.log('🔍 Step 2: Searching for similar contract clauses...');
      const similarClauses = await this.vectorService.findSimilarDocuments(
        content.substring(0, 1000), // Use first 1000 chars for similarity search
        5,
        0.8
      );
      
      // Step 3: Chain LLM Calls - Analyze contract with AI
      console.log('🧠 Step 3: Performing AI-powered contract analysis...');
      const analysis = await this.analysisService.analyzeContract(content, similarClauses);
      
      // Step 4: Generate comprehensive report
      console.log('📊 Step 4: Generating risk assessment report...');
      const report = await this.analysisService.generateRiskReport(analysis, title);
      
      // Step 5: Store analysis results
      console.log('💾 Step 5: Storing analysis results...');
      await this.storeAnalysisResults(documentId, analysis, report);
      
      // Step 6: External Tools - Send notifications
      console.log('📢 Step 6: Sending notifications...');
      await this.notificationService.sendSlackAlert(
        title,
        analysis.riskLevel,
        analysis.summary
      );
      
      // Step 7: Update document status
      await this.updateDocumentStatus(documentId, 'completed');
      
      console.log('✅ Contract analysis workflow completed successfully!');
      
      return {
        success: true,
        documentId,
        analysis,
        report,
        similarClauses: similarClauses.length,
        workflow: {
          step1: 'Document ingested and indexed',
          step2: `Found ${similarClauses.length} similar clauses`,
          step3: 'AI analysis completed',
          step4: 'Risk report generated',
          step5: 'Results stored in database',
          step6: 'Notifications sent',
          step7: 'Workflow completed'
        }
      };
      
    } catch (error) {
      console.error('❌ Error in contract processing workflow:', error);
      
      // Update status to failed if document was created
      if (documentId) {
        await this.updateDocumentStatus(documentId, 'failed');
      }
      
      throw error;
    }
  }

  async storeAnalysisResults(documentId, analysis, report) {
    const sql = `
      INSERT INTO contract_analyses (document_id, analysis_data, risk_report, created_at)
      VALUES (?, ?, ?, NOW())
    `;
    
    return await db.query(sql, [
      documentId,
      JSON.stringify(analysis),
      report
    ]);
  }

  async updateDocumentStatus(documentId, status) {
    const sql = `
      UPDATE documents 
      SET metadata = JSON_SET(metadata, '$.status', ?)
      WHERE id = ?
    `;
    
    return await db.query(sql, [status, documentId]);
  }

  async getAnalysisHistory(limit = 10) {
    // Ensure limit is a valid integer
    const validLimit = Math.max(1, Math.min(100, parseInt(limit) || 10));
    
    const sql = `
      SELECT 
        d.id,
        d.title,
        d.created_at,
        ca.analysis_data,
        ca.risk_report,
        JSON_EXTRACT(d.metadata, '$.status') as status
      FROM documents d
      LEFT JOIN contract_analyses ca ON d.id = ca.document_id
      ORDER BY d.created_at DESC
      LIMIT ${validLimit}
    `;
    
    return await db.query(sql, []);
  }
}

module.exports = ContractAgent;