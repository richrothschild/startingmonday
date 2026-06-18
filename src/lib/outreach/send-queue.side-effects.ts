import {
  addBusinessDays,
  buildGoogleCalendarUrl,
  pacificTodayISO,
} from '@/lib/outreach/send-queue.utils'

type DbError = { message: string }
type DbResponse<T = unknown> = Promise<{ data: T | null; error: DbError | null }>
type DbQuery<T = unknown> = DbResponse<T> & {
  select: (columns: string) => DbQuery<T>
  insert: (values: unknown) => DbQuery<T>
  update: (values: unknown) => DbQuery<T>
  eq: (column: string, value: unknown) => DbQuery<T>
  ilike: (column: string, value: string) => DbQuery<T>
  limit: (count: number) => DbQuery<T>
  maybeSingle: () => DbResponse<T>
  single: () => DbResponse<T>
}

type QueueAdminClient = {
  from: (table: string) => DbQuery<unknown>
}

type SideEffectPayload = {
  userId: string
  fullName: string
  company: string
  roleBucket: string
  emailTo: string
  providerRecipient: string
  finalSubject: string
  messageText: string
  finalMessageText: string
  mode: 'live' | 'test_to_self'
  outreachChannel: 'executives' | 'search_firms' | 'coaches' | 'outplacement_firms'
  fitTier: string | null
  personaFocus: string | null
  campaignStep: string | null
  templateStep: string | null
  templateSource: 'latest_template_engine' | 'custom_input'
  idempotencyKey: string | null
  statusAfter: string
}

type FailedError = {
  code: string
  message: string
  raw: string | null
}

export async function insertFailedOutreachLogEffect(
  admin: QueueAdminClient,
  input: {
    jobId: string
    batchId: string
    contactId: string | null
    outreachReplyTo: string
    payload: SideEffectPayload
    error: FailedError
  },
): Promise<void> {
  await admin.from('outreach_logs').insert({
    user_id: input.payload.userId,
    contact_id: input.payload.mode === 'live' ? (input.contactId ?? null) : null,
    channel: input.payload.mode === 'live' ? 'email' : 'other',
    message_preview: `${input.payload.mode === 'test_to_self' ? '[TEST] ' : ''}${input.payload.messageText.slice(0, 200)}`,
    recipient_email: input.payload.emailTo,
    recipient_name: input.payload.fullName,
    sender_email: input.outreachReplyTo,
    subject: input.payload.finalSubject,
    message_body: input.payload.finalMessageText,
    send_mode: input.payload.mode,
    outreach_channel: input.payload.outreachChannel,
    fit_tier: input.payload.fitTier,
    persona_focus: input.payload.personaFocus,
    delivery_status: 'send_failed',
    webhook_payload: {
      email_source: 'outreach_send_worker',
      send_error: input.error.message,
      error_code: input.error.code,
      error_raw: input.error.raw,
      idempotency_key: input.payload.idempotencyKey,
      campaign_step: input.payload.campaignStep,
      template_step: input.payload.templateStep,
      template_source: input.payload.templateSource,
      batch_id: input.batchId,
      job_id: input.jobId,
    },
  })
}

