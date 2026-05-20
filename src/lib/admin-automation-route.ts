import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireStaffAutomationAccess, type StaffAutomationAuthResult } from '@/lib/admin-automation-auth'

export type AutomationBody = Record<string, unknown>

export type LooseSupabaseClient = {
  // Loose query facade is intentionally dynamic while automation tables are migrated to generated DB types.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (table: string) => any
}

export type AutomationContext<TBody extends AutomationBody = AutomationBody> = {
  userId: string
  supabase: Awaited<ReturnType<typeof requireStaffAutomationAccess>> extends { ok: true; supabase: infer T }
    ? T
    : never
  body: TBody
}

export async function requireAutomationAccess(request: NextRequest) {
  const auth = await requireStaffAutomationAccess(request)
  if (!auth.ok) return auth
  return {
    ok: true as const,
    userId: auth.userId,
    supabase: auth.supabase,
  }
}

export async function parseAutomationBody<TBody extends AutomationBody>(
  request: NextRequest,
  schema: z.ZodType<TBody>,
): Promise<{ ok: true; body: TBody } | { ok: false; response: NextResponse }> {
  const raw = await request.json().catch(() => ({}))
  const parsed = schema.safeParse(raw)

  if (!parsed.success) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: 'Invalid request body',
          details: parsed.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 },
      ),
    }
  }

  return { ok: true, body: parsed.data }
}

export function asLooseSupabaseClient(
  client: Extract<StaffAutomationAuthResult, { ok: true }>['supabase'],
): LooseSupabaseClient {
  return client as unknown as LooseSupabaseClient
}
