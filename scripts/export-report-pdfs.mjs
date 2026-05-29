import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'

const root = process.cwd()
const htmlPath = path.join(
  root,
  'docs',
  'research',
  'executive-search-ai-confidentiality-annual-report-2026-public-edition.print.html'
)
const reportsDir = path.join(root, 'public', 'reports')
const fullPdfPath = path.join(reportsDir, 'executive-search-ai-confidentiality-annual-report-2026.pdf')
const emailPdfPath = path.join(reportsDir, 'executive-search-ai-confidentiality-annual-report-2026-email.pdf')

async function ensureExists(filePath) {
  try {
    await fs.access(filePath)
  } catch {
    throw new Error(`Missing required file: ${filePath}`)
  }
}

async function main() {
  await ensureExists(htmlPath)
  await fs.mkdir(reportsDir, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'load' })

  // Branded full-fidelity PDF for downloads.
  await page.pdf({
    path: fullPdfPath,
    format: 'Letter',
    printBackground: true,
    margin: { top: '14mm', right: '14mm', bottom: '14mm', left: '14mm' },
    preferCSSPageSize: false,
  })

  // Email-friendly smaller PDF: no backgrounds, tighter margins.
  await page.pdf({
    path: emailPdfPath,
    format: 'Letter',
    printBackground: false,
    margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
    preferCSSPageSize: false,
  })

  await browser.close()

  const [fullStat, emailStat] = await Promise.all([
    fs.stat(fullPdfPath),
    fs.stat(emailPdfPath),
  ])

  console.log('Generated PDFs:')
  console.log(`- ${path.relative(root, fullPdfPath)} (${Math.round(fullStat.size / 1024)} KB)`)
  console.log(`- ${path.relative(root, emailPdfPath)} (${Math.round(emailStat.size / 1024)} KB)`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
