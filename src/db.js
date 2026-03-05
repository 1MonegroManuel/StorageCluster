const sql = require('mssql');
require('dotenv').config();

const connectionString = process.env.DB_CONNECTION_STRING;

const dbConfig = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE || 'StorageClusterMonitor',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 1433,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false'
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

let pool;

async function getConnection() {
    if (pool) {
        return pool;
    }

    pool = connectionString ? await sql.connect(connectionString) : await sql.connect(dbConfig);
    return pool;
}

module.exports = {
    sql,
    getConnection
};