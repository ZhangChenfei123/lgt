import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dataDir = path.join(__dirname, '../data')
const choicesDbPath = path.join(dataDir, 'choices.json')
const hangzhouDbPath = path.join(dataDir, 'hangzhou.json')

export interface Choice {
  id: number
  choice: 'A' | 'B' | 'C' | 'D'
  createdAt: string
  ip: string
}

export interface HangzhouRecord {
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

export async function createChoice(choice: 'A' | 'B' | 'C' | 'D', ip: string): Promise<void> {
  const newChoice: Choice = {
    id: nextChoiceId++,
    choice,
    createdAt: new Date().toISOString(),
    ip,
  }
  choices.push(newChoice)
  fs.writeFileSync(choicesDbPath, JSON.stringify(choices, null, 2))
}

export async function getAllChoices(): Promise<Choice[]> {
  return [...choices].reverse()
}

export async function createHangzhouRecord(content: string, ip: string): Promise<void> {
  const newRecord: HangzhouRecord = {
    id: nextHangzhouId++,
    content,
    createdAt: new Date().toISOString(),
    ip,
  }
  hangzhouRecords.push(newRecord)
  fs.writeFileSync(hangzhouDbPath, JSON.stringify(hangzhouRecords, null, 2))
}

export async function getAllHangzhouRecords(): Promise<HangzhouRecord[]> {
  return [...hangzhouRecords].reverse()
}