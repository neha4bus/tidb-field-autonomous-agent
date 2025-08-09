const { Ollama } = require('ollama');
const db = require('../config/database');

class VectorService {
  constructor() {
    this.ollama = new Ollama({
      host: process.env.OLLAMA_HOST || 'http://localhost:11434',
      timeout: 60000 // 1 minute timeout for embeddings
    });
    this.embeddingModel = process.env.EMBEDDING_MODEL || 'nomic-embed-text';
  }

  async generateEmbedding(text) {
    try {
      const response = await this.ollama.embeddings({
        model: this.embeddingModel,
        prompt: text
      });
      return response.embedding;
    } catch (error) {
      console.error('Error generating embedding with Ollama:', error);
      throw error;
    }
  }

  async storeDocument(title, content, metadata = {}) {
    const embedding = await this.generateEmbedding(content);
    const embeddingJson = JSON.stringify(embedding);
    
    const sql = `
      INSERT INTO documents (title, content, metadata, embedding, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    
    const result = await db.query(sql, [
      title,
      content,
      JSON.stringify(metadata),
      embeddingJson
    ]);
    
    return result.insertId;
  }

  async findSimilarDocuments(queryText, limit = 5, threshold = 0.8) {
    try {
      // Validate parameters
      const validLimit = Math.max(1, Math.min(50, parseInt(limit) || 5));
      
      // Generate embedding for semantic understanding (even if we can't use vector search yet)
      const queryEmbedding = await this.generateEmbedding(queryText);
      console.log(`🔍 Generated embedding for similarity search (${queryEmbedding.length} dimensions)`);
      
      // For now, use intelligent keyword-based similarity as fallback
      // Extract key terms from the query text for better matching
      const keywords = this.extractKeywords(queryText);
      console.log(`🔑 Extracted keywords: ${keywords.join(', ')}`);
      
      // Search using multiple keyword patterns for better similarity
      const sql = `
        SELECT 
          id,
          title,
          content,
          metadata,
          created_at,
          (
            CASE 
              WHEN title LIKE ? THEN 0.9
              WHEN content LIKE ? THEN 0.8
              WHEN content LIKE ? THEN 0.7
              ELSE 0.5
            END
          ) as similarity_score
        FROM documents
        WHERE title LIKE ? OR content LIKE ? OR content LIKE ?
        ORDER BY similarity_score DESC, created_at DESC
        LIMIT ${validLimit}
      `;
      
      const primaryKeyword = `%${keywords[0] || queryText.substring(0, 20)}%`;
      const secondaryKeyword = `%${keywords[1] || queryText.substring(20, 40)}%`;
      const generalPattern = `%${queryText.substring(0, 50)}%`;
      
      return await db.query(sql, [
        primaryKeyword, primaryKeyword, secondaryKeyword,
        primaryKeyword, primaryKeyword, secondaryKeyword
      ]);
      
    } catch (error) {
      console.error('Error in findSimilarDocuments:', error);
      console.log('Falling back to basic keyword search...');
      // Final fallback to simple keyword search
      return await this.searchByKeywords(queryText.substring(0, 50), limit);
    }
  }

  extractKeywords(text) {
    // Simple keyword extraction for better similarity matching
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['this', 'that', 'with', 'from', 'they', 'have', 'will', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other'].includes(word));
    
    // Return top 3 most relevant keywords
    return words.slice(0, 3);
  }

  async searchByKeywords(keywords, limit = 10) {
    // Ensure limit is a valid integer
    const validLimit = Math.max(1, Math.min(100, parseInt(limit) || 10));
    
    const sql = `
      SELECT id, title, content, metadata, created_at
      FROM documents
      WHERE title LIKE ? OR content LIKE ?
      ORDER BY created_at DESC
      LIMIT ${validLimit}
    `;
    
    const searchPattern = `%${keywords}%`;
    return await db.query(sql, [searchPattern, searchPattern]);
  }
}

module.exports = VectorService;