import express, { type Request, type Response } from 'express'
import { createChoice, getAllChoices } from '../db'

const router = express.Router()

router.post('/', async (req: Request, res: Response) => {
  try {
    const { choice } = req.body
    if (!choice || !['A', 'B', 'C', 'D'].includes(choice)) {
      return res.status(400).json({ success: false, error: 'Invalid choice' })
    }
    
    const ip = req.ip || req.socket.remoteAddress || ''
    
    await createChoice(choice as 'A' | 'B' | 'C' | 'D', ip)
    
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to save choice' })
  }
})

router.get('/', async (req: Request, res: Response) => {
  try {
    const choices = await getAllChoices()
    res.json({ success: true, choices })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get choices' })
  }
})

export default router