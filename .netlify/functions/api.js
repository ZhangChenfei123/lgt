import fs from 'fs';
import path from 'path';
const dataDir = path.join(__dirname, '../../data');
const choicesDbPath = path.join(dataDir, 'choices.json');
const hangzhouDbPath = path.join(dataDir, 'hangzhou.json');
let choices = [];
let hangzhouRecords = [];
let nextChoiceId = 1;
let nextHangzhouId = 1;
function loadData() {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (fs.existsSync(choicesDbPath)) {
        try {
            const content = fs.readFileSync(choicesDbPath, 'utf-8');
            choices = JSON.parse(content);
            nextChoiceId = choices.length > 0 ? Math.max(...choices.map(c => c.id)) + 1 : 1;
        }
        catch {
            choices = [];
        }
    }
    if (fs.existsSync(hangzhouDbPath)) {
        try {
            const content = fs.readFileSync(hangzhouDbPath, 'utf-8');
            hangzhouRecords = JSON.parse(content);
            nextHangzhouId = hangzhouRecords.length > 0 ? Math.max(...hangzhouRecords.map(r => r.id)) + 1 : 1;
        }
        catch {
            hangzhouRecords = [];
        }
    }
}
loadData();
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
        const newChoice = {
            id: nextChoiceId++,
            choice: choice,
            createdAt: new Date().toISOString(),
            ip: ip,
        };
        choices.push(newChoice);
        fs.writeFileSync(choicesDbPath, JSON.stringify(choices, null, 2));
        return jsonResponse({ success: true });
    }
    if (path === '/api/choices' && httpMethod === 'GET') {
        return jsonResponse({ success: true, choices: [...choices].reverse() });
    }
    if (path === '/api/hangzhou' && httpMethod === 'POST') {
        const { content } = body;
        if (!content || content.trim().length === 0) {
            return jsonResponse({ success: false, error: 'Content is required' }, 400);
        }
        const newRecord = {
            id: nextHangzhouId++,
            content: content.trim(),
            createdAt: new Date().toISOString(),
            ip: ip,
        };
        hangzhouRecords.push(newRecord);
        fs.writeFileSync(hangzhouDbPath, JSON.stringify(hangzhouRecords, null, 2));
        return jsonResponse({ success: true });
    }
    if (path === '/api/hangzhou' && httpMethod === 'GET') {
        return jsonResponse({ success: true, records: [...hangzhouRecords].reverse() });
    }
    if (path === '/api/health' && httpMethod === 'GET') {
        return jsonResponse({ success: true, message: 'ok' });
    }
    return jsonResponse({ success: false, error: 'Not found' }, 404);
};
export { handler };
