const db = require('./config/database');

async function setupDatabase() {
  console.log('🚀 Setting up TiDB Serverless database...');
  
  try {
    // Create documents table with vector support
    console.log('📋 Creating documents table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        content LONGTEXT NOT NULL,
        metadata JSON,
        embedding JSON NOT NULL COMMENT 'Vector embedding for similarity search',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create contract analyses table
    console.log('📊 Creating contract_analyses table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS contract_analyses (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        document_id BIGINT NOT NULL,
        analysis_data JSON NOT NULL,
        risk_report LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
      )
    `);
    
    // Create indexes for faster searches (TiDB compatible)
    console.log('🔍 Creating search indexes...');
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_title ON documents (title)
    `);
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_created_at ON documents (created_at)
    `);
    
    // Create vector index for similarity search performance
    console.log('🎯 Creating vector index for embeddings...');
    try {
      await db.query(`
        ALTER TABLE documents ADD VECTOR INDEX vec_idx ((CAST(embedding AS VECTOR(1536))))
      `);
      console.log('✅ Vector index created successfully');
    } catch (error) {
      console.log('⚠️  Vector index creation skipped (may already exist or unsupported)');
    }
    
    // Insert sample contract data for testing
    console.log('📝 Inserting sample contract data...');
    const sampleContracts = [
      {
        title: "Software License Agreement - Template",
        content: `SOFTWARE LICENSE AGREEMENT

This Software License Agreement ("Agreement") is entered into between Company and Licensee.

1. GRANT OF LICENSE
Company grants Licensee a non-exclusive, non-transferable license to use the software.

2. RESTRICTIONS
Licensee shall not modify, distribute, or reverse engineer the software.

3. TERMINATION
This agreement may be terminated by either party with 30 days written notice.

4. LIABILITY
Company's liability is limited to the amount paid for the software license.`,
        metadata: { type: "template", category: "software" }
      },
      {
        title: "Service Agreement - Consulting",
        content: `CONSULTING SERVICE AGREEMENT

This Service Agreement is between Consultant and Client for professional services.

1. SCOPE OF WORK
Consultant will provide strategic consulting services as outlined in Exhibit A.

2. PAYMENT TERMS
Client agrees to pay consultant $150/hour for services rendered.

3. CONFIDENTIALITY
Both parties agree to maintain confidentiality of proprietary information.

4. INDEMNIFICATION
Each party shall indemnify the other against third-party claims arising from their actions.`,
        metadata: { type: "service", category: "consulting" }
      }
    ];
    
    for (const contract of sampleContracts) {
      const existing = await db.query('SELECT id FROM documents WHERE title = ?', [contract.title]);
      if (existing.length === 0) {
        // Generate embedding for sample data
        const { Ollama } = require('ollama');
        const ollama = new Ollama({
          host: process.env.OLLAMA_HOST || 'http://localhost:11434'
        });
        
        try {
          const response = await ollama.embeddings({
            model: process.env.EMBEDDING_MODEL || 'nomic-embed-text',
            prompt: contract.content
          });
          
          const embedding = JSON.stringify(response.embedding);
          
          await db.query(`
            INSERT INTO documents (title, content, metadata, embedding)
            VALUES (?, ?, ?, ?)
          `, [contract.title, contract.content, JSON.stringify(contract.metadata), embedding]);
          
          console.log(`✅ Inserted sample contract: ${contract.title}`);
        } catch (error) {
          console.log(`⚠️  Skipping sample data (Ollama not available): ${contract.title}`);
        }
      }
    }
    
    console.log('🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Copy .env.example to .env and configure your credentials');
    console.log('2. Run "npm install" to install dependencies');
    console.log('3. Run "npm start" to start the agent server');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };