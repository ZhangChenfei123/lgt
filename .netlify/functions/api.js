const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'ZhangChenfei123';
const REPO_NAME = 'lgt';
const CHOICES_PATH = 'data/choices.json';
const HANGZHOU_PATH = 'data/hangzhou.json';
async function fetchGitHubFile(path) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
            },
        });
        if (response.status === 404) {
            return { content: '[]', sha: null };
        }
        const data = await response.json();
        if (data.content) {
            const decoded = Buffer.from(data.content, 'base64').toString('utf-8');
            return { content: decoded, sha: data.sha };
        }
        return { content: '[]', sha: null };
    }
    catch (error) {
        console.error('Failed to fetch from GitHub:', error);
        return { content: '[]', sha: null };
    }
}
async function writeGitHubFile(path, content, sha) {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
    const encodedContent = Buffer.from(content, 'utf-8').toString('base64');
    const body = sha
        ? {
            message: `Update ${path}`,
            content: encodedContent,
            sha: sha,
        }
        : {
            message: `Create ${path}`,
            content: encodedContent,
        };
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        return response.ok;
    }
    catch (error) {
        console.error('Failed to write to GitHub:', error);
        return false;
    }
}
async function getChoices() {
    const result = await fetchGitHubFile(CHOICES_PATH);
    try {
        return JSON.parse(result.content);
    }
    catch {
        return [];
    }
}
async function saveChoice(choice) {
    const result = await fetchGitHubFile(CHOICES_PATH);
    const choices = JSON.parse(result.content) || [];
    choices.push(choice);
    return writeGitHubFile(CHOICES_PATH, JSON.stringify(choices, null, 2), result.sha);
}
async function getHangzhouRecords() {
    const result = await fetchGitHubFile(HANGZHOU_PATH);
    try {
        return JSON.parse(result.content);
    }
    catch {
        return [];
    }
}
async function saveHangzhouRecord(record) {
    const result = await fetchGitHubFile(HANGZHOU_PATH);
    const records = JSON.parse(result.content) || [];
    records.push(record);
    return writeGitHubFile(HANGZHOU_PATH, JSON.stringify(records, null, 2), result.sha);
}
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
        const choices = await getChoices();
        const nextId = choices.length > 0 ? Math.max(...choices.map(c => c.id)) + 1 : 1;
        const newChoice = {
            id: nextId,
            choice: choice,
            createdAt: new Date().toISOString(),
            ip: ip,
        };
        const success = await saveChoice(newChoice);
        return jsonResponse({ success });
    }
    if (path === '/api/choices' && httpMethod === 'GET') {
        const choices = await getChoices();
        return jsonResponse({ success: true, choices: [...choices].reverse() });
    }
    if (path === '/api/hangzhou' && httpMethod === 'POST') {
        const { content } = body;
        if (!content || content.trim().length === 0) {
            return jsonResponse({ success: false, error: 'Content is required' }, 400);
        }
        const records = await getHangzhouRecords();
        const nextId = records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1;
        const newRecord = {
            id: nextId,
            content: content.trim(),
            createdAt: new Date().toISOString(),
            ip: ip,
        };
        const success = await saveHangzhouRecord(newRecord);
        return jsonResponse({ success });
    }
    if (path === '/api/hangzhou' && httpMethod === 'GET') {
        const records = await getHangzhouRecords();
        return jsonResponse({ success: true, records: [...records].reverse() });
    }
    if (path === '/api/health' && httpMethod === 'GET') {
        return jsonResponse({ success: true, message: 'ok' });
    }
    return jsonResponse({ success: false, error: 'Not found' }, 404);
};
export { handler };
