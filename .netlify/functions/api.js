import { Pool } from 'pg';
const PROJECT_ID = 'tlwjwaselavdokiqvuew';
const PASSWORD = 'Zgl@1812342754';
const regions = ['ap-northeast-1', 'ap-southeast-1', 'us-east-1', 'eu-west-1', 'ap-south-1'];
let pool = null;
async function createPool() {
    for (const region of regions) {
        try {
            const config = {
                host: `aws-0-${region}.pooler.supabase.com`,
                port: 5432,
                database: 'postgres',
                user: `postgres.${PROJECT_ID}`,
                password: PASSWORD,
                ssl: { rejectUnauthorized: true },
                connectionTimeoutMillis: 5000,
            };
            const testPool = new Pool(config);
            await testPool.query('SELECT 1');
            pool = testPool;
            console.log(`Connected to region: ${region}`);
            return pool;
        }
        catch {
            console.log(`Failed to connect to region: ${region}`);
        }
    }
    throw new Error('Failed to connect to any region');
}
async function getPool() {
    if (!pool) {
        pool = await createPool();
    }
    return pool;
}
async function initTables() {
    try {
        const pool = await getPool();
        await pool.query(`
      CREATE TABLE IF NOT EXISTS choices (
        id SERIAL PRIMARY KEY,
        choice VARCHAR(1) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        ip VARCHAR(50)
      )
    `);
        await pool.query(`
      CREATE TABLE IF NOT EXISTS hangzhou (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        ip VARCHAR(50)
      )
    `);
    }
    catch (error) {
        console.error('Failed to init tables:', error);
    }
}
initTables();
function jsonResponse(data, statusCode = 200) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify(data),
    };
}
const handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return jsonResponse({ success: true }, 200);
    }
    const { path, httpMethod } = event;
    let body = {};
    try {
        body = event.body ? JSON.parse(event.body) : {};
    }
    catch (parseError) {
        console.error('Failed to parse body:', parseError);
        return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400);
    }
    const ip = event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for'] || 'unknown';
    const pathMatch = (pattern) => {
        return path === pattern || path.endsWith(pattern);
    };
    if (pathMatch('/api/choices') && httpMethod === 'POST') {
        const { choice } = body;
        if (!choice || !['A', 'B', 'C', 'D'].includes(choice)) {
            return jsonResponse({ success: false, error: 'Invalid choice' }, 400);
        }
        try {
            const pool = await getPool();
            const result = await pool.query('INSERT INTO choices (choice, ip) VALUES ($1, $2)', [choice, ip]);
            return jsonResponse({ success: true, rowCount: result.rowCount });
        }
        catch (error) {
            console.error('Failed to save choice:', error);
            pool = null;
            return jsonResponse({ success: false, error: 'Failed to save choice', details: error.message }, 500);
        }
    }
    if (pathMatch('/api/choices') && httpMethod === 'GET') {
        try {
            const pool = await getPool();
            const result = await pool.query('SELECT * FROM choices ORDER BY created_at DESC');
            return jsonResponse({ success: true, choices: result.rows });
        }
        catch (error) {
            console.error('Failed to get choices:', error);
            pool = null;
            return jsonResponse({ success: false, error: 'Failed to get choices', details: error.message }, 500);
        }
    }
    if (pathMatch('/api/hangzhou') && httpMethod === 'POST') {
        const { content } = body;
        if (!content || content.trim().length === 0) {
            return jsonResponse({ success: false, error: 'Content is required' }, 400);
        }
        try {
            const pool = await getPool();
            const result = await pool.query('INSERT INTO hangzhou (content, ip) VALUES ($1, $2)', [content.trim(), ip]);
            return jsonResponse({ success: true, rowCount: result.rowCount });
        }
        catch (error) {
            console.error('Failed to save hangzhou record:', error);
            pool = null;
            return jsonResponse({ success: false, error: 'Failed to save record', details: error.message }, 500);
        }
    }
    if (pathMatch('/api/hangzhou') && httpMethod === 'GET') {
        try {
            const pool = await getPool();
            const result = await pool.query('SELECT * FROM hangzhou ORDER BY created_at DESC');
            return jsonResponse({ success: true, records: result.rows });
        }
        catch (error) {
            console.error('Failed to get hangzhou records:', error);
            pool = null;
            return jsonResponse({ success: false, error: 'Failed to get records', details: error.message }, 500);
        }
    }
    if (pathMatch('/api/health') && httpMethod === 'GET') {
        return jsonResponse({ success: true, message: 'ok' });
    }
    return jsonResponse({ success: false, error: 'Not found' }, 404);
};
export { handler };
