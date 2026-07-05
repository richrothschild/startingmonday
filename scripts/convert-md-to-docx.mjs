#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx'

function parseArgs(argv) {
  const args = argv.slice(2)
  const input = []
  let outDir = null

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === '--out-dir') {
      outDir = args[i + 1] ?? null
      i += 1
      continue
    }
    input.push(arg)
  }

  if (input.length === 0) {
    throw new Error('Usage: node scripts/convert-md-to-docx.mjs [--out-dir <dir>] <file1.md> <file2.md> ...')
  }

  return {
    input,
    outDir: outDir ? path.resolve(process.cwd(), outDir) : null,
  }
}

function lineToParagraph(line) {
  const trimmed = line.trimEnd()

  if (trimmed.trim() === '') {
    return new Paragraph({ text: '' })
  }

  const heading = trimmed.match(/^(#{1,6})\s+(.*)$/)
  if (heading) {
    const level = heading[1].length
    const text = heading[2].trim()
    const mapping = {
      1: HeadingLevel.HEADING_1,
      2: HeadingLevel.HEADING_2,
      3: HeadingLevel.HEADING_3,
      4: HeadingLevel.HEADING_4,
      5: HeadingLevel.HEADING_5,
      6: HeadingLevel.HEADING_6,
    }
    return new Paragraph({
      text,
      heading: mapping[level],
      spacing: { before: 240, after: 120 },
    })
  }

  const bullet = trimmed.match(/^\s*[-*]\s+(.*)$/)
  if (bullet) {
    return new Paragraph({
      text: bullet[1],
      bullet: { level: 0 },
      spacing: { after: 60 },
    })
  }

  const numbered = trimmed.match(/^\s*\d+\.\s+(.*)$/)
  if (numbered) {
    return new Paragraph({
      children: [new TextRun(numbered[1])],
      numbering: {
        reference: 'numbered-list',
        level: 0,
      },
      spacing: { after: 60 },
    })
  }

  return new Paragraph({
    text: trimmed,
    spacing: { after: 80 },
  })
}

async function convertFile(mdPath, outDirOverride) {
  const absInput = path.resolve(process.cwd(), mdPath)
  const raw = fs.readFileSync(absInput, 'utf8')
  const lines = raw.split(/\r?\n/)
  const paragraphs = lines.map(lineToParagraph)

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'numbered-list',
          levels: [
            {
              level: 0,
              format: 'decimal',
              text: '%1.',
              alignment: 'start',
              style: {
                paragraph: {
                  indent: { left: 720, hanging: 360 },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [{ children: paragraphs }],
  })

  const outDir = outDirOverride ?? path.dirname(absInput)
  fs.mkdirSync(outDir, { recursive: true })

  const outName = `${path.basename(absInput, path.extname(absInput))}.docx`
  const outPath = path.join(outDir, outName)
  const buffer = await Packer.toBuffer(doc)
  fs.writeFileSync(outPath, buffer)

  return outPath
}

async function main() {
  const { input, outDir } = parseArgs(process.argv)
  const outputs = []
  for (const mdFile of input) {
    const outPath = await convertFile(mdFile, outDir)
    outputs.push(outPath)
  }

  for (const filePath of outputs) {
    console.log(filePath)
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  process.exit(1)
})
