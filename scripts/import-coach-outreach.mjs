import { readFile } from "node:fs/promises"
import path from "node:path"
import "dotenv/config"
import { createClient } from "@supabase/supabase-js"

const OUTREACH_DIR = path.join(process.cwd(), "docs", "outreach")

function parseCsv(content) {
  if (!content.trim()) return { headers: [], rows: [] }
  const records = []
  let row = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < content.length; i++) {
    const ch = content[i]
    if (ch === "\"") {
      if (inQuotes && content[i + 1] === "\"") {
        current += "\""
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (ch === "," && !inQuotes) {
      row.push(current)
      current = ""
      continue
    }

    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && content[i + 1] === "\n") i++
      row.push(current)
      current = ""
      if (row.some(cell => cell.length > 0)) records.push(row)
      row = []
      continue
    }

    current += ch
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current)
    if (row.some(cell => cell.length > 0)) records.push(row)
  }

  if (records.length === 0) return { headers: [], rows: [] }
  const [headers, ...lines] = records
  const rows = lines.map(cols => {
    const mapped = {}
    for (let i = 0; i < headers.length; i++) mapped[headers[i]] = cols[i] ?? ""
    return mapped
  })
  return { headers, rows }
}

async function loadCsv(fileName) {
  const raw = await readFile(path.join(OUTREACH_DIR, fileName), "utf8")
  return parseCsv(raw)
}

async function importCoachesFromCsv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    process.exit(1)
  }

  const supabase = createClient(url, key)
  const userId = '797adda8-98a7-43c2-b4d7-2d68c9fdc502'
  const coachFiles = [
    "coaches_prospecting_curated_top25.csv",
    "coaches_prospecting_100.csv",
  ]

  let totalImported = 0

  for (const fileName of coachFiles) {
    try {
      const csv = await loadCsv(fileName)
      console.log(`Processing ${fileName}: ${csv.rows.length} rows`)

      const batch = csv.rows.map(row => ({
        user_id: userId,
        recipient_name: row.full_name || `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() || row.name || "Unknown",
        recipient_email: row.email_guess || row.email || row.email_address || "",
        channel: "email",
        sender_email: "richard@startingmonday.app",
        delivery_status: "pending",
      }))

      if (batch.length > 0) {
        const { data, error } = await supabase
          .from("outreach_logs")
          .insert(batch)
          .select("id")

        if (error) {
          console.error(`Failed to import ${fileName}:`, error.message)
        } else {
          const imported = data?.length || 0
          console.log(`Successfully imported ${imported} rows from ${fileName}`)
          totalImported += imported
        }
      }
    } catch (err) {
      console.error(`Error processing ${fileName}:`, err.message)
    }
  }

  console.log(`\nTotal imported: ${totalImported} rows`)
}

importCoachesFromCsv()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })



