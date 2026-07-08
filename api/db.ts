import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dataDir = path.join(__dirname, '../data')
const dbPath = path.join(dataDir, 'choices.json')

export interface Choice {
  id: number
  choice: 'A' | 'B' | 'C' | 'D'
  createdAt: string
  ip: string
}

let choices: Choice[] = []
let nextId = 1

function loadData(): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  if (fs.existsSync(dbPath)) {
    try {
      const content = fs.readFileSync(dbPath, 'utf-8')
      choices = JSON.parse(content)
      nextId = choices.length > 0 ? Math.max(...choices.map(c => c.id)) + 1 : 1
    } catch {
      choices = []
    }
  }
}

function saveData(): void {
  fs.writeFileSync(dbPath, JSON.stringify(choices, null, 2))
}

loadData()

export async function createChoice(choice: 'A' | 'B' | 'C' | 'D', ip: string): Promise<void> {
  const newChoice: Choice = {
    id: nextId++,
    choice,
    createdAt: new Date().toISOString(),
    ip,
  }
  choices.push(newChoice)
  saveData()
}

export async function getAllChoices(): Promise<Choice[]> {
  return [...choices].reverse()
}