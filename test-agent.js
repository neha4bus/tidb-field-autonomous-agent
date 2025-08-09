#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const BASE_URL = 'http://localhost:3000';

async function testAgent() {
  console.log('🧪 Testing Smart Contract Analysis Agent...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.status);

    // Test 2: Analyze sample contract
    console.log('\n2️⃣ Testing contract analysis...');
    const contractContent = fs.readFileSync('test-contract.txt', 'utf8');
    
    const analysisResponse = await axios.post(`${BASE_URL}/analyze`, {
      title: 'Test Software Development Agreement',
      content: contractContent,
      metadata: { source: 'test', type: 'software-dev' }
    });

    if (analysisResponse.data.success) {
      console.log('✅ Contract analysis completed!');
      console.log('📊 Risk Level:', analysisResponse.data.analysis.riskLevel);
      console.log('🔍 Similar clauses found:', analysisResponse.data.similarClauses);
      console.log('📝 Workflow steps:', Object.keys(analysisResponse.data.workflow).length);
    } else {
      console.log('❌ Analysis failed:', analysisResponse.data.error);
    }

    // Test 3: Check history
    console.log('\n3️⃣ Testing analysis history...');
    const historyResponse = await axios.get(`${BASE_URL}/history?limit=3`);
    
    if (historyResponse.data.success) {
      console.log('✅ History retrieved:', historyResponse.data.count, 'records');
    } else {
      console.log('❌ History failed:', historyResponse.data.error);
    }

    console.log('\n🎉 All tests passed! The agent is working correctly.');
    console.log('🌐 Open http://localhost:3000 to use the web interface.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the agent is running:');
      console.log('   npm start');
    } else if (error.response) {
      console.log('📄 Error details:', error.response.data);
    }
    
    process.exit(1);
  }
}

// Check if server is running first
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`);
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  const isRunning = await checkServer();
  
  if (!isRunning) {
    console.log('🚀 Starting the agent server...');
    console.log('Please run: npm start');
    console.log('Then run this test again: node test-agent.js');
    return;
  }

  await testAgent();
}

if (require.main === module) {
  main();
}