const mysql = require('mysql2/promise');
require('dotenv').config();

class DatabaseConfig {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.TIDB_HOST,
      port: process.env.TIDB_PORT,
      user: process.env.TIDB_USER,
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE,
      ssl: {
        rejectUnauthorized: false
      },
      connectionLimit: 5,
      acquireTimeout: 30000,
      timeout: 30000,
      connectTimeout: 30000
    });
  }

  async getConnection() {
    return await this.pool.getConnection();
  }

  async query(sql, params = []) {
    const connection = await this.getConnection();
    try {
      const [results] = await connection.execute(sql, params);
      return results;
    } finally {
      connection.release();
    }
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = new DatabaseConfig();