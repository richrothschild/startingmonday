import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import { createClient } from '@/lib/supabase/server'

const MAX_BYTES = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response
  const { userId } = auth
  const supabase = await createClient()

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
      const { PDFParse } = await import('pdf-parse')
      const parser = new PDFParse({ data: buffer })
      const result = await parser.getText()
      await parser.destroy()
      text = result.text
    } else {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    }
  } catch (err) {
    console.error('[upload-resume] extraction failed:', err)
    return NextResponse.json({ error: 'Failed to extract text from file' }, { status: 422 })
  }

  text = text.trim()
  if (!text) return NextResponse.json({ error: 'No text found in file' }, { status: 422 })
  if (text.length > 100000) text = text.slice(0, 100000)

  const { error } = await supabase
    .from('user_profiles')
    .update({ resume_text: text })
    .eq('user_id', userId)

  if (error) {
    console.error('[upload-resume] supabase error:', JSON.stringify(error))
    return NextResponse.json({ error: 'Failed to save resume text', detail: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, text })
}
