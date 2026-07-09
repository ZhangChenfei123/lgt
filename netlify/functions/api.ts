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

const DATA_KEY = 'lgt_choices_data_v2'

async function getData(): Promise<DataStore> {
  try {
    const response = await fetch(`https://api.jsonstorage.net/v1/json/${DATA_KEY}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (response.ok) {
      const data = await response.json()
      return { choices: data.choices || [], hangzhou: data.hangzhou || [] }
    } else {
      return { choices: [], hangzhou: [] }
    }
  } catch {
    return { choices: [], hangzhou: [] }
  }
}

async function saveData(data: DataStore): Promise<boolean> {
  try {
    const response = await fetch(`https://api.jsonstorage.net/v1/json/${DATA_KEY}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return response.ok
  } catch {
    return false
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
      const success = await saveData(data)
      if (success) {
        return jsonResponse({ success: true, choice: newChoice })
      } else {
        return jsonResponse({ success: false, error: 'Failed to save choice' }, 500)
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
      const success = await saveData(data)
      if (success) {
        return jsonResponse({ success: true, record: newRecord })
      } else {
        return jsonResponse({ success: false, error: 'Failed to save record' }, 500)
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
