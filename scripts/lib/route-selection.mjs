function normalizeRouteToken(token) {
  if (token == null) return null

  const cleaned = String(token).trim().replace(/^['"]|['"]$/g, '')
  if (!cleaned) return null

  const withoutQuery = cleaned.split('?')[0].split('#')[0]
  const routeLike = withoutQuery.startsWith('src/app/')
    ? withoutQuery.replace(/^src\/app\//, '').replace(/(^|\/)page\.tsx?$/, '')
    : withoutQuery

  const prefixed = routeLike.startsWith('/') ? routeLike : `/${routeLike}`
  return prefixed.replace(/\/+/g, '/') || '/'
}

function collectRouteTokens(argv) {
  const tokens = []

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index]

    if (current === '--route') {
      tokens.push(argv[index + 1])
      index += 1
      continue
    }

    if (current.startsWith('--route=')) {
      tokens.push(current.slice('--route='.length))
      continue
    }

    if (current === '--routes') {
      tokens.push(...String(argv[index + 1] ?? '').split(','))
      index += 1
      continue
    }

    if (current.startsWith('--routes=')) {
      tokens.push(...current.slice('--routes='.length).split(','))
    }
  }

  return tokens
}

export function parseRouteSelection(argv) {
  const tokens = collectRouteTokens(argv)
  const normalized = tokens
    .map(normalizeRouteToken)
    .filter(Boolean)

  return normalized.length > 0 ? new Set(normalized) : null
}

function selectionMatchesCandidate(selection, candidate) {
  if (!candidate) return false
  return selection.has(candidate)
}

export function matchesRouteSelection(routeRecord, selection) {
  if (!selection) return true

  const candidates = [routeRecord?.route, routeRecord?.relativePath, routeRecord?.path]
    .map(normalizeRouteToken)
    .filter(Boolean)

  return candidates.some((candidate) => selectionMatchesCandidate(selection, candidate))
}

export function filterRoutesBySelection(routes, selection) {
  if (!selection) return routes
  return routes.filter((route) => matchesRouteSelection(route, selection))
}

export function selectionToArray(selection) {
  return selection ? [...selection].sort((a, b) => a.localeCompare(b)) : []
}