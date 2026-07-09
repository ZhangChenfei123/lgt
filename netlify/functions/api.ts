import { Handler, Context } from '@netlify/functions'
import express from 'express'
import cors from 'cors'
import serverless from 'serverless-http'
import fs from 'fs'
import path from 'path'

const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

const dataDir = path.join(__dirname, '../../data')
const choicesDbPath = path.join(dataDir, 'choices.json')
const hangzhouDbPath = path.join(dataDir, 'hangzhou.json')

interface Choice {
  id: number
  choice: 'A' | 'B' | 'C' | 'D'
  createdAt: string
  ip: string
}

interface HangzhouRecord {
  id: number
  content: string
  createdAt: string
  ip: string
}

let choices: Choice[] = []
let hangzhouRecords: HangzhouRecord[] = []
let nextChoiceId = 1
let nextHangzhouId = 1

function loadData(): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  
  if (fs.existsSync(choicesDbPath)) {
    try {
      const content = fs.readFileSync(choicesDbPath, 'utf-8')
      choices = JSON.parse(content)
      nextChoiceId = choices.length > 0 ? Math.max(...choices.map(c => c.id)) + 1 : 1
    } catch {
      choices = []
    }
  }
  
  if (fs.existsSync(hangzhouDbPath)) {
    try {
      const content = fs.readFileSync(hangzhouDbPath, 'utf-8')
      hangzhouRecords = JSON.parse(content)
      nextHangzhouId = hangzhouRecords.length > 0 ? Math.max(...hangzhouRecords.map(r => r.id)) + 1 : 1
    } catch {
      hangzhouRecords = []
    }
  }
}

loadData()

app.post('/api/choices', (req, res) => {
  try {
    const { choice } = req.body
    if (!choice || !['A', 'B', 'C', 'D'].includes(choice)) {
      return res.status(400).json({ success: false, error: 'Invalid choice' })
    }
    
    const ip = req.headers['x-nf-client-connection-ip'] || 'unknown'
    
    const newChoice: Choice = {
      id: nextChoiceId++,
      choice: choice as 'A' | 'B' | 'C' | 'D',
      createdAt: new Date().toISOString(),
      ip: ip as string,
    }
    choices.push(newChoice)
    fs.writeFileSync(choicesDbPath, JSON.stringify(choices, null, 2))
    
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to save choice' })
  }
})

app.get('/api/choices', (req, res) => {
  try {
    res.json({ success: true, choices: [...choices].reverse() })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get choices' })
  }
})

app.post('/api/hangzhou', (req, res) => {
  try {
    const { content } = req.body
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Content is required' })
    }
    
    const ip = req.headers['x-nf-client-connection-ip'] || 'unknown'
    
    const newRecord: HangzhouRecord = {
      id: nextHangzhouId++,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      ip: ip as string,
    }
    hangzhouRecords.push(newRecord)
    fs.writeFileSync(hangzhouDbPath, JSON.stringify(hangzhouRecords, null, 2))
    
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to save record' })
  }
})

app.get('/api/hangzhou', (req, res) => {
  try {
    res.json({ success: true, records: [...hangzhouRecords].reverse() })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get records' })
  }
})

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'ok' })
})

const handler: Handler = (event, context) => {
  const serverlessHandler = serverless(app)
  return serverlessHandler(event, context)
}

export { handler }