export async function applyAcceptedOutreachSideEffectsEffect(
  admin: QueueAdminClient,
  input: {
    jobId: string
    batchId: string
    initialContactId: string | null
    resendMessageId: string | null
    outreachReplyTo: string
    contactChannel: string
    payload: SideEffectPayload
  },
): Promise<{ contactId: string | null; warnings: string[] }> {
  let contactId = input.initialContactId
  const warnings: string[] = []

  if (input.payload.mode === 'live') {
    const { data: existingContact } = await admin
      .from('contacts')
      .select('id, outreach_status, contacted_at')
      .eq('user_id', input.payload.userId)
      .ilike('email', input.payload.emailTo)
      .limit(1)
      .maybeSingle()

    const existingContactRow = (existingContact ?? null) as { id?: string } | null

    if (existingContactRow?.id) {
      contactId = existingContactRow.id
      const { error: updateError } = await admin
        .from('contacts')
        .update({
          outreach_status: input.payload.statusAfter,
          contacted_at: new Date().toISOString(),
          status: 'active',
          channel: input.contactChannel,
          contact_type: input.payload.fitTier,
          last_role_discussed: input.payload.personaFocus,
        })
        .eq('id', existingContactRow.id)
        .eq('user_id', input.payload.userId)

      if (updateError) warnings.push(`Contact sync update failed: ${updateError.message}`)
    } else {
      const { data: insertedContact, error: insertError } = await admin
        .from('contacts')
        .insert({
          user_id: input.payload.userId,
          name: input.payload.fullName,
          firm: input.payload.company || null,
          title: input.payload.roleBucket ? input.payload.roleBucket.toUpperCase() : null,
          email: input.payload.emailTo,
          channel: input.contactChannel,
          status: 'active',
          outreach_status: input.payload.statusAfter,
          contacted_at: new Date().toISOString(),
          contact_type: input.payload.fitTier,
          last_role_discussed: input.payload.personaFocus,
        })
        .select('id')
        .single()

      if (insertError) warnings.push(`Contact sync insert failed: ${insertError.message}`)
      contactId = ((insertedContact ?? null) as { id?: string } | null)?.id ?? null
    }
  }

  await admin.from('outreach_logs').insert({
    user_id: input.payload.userId,
    contact_id: input.payload.mode === 'live' ? contactId : null,
    channel: input.payload.mode === 'live' ? 'email' : 'other',
    message_preview: `${input.payload.mode === 'test_to_self' ? '[TEST] ' : ''}${input.payload.finalMessageText.slice(0, 200)}`,
    recipient_email: input.payload.emailTo,
    recipient_name: input.payload.fullName,
    sender_email: input.outreachReplyTo,
    subject: input.payload.finalSubject,
    message_body: input.payload.finalMessageText,
    send_mode: input.payload.mode,
    outreach_channel: input.payload.outreachChannel,
    fit_tier: input.payload.fitTier,
    persona_focus: input.payload.personaFocus,
    resend_message_id: input.resendMessageId,
    delivery_status: 'accepted',
    webhook_payload: {
      email_source: 'outreach_send_worker',
      idempotency_key: input.payload.idempotencyKey,
      campaign_step: input.payload.campaignStep,
      template_step: input.payload.templateStep,
      template_source: input.payload.templateSource,
      batch_id: input.batchId,
      job_id: input.jobId,
      provider_recipient: input.payload.providerRecipient,
      warnings,
    },
  })

  if (input.payload.mode === 'live' && contactId) {
    const todayPacific = pacificTodayISO()
    const followUp3Date = addBusinessDays(todayPacific, 3)
    const followUp7Date = addBusinessDays(todayPacific, 7)
    const googleFollowUp3Url = buildGoogleCalendarUrl({
      title: `Follow-up 1: ${input.payload.fullName}`,
      details: `Channel: ${input.payload.outreachChannel}\nCompany: ${input.payload.company || 'N/A'}\nEmail: ${input.payload.emailTo}`,
      dateISO: followUp3Date,
    })
    const googleFollowUp7Url = buildGoogleCalendarUrl({
      title: `Follow-up 2: ${input.payload.fullName}`,
      details: `Channel: ${input.payload.outreachChannel}\nCompany: ${input.payload.company || 'N/A'}\nEmail: ${input.payload.emailTo}`,
      dateISO: followUp7Date,
    })

    const { error: followUpError } = await admin.from('follow_ups').insert([
      {
        user_id: input.payload.userId,
        contact_id: contactId,
        action: `Follow-up 1 with ${input.payload.fullName} (${input.payload.outreachChannel})`,
        due_date: followUp3Date,
        status: 'pending',
        google_event_url: googleFollowUp3Url,
      },
      {
        user_id: input.payload.userId,
        contact_id: contactId,
        action: `Follow-up 2 with ${input.payload.fullName} (${input.payload.outreachChannel})`,
        due_date: followUp7Date,
        status: 'pending',
        google_event_url: googleFollowUp7Url,
      },
    ])

    if (followUpError) warnings.push(`Follow-up creation failed: ${followUpError.message}`)
  }

  return { contactId, warnings }
}
