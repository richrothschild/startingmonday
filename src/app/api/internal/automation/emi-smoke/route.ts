import { timingSafeEqual } from 'crypto'
import { type NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

const EMI_SMOKE_TOKEN_HEADER = 'x-emi-smoke-token'
const EMI_SMOKE_RATE_LIMIT = 20
const EMI_SMOKE_WINDOW_MS = 60_000

type EmiSmokeBody = {
  referenceDate?: string
  tolerancePoints?: number
}

function trimSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

function internalBaseUrl(request: NextRequest): string {
  const explicit = process.env.INTERNAL_API_BASE_URL?.trim()
  if (explicit) return trimSlash(explicit)

  const forwardedHost = request.headers.get('x-forwarded-host')?.trim()
  const forwardedProto = request.headers.get('x-forwarded-proto')?.trim() || 'https'
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`
  }

  const port = process.env.PORT?.trim() || '3000'
  const localhostUrl = `http://127.0.0.1:${port}`

  const host = request.headers.get('host')?.trim()
  if (!host) return localhostUrl

  // Prefer direct in-process HTTP calls when host is private/internal to avoid TLS mismatch.
  if (
    host.startsWith('localhost')
    || host.startsWith('127.0.0.1')
    || host.startsWith('10.')
    || host.startsWith('192.168.')
    || host.startsWith('172.')
  ) {
    return `http://${host}`
  }

  const hostProto = request.nextUrl.protocol?.replace(':', '') || 'https'
  return `${hostProto}://${host}`
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

function extractToken(request: NextRequest): string {
  const explicit = request.headers.get(EMI_SMOKE_TOKEN_HEADER)?.trim() ?? ''
  if (explicit) return explicit

  const authorization = request.headers.get('authorization') ?? ''
  const [scheme, value] = authorization.split(' ')
  if (scheme?.toLowerCase() !== 'bearer') return ''
  return value?.trim() ?? ''
}

function tokensMatch(actual: string, expected: string): boolean {
  if (!actual || !expected) return false

  try {
    const left = Buffer.from(actual)
    const right = Buffer.from(expected)
    if (left.length !== right.length) return false
    return timingSafeEqual(left, right)
  } catch {
    return false
  }
}

async function postInternal(
  request: NextRequest,
  path: string,
  payload: Record<string, unknown>,
): Promise<{ status: number; body: any; rawBody: string }> {
  const automationToken = process.env.AUTOMATION_SERVICE_TOKEN ?? ''
  const automationUserId = process.env.AUTOMATION_SERVICE_USER_ID ?? ''
  if (!automationToken || !automationUserId) {
    throw new Error('Automation service identity is not configured')
  }

  const url = `${internalBaseUrl(request)}${path}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${automationToken}`,
      'x-automation-service-token': automationToken,
      'x-automation-user-id': automationUserId,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  const rawBody = await res.text()
  let parsed: any = null
  try {
    parsed = JSON.parse(rawBody)
  } catch {
    parsed = null
  }

  return { status: res.status, body: parsed, rawBody: rawBody.slice(0, 500) }
}

function unauthorizedResponse(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const rateKey = `emi_smoke_token:${ip}`
  const rate = await checkRateLimit(rateKey, EMI_SMOKE_RATE_LIMIT, EMI_SMOKE_WINDOW_MS)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: rate.retryAfter ? { 'Retry-After': String(rate.retryAfter) } : undefined,
      },
    )
  }

  const providedToken = extractToken(request)
  const expectedToken = process.env.EMI_SMOKE_TOKEN ?? ''
  if (!tokensMatch(providedToken, expectedToken)) {
    return unauthorizedResponse()
  }

  const body = await request.json().catch(() => ({})) as EmiSmokeBody
  const sharedPayload: Record<string, unknown> = {}
  if (typeof body.referenceDate === 'string' && body.referenceDate.trim()) {
    sharedPayload.referenceDate = body.referenceDate.trim()
  }
  if (typeof body.tolerancePoints === 'number' && Number.isFinite(body.tolerancePoints)) {
    sharedPayload.tolerancePoints = body.tolerancePoints
  }

  try {
    const weekly = await postInternal(
      request,
      '/api/admin/automation/reporting/weekly-kpi-summaries',
      sharedPayload,
    )
    const validation = await postInternal(
      request,
      '/api/admin/automation/reporting/emi-validation-reruns',
      sharedPayload,
    )
    const proofPublisher = await postInternal(
      request,
      '/api/admin/automation/reporting/proof-asset-publisher',
      {},
    )
    const claimAudit = await postInternal(
      request,
      '/api/admin/automation/reporting/tier1-claim-compliance-audit',
      {},
    )
    const sprint5Exit = await postInternal(
      request,
      '/api/admin/automation/reporting/sprint-5-exit-metrics',
      sharedPayload,
    )
    const gtmProofSequence = await postInternal(
      request,
      '/api/admin/automation/reporting/gtm-proof-sequence',
      sharedPayload,
    )
    const q4Cadence = await postInternal(
      request,
      '/api/admin/automation/reporting/q4-cadence-automation',
      {},
    )
    const capstoneReport = await postInternal(
      request,
      '/api/admin/automation/reporting/capstone-report-generation',
      sharedPayload,
    )
    const successCriteriaAudit = await postInternal(
      request,
      '/api/admin/automation/reporting/success-criteria-audit-automation',
      sharedPayload,
    )
    const objectionDashboard = await postInternal(
      request,
      '/api/admin/automation/reporting/top10-objection-kpi-dashboard',
      sharedPayload,
    )
    const sloMonitoring = await postInternal(
      request,
      '/api/admin/automation/reporting/emi-slo-monitoring-alerts',
      sharedPayload,
    )

    const failures: string[] = []
    if (weekly.status !== 200 || weekly.body?.ok !== true) {
      failures.push(`weekly-kpi-summaries failed status=${weekly.status} body=${weekly.rawBody}`)
    }
    if (validation.status !== 200 || validation.body?.ok !== true) {
      failures.push(`emi-validation-reruns request failed status=${validation.status} body=${validation.rawBody}`)
    } else {
      if (validation.body.status !== 'ok') failures.push(`validation status=${String(validation.body.status)}`)
      if (Number(validation.body.mismatchCount ?? -1) !== 0) failures.push(`mismatchCount=${String(validation.body.mismatchCount)}`)
      if (Number(validation.body.nullStreakCount ?? -1) !== 0) failures.push(`nullStreakCount=${String(validation.body.nullStreakCount)}`)
    }
    if (proofPublisher.status !== 200 || proofPublisher.body?.ok !== true) {
      failures.push(`proof-asset-publisher failed status=${proofPublisher.status} body=${proofPublisher.rawBody}`)
    }
    if (claimAudit.status !== 200 || claimAudit.body?.ok !== true) {
      failures.push(`tier1-claim-compliance-audit failed status=${claimAudit.status} body=${claimAudit.rawBody}`)
    }
    if (sprint5Exit.status !== 200 || sprint5Exit.body?.ok !== true) {
      failures.push(`sprint-5-exit-metrics failed status=${sprint5Exit.status} body=${sprint5Exit.rawBody}`)
    }
    if (gtmProofSequence.status !== 200 || gtmProofSequence.body?.ok !== true) {
      failures.push(`gtm-proof-sequence failed status=${gtmProofSequence.status} body=${gtmProofSequence.rawBody}`)
    }
    if (q4Cadence.status !== 200 || q4Cadence.body?.ok !== true) {
      failures.push(`q4-cadence-automation failed status=${q4Cadence.status} body=${q4Cadence.rawBody}`)
    }
    if (capstoneReport.status !== 200 || capstoneReport.body?.ok !== true) {
      failures.push(`capstone-report-generation failed status=${capstoneReport.status} body=${capstoneReport.rawBody}`)
    }
    if (successCriteriaAudit.status !== 200 || successCriteriaAudit.body?.ok !== true) {
      failures.push(`success-criteria-audit-automation failed status=${successCriteriaAudit.status} body=${successCriteriaAudit.rawBody}`)
    }
    if (objectionDashboard.status !== 200 || objectionDashboard.body?.ok !== true) {
      failures.push(`top10-objection-kpi-dashboard failed status=${objectionDashboard.status} body=${objectionDashboard.rawBody}`)
    }
    if (sloMonitoring.status !== 200 || sloMonitoring.body?.ok !== true) {
      failures.push(`emi-slo-monitoring-alerts failed status=${sloMonitoring.status} body=${sloMonitoring.rawBody}`)
    }

    const result = {
      ok: failures.length === 0,
      weeklyRunId: weekly.body?.runId ?? null,
      validationRunId: validation.body?.runId ?? null,
      proofPublisherRunId: proofPublisher.body?.runId ?? null,
      claimAuditRunId: claimAudit.body?.runId ?? null,
      sprint5ExitRunId: sprint5Exit.body?.runId ?? null,
      gtmProofSequenceRunId: gtmProofSequence.body?.runId ?? null,
      q4CadenceRunId: q4Cadence.body?.runId ?? null,
      capstoneReportRunId: capstoneReport.body?.runId ?? null,
      successCriteriaAuditRunId: successCriteriaAudit.body?.runId ?? null,
      objectionDashboardRunId: objectionDashboard.body?.runId ?? null,
      sloMonitoringRunId: sloMonitoring.body?.runId ?? null,
      validationStatus: validation.body?.status ?? null,
      mismatchCount: validation.body?.mismatchCount ?? null,
      nullStreakCount: validation.body?.nullStreakCount ?? null,
      failures,
      checks: {
        weekly,
        validation,
        proofPublisher,
        claimAudit,
        sprint5Exit,
        gtmProofSequence,
        q4Cadence,
        capstoneReport,
        successCriteriaAudit,
        objectionDashboard,
        sloMonitoring,
      },
    }

    if (result.ok) {
      return NextResponse.json(result, { status: 200 })
    }

    return NextResponse.json(result, { status: 502 })
  } catch (error) {
    console.error('[internal.automation.emi-smoke] request failed', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}