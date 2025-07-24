import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; fileName: string }> }
) {
  try {
    const { userId, fileName } = await params
    const filePath = path.join(process.cwd(), 'data', 'files', userId, fileName)

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const fileBuffer = await readFile(filePath)
    const response = new NextResponse(fileBuffer)
    
    response.headers.set('Content-Disposition', `attachment; filename="${fileName}"`)
    response.headers.set('Content-Type', 'application/octet-stream')
    
    return response
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}