import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'

const MAX_BYTES = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  const formData = await request.formData().catch(() => null)
  if (!formData) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (file.size > MAX_BYTES)
    return NextResponse.json({ error: 'File too large (5 MB max)' }, { status: 413 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const isPdf = buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46
  if (!isPdf)
    return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 415 })

  try {
    // Import the internal module to avoid pdf-parse running its test suite on import
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error no types for internal path
    const pdfParse = (await import('pdf-parse/lib/pdf-parse.js') as unknown as { default: (buf: Buffer) => Promise<{ text: string }> }).default
    const result = await pdfParse(buffer)
    const text = result.text.trim()
    if (!text) return NextResponse.json({ error: 'No text found in the PDF' }, { status: 422 })
    return NextResponse.json({ text })
  } catch {
    return NextResponse.json({ error: 'Failed to read the PDF. Try pasting your profile text instead.' }, { status: 422 })
  }
}
