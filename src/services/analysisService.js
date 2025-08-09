const { Ollama } = require('ollama');

class AnalysisService {
  constructor() {
    this.ollama = new Ollama({
      host: process.env.OLLAMA_HOST || 'http://localhost:11434',
      timeout: 120000 // 2 minutes timeout
    });
    this.model = process.env.OLLAMA_MODEL || 'llama3.1:8b';
  }

  async analyzeContract(contractContent, similarClauses = []) {
    const prompt = `You are a legal contract analysis expert. Analyze the provided contract and identify potential risks, compliance issues, and recommendations.

Contract to analyze:
${contractContent}

${similarClauses.length > 0 ? `
Similar clauses from previous contracts:
${similarClauses.map((clause, i) => `${i + 1}. ${clause.content.substring(0, 500)}...`).join('\n')}
` : ''}

Please provide a comprehensive analysis in the following JSON format:
{
  "riskLevel": "High|Medium|Low",
  "risks": ["list of identified risks"],
  "compliance": ["compliance issues found"],
  "recommendations": ["recommendations for improvement"],
  "summary": "brief executive summary"
}

Respond only with valid JSON:`;

    try {
      console.log('🤖 Calling Ollama for contract analysis...');
      
      const response = await Promise.race([
        this.ollama.generate({
          model: this.model,
          prompt: prompt,
          options: {
            temperature: 0.3,
            num_predict: 800
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Ollama request timeout')), 90000)
        )
      ]);

      // Try to parse JSON response
      const jsonMatch = response.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ Contract analysis completed successfully');
        return parsed;
      }
      
      // Fallback if JSON parsing fails
      throw new Error('Invalid JSON response from LLM');
      
    } catch (error) {
      console.error('⚠️ Error in contract analysis:', error.message);
      // Fallback structured response
      return {
        riskLevel: "Medium",
        risks: ["Automated analysis unavailable - Ollama connection timeout"],
        compliance: ["Manual review required due to system limitations"],
        recommendations: ["Review contract manually", "Check Ollama service status"],
        summary: "Analysis completed with fallback due to LLM service timeout. Manual review recommended."
      };
    }
  }

  async generateRiskReport(analysis, contractTitle) {
    const prompt = `Generate a professional risk assessment report based on the following contract analysis:

Contract: ${contractTitle}
Risk Level: ${analysis.riskLevel}
Risks: ${analysis.risks?.join(', ') || 'None identified'}
Compliance Issues: ${analysis.compliance?.join(', ') || 'None identified'}
Recommendations: ${analysis.recommendations?.join(', ') || 'None provided'}

Create a concise executive summary suitable for stakeholders (2-3 paragraphs):`;

    try {
      console.log('📊 Generating risk assessment report...');
      
      const response = await Promise.race([
        this.ollama.generate({
          model: this.model,
          prompt: prompt,
          options: {
            temperature: 0.2,
            num_predict: 400
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Report generation timeout')), 60000)
        )
      ]);

      console.log('✅ Risk report generated successfully');
      return response.response;
    } catch (error) {
      console.error('⚠️ Error generating report:', error.message);
      return `RISK ASSESSMENT REPORT
      
Contract: ${contractTitle}
Risk Level: ${analysis.riskLevel}
      
EXECUTIVE SUMMARY:
${analysis.summary}

IDENTIFIED RISKS:
${analysis.risks?.map(risk => `• ${risk}`).join('\n') || '• No specific risks identified'}

COMPLIANCE ISSUES:
${analysis.compliance?.map(issue => `• ${issue}`).join('\n') || '• No compliance issues found'}

RECOMMENDATIONS:
${analysis.recommendations?.map(rec => `• ${rec}`).join('\n') || '• No specific recommendations'}

Note: This report was generated with fallback formatting due to AI service limitations. Manual review recommended for critical contracts.`;
    }
  }
}

module.exports = AnalysisService;