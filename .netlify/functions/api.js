import { Pool } from 'pg';
const pool = new Pool({
    host: 'db.tlwjwaselavdokiqvuew.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'Zgl@1812342754',
});
async function initTables() {
    try {
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
    const body = event.body ? JSON.parse(event.body) : {};
    const ip = event.headers['x-nf-client-connection-ip'] || 'unknown';
    if (path === '/api/choices' && httpMethod === 'POST') {
        const { choice } = body;
        if (!choice || !['A', 'B', 'C', 'D'].includes(choice)) {
            return jsonResponse({ success: false, error: 'Invalid choice' }, 400);
        }
        try {
            await pool.query('INSERT INTO choices (choice, ip) VALUES ($1, $2)', [choice, ip]);
            return jsonResponse({ success: true });
        }
        catch (error) {
            console.error('Failed to save choice:', error);
            return jsonResponse({ success: false, error: 'Failed to save choice' }, 500);
        }
    }
    if (path === '/api/choices' && httpMethod === 'GET') {
        try {
            const result = await pool.query('SELECT * FROM choices ORDER BY created_at DESC');
            return jsonResponse({ success: true, choices: result.rows });
        }
        catch (error) {
            console.error('Failed to get choices:', error);
            return jsonResponse({ success: false, error: 'Failed to get choices' }, 500);
        }
    }
    if (path === '/api/hangzhou' && httpMethod === 'POST') {
        const { content } = body;
        if (!content || content.trim().length === 0) {
            return jsonResponse({ success: false, error: 'Content is required' }, 400);
        }
        try {
            await pool.query('INSERT INTO hangzhou (content, ip) VALUES ($1, $2)', [content.trim(), ip]);
            return jsonResponse({ success: true });
        }
        catch (error) {
            console.error('Failed to save hangzhou record:', error);
            return jsonResponse({ success: false, error: 'Failed to save record' }, 500);
        }
    }
    if (path === '/api/hangzhou' && httpMethod === 'GET') {
        try {
            const result = await pool.query('SELECT * FROM hangzhou ORDER BY created_at DESC');
            return jsonResponse({ success: true, records: result.rows });
        }
        catch (error) {
            console.error('Failed to get hangzhou records:', error);
            return jsonResponse({ success: false, error: 'Failed to get records' }, 500);
        }
    }
    if (path === '/api/health' && httpMethod === 'GET') {
        return jsonResponse({ success: true, message: 'ok' });
    }
    return jsonResponse({ success: false, error: 'Not found' }, 404);
};
export { handler };
