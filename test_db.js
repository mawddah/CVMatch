const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function getPgVersion() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        const result = await sql`SELECT version()`;
        console.log('Successfully connected to Neon Postgres!');
        console.log('PostgreSQL version:', result[0].version);
    } catch (error) {
        console.error('Error connecting to Neon Postgres:', error);
    }
}

getPgVersion();
