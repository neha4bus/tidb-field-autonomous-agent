const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Testing TiDB connection...');
  console.log(`Host: ${process.env.TIDB_HOST}`);
  console.log(`Port: ${process.env.TIDB_PORT}`);
  console.log(`User: ${process.env.TIDB_USER}`);
  console.log(`Database: ${process.env.TIDB_DATABASE}`);
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      port: process.env.TIDB_PORT,
      user: process.env.TIDB_USER,
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE,
      ssl: {
        rejectUnauthorized: false
      },
      connectTimeout: 30000
    });
    
    console.log('✅ Connection successful!');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query test successful:', rows);
    
    // Check if database exists
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('📋 Available databases:', databases.map(db => db.Database));
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    
    if (error.code === 'ETIMEDOUT') {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Check if your TiDB cluster is running');
      console.log('2. Verify your network connection');
      console.log('3. Check if firewall is blocking the connection');
      console.log('4. Ensure your TiDB credentials are correct');
    }
  }
}

testConnection();