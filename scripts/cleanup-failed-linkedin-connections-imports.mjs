async function supabaseSelect({ url, key, table, query }) {
  const qs = new URLSearchParams(query).toString()
  const endpoint = `${url}/rest/v1/${table}?${qs}`
  const res = await fetch(endpoint, {
    method: 'GET',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Select failed for ${table}: ${res.status} ${body}`)
  }
  return res.json()
}

async function supabaseDelete({ url, key, table, query }) {
  const qs = new URLSearchParams(query).toString()
  const endpoint = `${url}/rest/v1/${table}?${qs}`
  const res = await fetch(endpoint, {
    method: 'DELETE',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
      Prefer: 'return=minimal',
    },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Delete failed for ${table}: ${res.status} ${body}`)
  }
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const userId = process.env.SUPABASE_USER_ID ?? process.env.DEMO_USER_ID ?? process.env.AUTOMATION_SERVICE_USER_ID
  const fileName = process.argv[2] ?? 'Connections.csv'

  if (!supabaseUrl || !serviceKey || !userId) {
    throw new Error('Missing Supabase URL/key/user id env vars')
  }

  const uploads = await supabaseSelect({
    url: supabaseUrl,
    key: serviceKey,
    table: 'linkedin_connection_uploads',
    query: {
      select: 'id,consent_id,status,source_file_name,uploaded_at',
      user_id: `eq.${userId}`,
      source_file_name: `eq.${fileName}`,
      order: 'uploaded_at.desc',
      limit: '20',
    },
  })

  const badUploads = (Array.isArray(uploads) ? uploads : []).filter((u) => u.status !== 'processed')
  const badConsentIds = [...new Set(badUploads.map((u) => u.consent_id).filter(Boolean))]

  for (const consentId of badConsentIds) {
    await supabaseDelete({
      url: supabaseUrl,
      key: serviceKey,
      table: 'linkedin_imported_connections',
      query: {
        user_id: `eq.${userId}`,
        consent_id: `eq.${consentId}`,
      },
    })
  }

  for (const upload of badUploads) {
    await supabaseDelete({
      url: supabaseUrl,
      key: serviceKey,
      table: 'linkedin_connection_uploads',
      query: {
        user_id: `eq.${userId}`,
        id: `eq.${upload.id}`,
      },
    })
  }

  for (const consentId of badConsentIds) {
    await supabaseDelete({
      url: supabaseUrl,
      key: serviceKey,
      table: 'linkedin_import_consents',
      query: {
        user_id: `eq.${userId}`,
        id: `eq.${consentId}`,
      },
    })
  }

  console.log(`user_id_prefix=${String(userId).slice(0, 8)}...`)
  console.log(`file=${fileName}`)
  console.log(`removed_upload_sessions=${badUploads.length}`)
  console.log(`removed_consent_sessions=${badConsentIds.length}`)
}

main().catch((err) => {
  console.error(err.message || String(err))
  process.exit(1)
})
