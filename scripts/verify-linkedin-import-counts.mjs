async function selectCount({ url, key, table, userId }) {
  const endpoint = `${url}/rest/v1/${table}?select=id&user_id=eq.${encodeURIComponent(userId)}&limit=1`
  const res = await fetch(endpoint, {
    method: 'GET',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
      Prefer: 'count=exact',
      Range: '0-0',
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Failed to query ${table}: ${res.status} ${body}`)
  }

  const contentRange = res.headers.get('content-range')
  if (contentRange && contentRange.includes('/')) {
    const total = Number(contentRange.split('/')[1])
    if (Number.isFinite(total)) return total
  }

  const rows = await res.json()
  return Array.isArray(rows) ? rows.length : 0
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const userId = process.env.SUPABASE_USER_ID ?? process.env.DEMO_USER_ID ?? process.env.AUTOMATION_SERVICE_USER_ID

  if (!supabaseUrl || !serviceKey || !userId) {
    throw new Error('Missing Supabase URL/key/user id env vars for verification')
  }

  const uploads = await selectCount({ url: supabaseUrl, key: serviceKey, table: 'linkedin_connection_uploads', userId })
  const exportConnections = await selectCount({ url: supabaseUrl, key: serviceKey, table: 'linkedin_export_connections', userId })
  const importedConnections = await selectCount({ url: supabaseUrl, key: serviceKey, table: 'linkedin_imported_connections', userId })

  console.log(`user_id_prefix=${String(userId).slice(0, 8)}...`)
  console.log(`linkedin_connection_uploads=${uploads}`)
  console.log(`linkedin_export_connections=${exportConnections}`)
  console.log(`linkedin_imported_connections=${importedConnections}`)
}

main().catch((err) => {
  console.error(err.message || String(err))
  process.exit(1)
})
