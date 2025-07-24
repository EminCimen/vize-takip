import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export async function DELETE(request: NextRequest) {
  try {
    const { docId, userId = 'default' } = await request.json()

    if (!docId) {
      return NextResponse.json({ error: 'docId is required' }, { status: 400 })
    }

    // Read progress to get file name
    const progressFile = path.join(process.cwd(), 'data', 'progress.json')
    let progressData: Record<string, {documents: Record<string, {fileName?: string; completed?: boolean}>, lastUpdate?: string}> = {}
    
    if (existsSync(progressFile)) {
      const { readFile } = await import('fs/promises')
      const data = await readFile(progressFile, 'utf-8')
      progressData = JSON.parse(data)
    }

    const fileName = progressData[userId]?.documents[docId]?.fileName
    
    if (fileName) {
      const filePath = path.join(process.cwd(), 'data', 'files', userId, fileName)
      
      // Delete file if exists
      if (existsSync(filePath)) {
        await unlink(filePath)
      }
    }

    // Update progress - mark as not completed and remove file info
    if (progressData[userId]) {
      progressData[userId].documents[docId] = {
        completed: false
      }
      progressData[userId].lastUpdate = new Date().toISOString()
      
      const { writeFile } = await import('fs/promises')
      await writeFile(progressFile, JSON.stringify(progressData, null, 2))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}