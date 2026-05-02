import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MAX_BYTES = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData().catch(() => null)
  if (!formData) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (file.size > MAX_BYTES)
    return NextResponse.json({ error: 'File too large (5 MB max)' }, { status: 413 })

  const buffer = Buffer.from(await file.arrayBuffer())

  // Magic byte validation
  const isPdf = buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46
  const isDocx = buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04

  if (!isPdf && !isDocx)
    return NextResponse.json({ error: 'Only PDF and DOCX files are supported' }, { status: 415 })

  let text: string
  try {
    if (isPdf) {
      // pdf-parse types don't declare a default export — cast to actual shape
      const pdfParse = (await import('pdf-parse') as unknown as { default: (buf: Buffer) => Promise<{ text: string }> }).default
      const result = await pdfParse(buffer)
      text = result.text
    } else {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    }
  } catch {
    return NextResponse.json({ error: 'Failed to extract text from file' }, { status: 422 })
  }

  text = text.trim()
  if (!text) return NextResponse.json({ error: 'No text found in file' }, { status: 422 })
  if (text.length > 100000) text = text.slice(0, 100000)

  const { error } = await supabase
    .from('user_profiles')
    .upsert({ user_id: user.id, resume_text: text }, { onConflict: 'user_id' })

  if (error) return NextResponse.json({ error: 'Failed to save resume text' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
