#!/usr/bin/env node

import { createHash, createPrivateKey, createSign } from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'

const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3'
const GOOGLE_DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3'
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive'

const ROOT_DIR = process.cwd()
const DOCS_DIR = path.join(ROOT_DIR, 'docs')

const IGNORED_FILE_PATTERNS = [
  /(^|\\|\/)internal-guide\./i,
  /(^|\\|\/)user-guide\./i,
  /\.latest\.(md|json)$/i,
]

const DOC_EXTENSIONS = new Set(
  (process.env.DOCS_SYNC_INCLUDE_EXTENSIONS ?? '.md,.txt,.csv,.json,.doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean),
)

const FOLDER_MAPPINGS = [
  { prefix: 'docs/governance', drivePath: ['Governance'] },
  { prefix: 'docs/templates', drivePath: ['Templates'] },
  { prefix: 'docs/strategy', drivePath: ['Strategy'] },
  { prefix: 'docs/operations', drivePath: ['Operations'] },
  { prefix: 'docs/content', drivePath: ['Content'] },
  { prefix: 'docs/growth', drivePath: ['Growth'] },
  { prefix: 'docs/research', drivePath: ['Research'] },
  { prefix: 'docs/alerts', drivePath: ['Alerts'] },
  { prefix: 'docs/status', drivePath: ['Status'] },
]

function normalizeRelPath(relPath) {
  return relPath.replace(/\\/g, '/').replace(/^\/+/, '')
}

function parseArgs(argv) {
  const args = { dryRun: false, verbose: false }
  for (const item of argv) {
    if (item === '--dry-run') args.dryRun = true
    if (item === '--verbose') args.verbose = true
  }
  return args
}

function parseServiceAccount() {
  const raw = process.env.GDRIVE_SERVICE_ACCOUNT_JSON
  if (!raw) throw new Error('GDRIVE_SERVICE_ACCOUNT_JSON is required')

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('GDRIVE_SERVICE_ACCOUNT_JSON must be valid JSON')
  }

  if (!parsed.client_email || !parsed.private_key) {
    throw new Error('Service account JSON must include client_email and private_key')
  }

  return {
    clientEmail: parsed.client_email,
    privateKey: parsed.private_key,
  }
}

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

async function getAccessToken() {
  const { clientEmail, privateKey } = parseServiceAccount()
  const now = Math.floor(Date.now() / 1000)

  const header = { alg: 'RS256', typ: 'JWT' }
  const claimSet = {
    iss: clientEmail,
    scope: DRIVE_SCOPE,
    aud: GOOGLE_OAUTH_TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }

  const unsignedToken = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(claimSet))}`

  const signer = createSign('RSA-SHA256')
  signer.update(unsignedToken)
  signer.end()

  const keyObject = createPrivateKey({ key: privateKey, format: 'pem' })
  const signature = signer.sign(keyObject)
  const jwt = `${unsignedToken}.${base64UrlEncode(signature)}`

  const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok || !body.access_token) {
    const message = body.error_description || body.error || `Token request failed: ${response.status}`
    throw new Error(`Google auth failed: ${message}`)
  }

  return body.access_token
}

function escapeDriveQueryValue(value) {
  return String(value).replace(/'/g, "\\'")
}

async function driveRequest(accessToken, url, init = {}, expectJson = true) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.headers || {}),
    },
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`Drive API request failed (${response.status}): ${errorText || response.statusText}`)
  }

  if (!expectJson) return null
  return response.json()
}

async function listChildrenByName({ accessToken, driveId, parentId, name, mimeType }) {
  const queryParts = [
    `'${escapeDriveQueryValue(parentId)}' in parents`,
    `name = '${escapeDriveQueryValue(name)}'`,
    'trashed = false',
  ]
  if (mimeType) queryParts.push(`mimeType = '${escapeDriveQueryValue(mimeType)}'`)

  const params = new URLSearchParams({
    corpora: 'drive',
    driveId,
    includeItemsFromAllDrives: 'true',
    supportsAllDrives: 'true',
    q: queryParts.join(' and '),
    fields: 'files(id,name,mimeType,md5Checksum,parents)',
    pageSize: '50',
  })

  const body = await driveRequest(accessToken, `${GOOGLE_DRIVE_API_BASE}/files?${params.toString()}`)
  return body.files ?? []
}

async function createFolder({ accessToken, parentId, driveId, name }) {
  return driveRequest(accessToken, `${GOOGLE_DRIVE_API_BASE}/files?supportsAllDrives=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      parents: [parentId],
      mimeType: 'application/vnd.google-apps.folder',
      driveId,
    }),
  })
}

async function ensureFolderPath({ accessToken, driveId, rootFolderId, segments, folderCache }) {
  let parentId = rootFolderId
  for (const segment of segments) {
    if (!segment) continue
    const cacheKey = `${parentId}::${segment}`
    if (folderCache.has(cacheKey)) {
      parentId = folderCache.get(cacheKey)
      continue
    }

    const existing = await listChildrenByName({
      accessToken,
      driveId,
      parentId,
      name: segment,
      mimeType: 'application/vnd.google-apps.folder',
    })

    if (existing.length > 0) {
      folderCache.set(cacheKey, existing[0].id)
      parentId = existing[0].id
      continue
    }

    const created = await createFolder({ accessToken, parentId, driveId, name: segment })
    folderCache.set(cacheKey, created.id)
    parentId = created.id
  }

  return parentId
}

