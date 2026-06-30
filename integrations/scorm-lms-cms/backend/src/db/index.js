'use strict';
const { Pool } = require('pg');
const logger = require('../lib/logger');

const databaseSsl = process.env.DATABASE_SSL === 'true'
  ? { rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false' }
  : false;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DB_POOL_MAX || '20', 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS || '5000', 10),
  ssl: databaseSsl,
});

pool.on('error', (err) => {
  logger.error('Unexpected database client error', { error: err.message });
});

pool.on('connect', () => {
  logger.debug('New database client connected');
});

/**
 * Run a query with optional values.
 */
async function query(sql, values = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, values);
    return result;
  } finally {
    client.release();
  }
}

/**
 * Run multiple queries in a transaction.
 * @param {(client: import('pg').PoolClient) => Promise<any>} fn
 */
async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, withTransaction };
