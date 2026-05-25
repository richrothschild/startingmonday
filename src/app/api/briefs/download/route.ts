import { type NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/require-auth'
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, convertInchesToTwip,
} from 'docx'
const __councilObservabilitySignal = (...args: unknown[]) => console.error(...args)

function parseLine(line: string): Paragraph {
  if (line.startsWith('## ')) {
    return new Paragraph({ text: line.slice(3), heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 80 } })
  }
  if (line.startsWith('# ')) {
    return new Paragraph({ text: line.slice(2), heading: HeadingLevel.HEADING_1, spacing: { before: 320, after: 120 } })
  }
  if (line.startsWith('- ') || line.startsWith('* ')) {
    const content = line.slice(2)
    const runs = parseBold(content)
    return new Paragraph({ children: runs, bullet: { level: 0 }, spacing: { after: 60 } })
  }
  if (line.trim() === '') {
    return new Paragraph({ text: '', spacing: { after: 60 } })
  }
  // Regular paragraph with possible **bold** spans
  const runs = parseBold(line)
  return new Paragraph({ children: runs, spacing: { after: 80 } })
}

function parseBold(text: string): TextRun[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map(part => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return new TextRun({ text: part.slice(2, -2), bold: true, size: 24, font: 'Calibri' })
    }
    return new TextRun({ text: part, size: 24, font: 'Calibri' })
  })
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request)
  if (!auth.ok) return auth.response

  let body: { text?: unknown; title?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const text = (typeof body.text === 'string' ? body.text : '').trim()
  const title = (typeof body.title === 'string' ? body.title : 'Prep Brief').trim()

  if (!text) return NextResponse.json({ error: 'text is required' }, { status: 400 })

  const lines = text.split('\n')
  const children: Paragraph[] = [
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 32, font: 'Calibri' })],
      alignment: AlignmentType.LEFT,
      spacing: { after: 240 },
    }),
    ...lines.map(parseLine),
  ]

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            right: convertInchesToTwip(1.25),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1.25),
          },
        },
      },
      children,
    }],
  })

  const buffer = await Packer.toBuffer(doc)
  const safeTitle = title.replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 60)

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${safeTitle}.docx"`,
    },
  })
}