function getMapping(relPath) {
  const normalized = normalizeRelPath(relPath)
  const lower = normalized.toLowerCase()
  for (const mapping of FOLDER_MAPPINGS) {
    if (lower === mapping.prefix || lower.startsWith(`${mapping.prefix}/`)) return mapping
  }
  return { prefix: 'docs', drivePath: ['General'] }
}

function detectLifecycleFromHeader(text) {
  const head = text.split(/\r?\n/).slice(0, 40)
  const getField = (prefix) => {
    const line = head.find((item) => item.toLowerCase().startsWith(prefix))
    if (!line) return null
    return line.split(':').slice(1).join(':').trim().toLowerCase()
  }

  const status = getField('status')
  const lifecycle = getField('lifecycle candidate')

  const shouldArchive = status === 'archived' || status === 'deprecated' || lifecycle === 'archive'
  return { shouldArchive, status, lifecycle }
}

async function walkDocs(currentDir, files = []) {
  const entries = await fs.readdir(currentDir, { withFileTypes: true })
  for (const entry of entries) {
    const absolutePath = path.join(currentDir, entry.name)
    if (entry.isDirectory()) {
      await walkDocs(absolutePath, files)
      continue
    }

    const relPath = normalizeRelPath(path.relative(ROOT_DIR, absolutePath))
    const ext = path.extname(entry.name).toLowerCase()
    if (!DOC_EXTENSIONS.has(ext)) continue
    if (IGNORED_FILE_PATTERNS.some((pattern) => pattern.test(relPath))) continue

    files.push({ absolutePath, relPath, fileName: entry.name })
  }
  return files
}

async function upsertFile({ accessToken, driveId, parentId, doc, dryRun }) {
  const fileBuffer = await fs.readFile(doc.absolutePath)
  const localMd5 = createHash('md5').update(fileBuffer).digest('hex')

  const existing = await listChildrenByName({
    accessToken,
    driveId,
    parentId,
    name: doc.fileName,
    mimeType: null,
  })

  const target = existing[0] || null

  if (target?.md5Checksum && target.md5Checksum === localMd5) {
    return { action: 'skipped', fileId: target.id }
  }

  if (dryRun) {
    return { action: target ? 'would-update' : 'would-create', fileId: target?.id ?? null }
  }

  if (!target) {
    const created = await driveRequest(accessToken, `${GOOGLE_DRIVE_API_BASE}/files?supportsAllDrives=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: doc.fileName,
        parents: [parentId],
      }),
    })

    await driveRequest(accessToken, `${GOOGLE_DRIVE_UPLOAD_BASE}/files/${created.id}?uploadType=media&supportsAllDrives=true`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: fileBuffer,
    })

    return { action: 'created', fileId: created.id }
  }

  await driveRequest(accessToken, `${GOOGLE_DRIVE_UPLOAD_BASE}/files/${target.id}?uploadType=media&supportsAllDrives=true`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: fileBuffer,
  })

  return { action: 'updated', fileId: target.id }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const driveId = process.env.GDRIVE_SHARED_DRIVE_ID
  const rootFolderId = process.env.GDRIVE_ROOT_FOLDER_ID

  if (!driveId) throw new Error('GDRIVE_SHARED_DRIVE_ID is required')
  if (!rootFolderId) throw new Error('GDRIVE_ROOT_FOLDER_ID is required')

  const accessToken = await getAccessToken()
  const files = await walkDocs(DOCS_DIR)

  const folderCache = new Map()
  const summary = {
    scanned: files.length,
    created: 0,
    updated: 0,
    skipped: 0,
    wouldCreate: 0,
    wouldUpdate: 0,
    archived: 0,
    errors: 0,
  }

  for (const doc of files) {
    try {
      const textForHeader = doc.fileName.toLowerCase().endsWith('.md')
        ? await fs.readFile(doc.absolutePath, 'utf8')
        : ''

      const { shouldArchive } = detectLifecycleFromHeader(textForHeader)
      const mapping = getMapping(doc.relPath)

      const relFromMappingPrefix = (() => {
        const normalized = normalizeRelPath(doc.relPath)
        const lower = normalized.toLowerCase()
        if (!lower.startsWith(mapping.prefix)) return normalized.replace(/^docs\//i, '')
        return normalized.slice(mapping.prefix.length).replace(/^\//, '')
      })()

      const relativeDirSegments = relFromMappingPrefix
        .split('/')
        .slice(0, -1)
        .filter(Boolean)

      const destinationSegments = [
        ...(shouldArchive ? ['Archive'] : []),
        ...mapping.drivePath,
        ...relativeDirSegments,
      ]

      const destinationFolderId = await ensureFolderPath({
        accessToken,
        driveId,
        rootFolderId,
        segments: destinationSegments,
        folderCache,
      })

      const result = await upsertFile({
        accessToken,
        driveId,
        parentId: destinationFolderId,
        doc,
        dryRun: args.dryRun,
      })

      if (shouldArchive) summary.archived += 1
      if (result.action === 'created') summary.created += 1
      if (result.action === 'updated') summary.updated += 1
      if (result.action === 'skipped') summary.skipped += 1
      if (result.action === 'would-create') summary.wouldCreate += 1
      if (result.action === 'would-update') summary.wouldUpdate += 1

      if (args.verbose) {
        console.log(`[${result.action}] ${doc.relPath} -> ${destinationSegments.join('/') || '(root)'}`)
      }
    } catch (error) {
      summary.errors += 1
      console.error(`[error] ${doc.relPath}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  console.log('Docs -> Google Drive sync summary')
  console.log(JSON.stringify(summary, null, 2))

  if (summary.errors > 0) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
