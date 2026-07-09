import { Handler } from '@netlify/functions'

interface Choice {
  id: number
  choice: 'A' | 'B' | 'C' | 'D'
  created_at: string
  ip: string
}

interface HangzhouRecord {
  id: number
  content: string
  created_at: string
  ip: string
}

interface DataStore {
  choices: Choice[]
  hangzhou: HangzhouRecord[]
}

const GITHUB_REPO = 'ZhangChenfei123/lgt'
const DATA_FILE_PATH = 'data/choices.json'

async function getData(): Promise<DataStore> {
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${DATA_FILE_PATH}`)
    if (response.ok) {
      const data = await response.json()
      const content = Buffer.from(data.content, 'base64').toString('utf-8')
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed)) {
        return { choices: parsed, hangzhou: [] }
      }
      return { choices: parsed.choices || [], hangzhou: parsed.hangzhou || [] }
    } else if (response.status === 404) {
      return { choices: [], hangzhou: [] }
    }
    return { choices: [], hangzhou: [] }
  } catch {
    return { choices: [], hangzhou: [] }
  }
}

async function saveData(data: DataStore): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.GITHUB_TOKEN) {
      return { success: false, error: 'GITHUB_TOKEN not set' }
    }

    const existingResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${DATA_FILE_PATH}`)
    let sha = ''
    
    if (existingResponse.ok) {
      const existingData = await existingResponse.json()
      sha = existingData.sha
    } else if (existingResponse.status !== 404) {
      const errorData = await existingResponse.json()
      return { success: false, error: `Failed to get existing file: ${errorData.message || existingResponse.status}` }
    }

    const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64')
    
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${DATA_FILE_PATH}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      },
      body: JSON.stringify({
        message: 'Update choices data',
        content,
        sha,
      }),
    })
    
    if (response.ok) {
      return { success: true }
    } else {
      const errorData = await response.json()
      return { success: false, error: errorData.message || `HTTP ${response.status}` }
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Unknown error' }
  }
}

function jsonResponse(data: any, statusCode = 200) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
    body: JSON.stringify(data),
  }
}

const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse({ success: true }, 200)
  }

  const { path, httpMethod } = event
  let body: any = {}
  try {
    body = event.body ? JSON.parse(event.body) : {}
  } catch (parseError) {
    console.error('Failed to parse body:', parseError)
    return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400)
  }
  const ip = event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for'] || 'unknown'

  const pathMatch = (pattern: string) => {
    return path === pattern || path.endsWith(pattern)
  }

  if (pathMatch('/api/choices') && httpMethod === 'POST') {
    const { choice } = body
    if (!choice || !['A', 'B', 'C', 'D'].includes(choice)) {
      return jsonResponse({ success: false, error: 'Invalid choice' }, 400)
    }

    try {
      const data = await getData()
      const newChoice: Choice = {
        id: Date.now(),
        choice: choice as 'A' | 'B' | 'C' | 'D',
        created_at: new Date().toISOString(),
        ip,
      }
      data.choices.unshift(newChoice)
      const saveResult = await saveData(data)
      if (saveResult.success) {
        return jsonResponse({ success: true, choice: newChoice })
      } else {
        return jsonResponse({ success: false, error: 'Failed to save choice', details: saveResult.error }, 500)
      }
    } catch (error: any) {
      console.error('Failed to save choice:', error)
      return jsonResponse({ success: false, error: 'Failed to save choice', details: error.message }, 500)
    }
  }

  if (pathMatch('/api/choices') && httpMethod === 'GET') {
    try {
      const data = await getData()
      return jsonResponse({ success: true, choices: data.choices })
    } catch (error: any) {
      console.error('Failed to get choices:', error)
      return jsonResponse({ success: false, error: 'Failed to get choices', details: error.message }, 500)
    }
  }

  if (pathMatch('/api/hangzhou') && httpMethod === 'POST') {
    const { content } = body
    if (!content || content.trim().length === 0) {
      return jsonResponse({ success: false, error: 'Content is required' }, 400)
    }

    try {
      const data = await getData()
      const newRecord: HangzhouRecord = {
        id: Date.now(),
        content: content.trim(),
        created_at: new Date().toISOString(),
        ip,
      }
      data.hangzhou.unshift(newRecord)
      const saveResult = await saveData(data)
      if (saveResult.success) {
        return jsonResponse({ success: true, record: newRecord })
      } else {
        return jsonResponse({ success: false, error: 'Failed to save record', details: saveResult.error }, 500)
      }
    } catch (error: any) {
      console.error('Failed to save hangzhou record:', error)
      return jsonResponse({ success: false, error: 'Failed to save record', details: error.message }, 500)
    }
  }

  if (pathMatch('/api/hangzhou') && httpMethod === 'GET') {
    try {
      const data = await getData()
      return jsonResponse({ success: true, records: data.hangzhou })
    } catch (error: any) {
      console.error('Failed to get hangzhou records:', error)
      return jsonResponse({ success: false, error: 'Failed to get records', details: error.message }, 500)
    }
  }

  if (pathMatch('/api/health') && httpMethod === 'GET') {
    return jsonResponse({ success: true, message: 'ok' })
  }

  return jsonResponse({ success: false, error: 'Not found' }, 404)
}

export { handler }
