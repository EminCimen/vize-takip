import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const PROGRESS_FILE = path.join(process.cwd(), 'data', 'progress.json')

type DocumentProgress = {
  completed: boolean
  uploadedAt?: string
  fileName?: string
  fileSize?: number
  fileType?: string
}

type UserProgress = {
  documents: Record<string, DocumentProgress>
  lastUpdate: string
}

type ProgressData = Record<string, UserProgress>

async function readProgress(): Promise<ProgressData> {
  try {
    if (!existsSync(PROGRESS_FILE)) {
      // Create data directory if it doesn't exist
      const dataDir = path.dirname(PROGRESS_FILE)
      if (!existsSync(dataDir)) {
        await mkdir(dataDir, { recursive: true })
      }
      return {}
    }
    const data = await readFile(PROGRESS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading progress:', error)
    return {}
  }
}

async function writeProgress(data: ProgressData): Promise<void> {
  try {
    await writeFile(PROGRESS_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing progress:', error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'default'
    
    const progressData = await readProgress()
    const userProgress = progressData[userId] || { documents: {}, lastUpdate: new Date().toISOString() }
    
    return NextResponse.json(userProgress)
  } catch (error) {
    console.error('Get progress error:', error)
    return NextResponse.json({ error: 'Failed to get progress' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId = 'default', docId, documentData } = await request.json()
    
    const progressData = await readProgress()
    
    if (!progressData[userId]) {
      progressData[userId] = { documents: {}, lastUpdate: new Date().toISOString() }
    }
    
    progressData[userId].documents[docId] = {
      ...progressData[userId].documents[docId],
      ...documentData,
      completed: documentData.completed || false
    }
    progressData[userId].lastUpdate = new Date().toISOString()
    
    await writeProgress(progressData)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update progress error:', error)
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}