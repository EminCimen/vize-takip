import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { sanitizeFileName } from '@/utils/fileUtils'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const docId = formData.get('docId') as string
    const docTitle = formData.get('docTitle') as string
    const userId = formData.get('userId') as string || 'default'

    if (!file || !docId || !docTitle) {
      return NextResponse.json({ error: 'File, docId and docTitle are required' }, { status: 400 })
    }

    // Create directories if they don't exist
    const uploadDir = path.join(process.cwd(), 'data', 'files', userId)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate clean filename based on document title
    const fileExtension = path.extname(file.name)
    const cleanTitle = sanitizeFileName(docTitle)
    const fileName = `${cleanTitle}${fileExtension}`
    const filePath = path.join(uploadDir, fileName)
    
    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    return NextResponse.json({ 
      success: true, 
      fileName,
      size: file.size,
      type: file.type
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}