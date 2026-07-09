import express, { type Request, type Response } from 'express'
import { createHangzhouRecord, getAllHangzhouRecords } from '../db'

const router = express.Router()

router.post('/', async (req: Request, res: Response) => {
  try {
    const { content } = req.body
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Content is required' })
    }
    
    const ip = req.ip || req.socket.remoteAddress || ''
    
    await createHangzhouRecord(content.trim(), ip)
    
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to save record' })
  }
})

router.get('/', async (req: Request, res: Response) => {
  try {
    const records = await getAllHangzhouRecords()
    res.json({ success: true, records })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get records' })
  }
})

export default router