import { z } from 'zod'

// Shared message type for chat and conversation routes
export const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(20_000),
})

export const ChatBodySchema = z.object({
  messages: z.array(MessageSchema).min(1).max(200),
})

export const OutreachDraftBodySchema = z.object({
  contactId: z.string().uuid(),
  goal: z.string().min(1).max(1000).optional(),
  additionalContext: z.string().max(2000).optional(),
  currentDraft: z.string().max(10_000).optional(),
  refineStyle: z.enum(['concise', 'warmer', 'sharper', 'thoughtful']).optional(),
  refineInstruction: z.string().max(1000).optional(),
})

export const PrepRefineBodySchema = z.object({
  brief: z.string().min(1).max(50_000),
  request: z.string().min(1).max(2000),
})

export const PrepRouteParamsSchema = z.object({
  id: z.string().uuid('Invalid company id'),
})

export const PrepClaimOriginClassSchema = z.enum(['user_provided', 'system_detected', 'inferred'])

export const PrepSensitivePolicyHookSchema = z.enum([
  'compensation_claim',
  'legal_risk_claim',
  'security_incident_claim',
])

export const PrepSourceEvidenceSchema = z.enum([
  'career_history',
  'resume_text',
  'star_story',
  'company_signals',
  'scan_results',
  'company_notes',
  'interview_notes',
  'contact_records',
  'company_documents',
  'job_description',
])

export const PrepClaimProvenanceSchema = z.object({
  claimText: z.string().trim().min(1, 'Claim text is required').max(3000, 'Claim text too long'),
  originClass: PrepClaimOriginClassSchema,
  section: z.string().trim().min(1).max(120).nullable(),
  sensitivePolicyHooks: z.array(PrepSensitivePolicyHookSchema).max(6).default([]),
  sourceEvidence: z.array(PrepSourceEvidenceSchema).max(12).default([]),
})

export const BriefSaveBodySchema = z.object({
  type: z.enum(['strategy', 'prep', 'prep_section', 'outreach']),
  text: z.string().trim().min(1, 'Brief text is required').max(150_000, 'Brief text too long'),
  company_id: z.string().uuid().optional(),
  contact_id: z.string().uuid().optional(),
  section_name: z.string().trim().max(120).optional(),
  provenance_version: z.number().int().positive().optional(),
  claim_provenance: z.array(PrepClaimProvenanceSchema).max(120).optional(),
})

export const PrepGenerateQuerySchema = z.object({
  posting_url: z.union([z.literal(''), z.string().url('Invalid posting URL')]).optional(),
  interview_stage: z.enum(['recruiter_screen', 'hiring_manager', 'panel', 'final', 'executive']).nullable().optional(),
  role_mode: z.enum(['cio', 'cto', 'ciso', 'vp_to_cxo']).nullable().optional(),
})

export const PrepChatHistoryItemSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().max(8000),
})

export const PrepChatBodySchema = z.object({
  message: z.string().trim().min(1, 'Message required').max(4000),
  brief: z.string().optional().default(''),
  companyName: z.string().optional().default(''),
  history: z.array(z.unknown()).optional().default([]),
})

export const SignalsClassifyBodySchema = z.object({
  companyId: z.string().uuid(),
  text: z.string().min(10).max(10_000),
  sourceUrl: z.string().optional(),
})

export const OutreachSendBodySchema = z.object({
  fullName: z.string().trim().optional().default(''),
  company: z.string().trim().optional().default(''),
  roleBucket: z.string().trim().optional().default(''),
  outreachChannel: z.string().trim().toLowerCase().optional().default('executives'),
  fitTier: z.string().trim().toLowerCase().optional().default(''),
  personaFocus: z.string().trim().optional().default(''),
  campaignStep: z.string().trim().optional().default(''),
  templateStep: z.string().trim().optional().default(''),
  useLatestTemplateDraft: z.boolean().optional().default(false),
  idempotencyKey: z.string().trim().optional().default(''),
  batchId: z.string().trim().optional().default(''),
  skipWorkerKickoff: z.boolean().optional().default(false),
  emailTo: z.string().trim().optional().default(''),
  subject: z.string().trim().optional().default(''),
  messageText: z.string().trim().optional().default(''),
  statusAfter: z.string().trim().optional().default('reached_out'),
  mode: z.string().trim().optional().default('live'),
})

export const TailorBodySchema = z.object({
  resumeText: z.string().min(200, 'Resume text is too short. Update your profile first.').max(50_000),
  jobDescription: z.string().min(100, 'Paste the full job description (at least a few paragraphs).').max(20_000),
  companyName: z.string().max(200).optional().default(''),
  targetTitle: z.string().max(200).optional().default(''),
})

export const TailorCheckBodySchema = z.object({
  tailoredResume: z.string().min(100).max(30_000),
  jobDescription: z.string().min(50).max(20_000),
  companyName: z.string().max(200).optional(),
})

export const TailorStrengthenBodySchema = z.object({
  tailoredResume: z.string().min(100).max(30_000),
  weakBullets: z.string().min(1).max(5000),
  jobDescription: z.string().max(10_000).optional(),
  companyName: z.string().max(200).optional(),
})

export const OnboardingFormSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  search_persona: z.enum(['csuite', 'vp', 'board', 'director']).refine(Boolean, {
    message: 'Please select your search level',
  }),
})

// Feedback System Schemas
export const FeedbackCategorySchema = z.enum(['bug', 'feature_request', 'ui_ux', 'performance', 'other'])
export const FeedbackStatusSchema = z.enum(['new', 'under_review', 'planned', 'in_progress', 'shipped', 'declined'])

export const FeedbackSubmitSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  body: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  category: FeedbackCategorySchema,
  screenshot_url: z.string().url().optional().or(z.literal('')),
})

export const FeedbackStatusUpdateSchema = z.object({
  status: FeedbackStatusSchema,
  change_note: z.string().max(2000).optional(),
  staff_notes: z.string().max(5000).optional(),
})

export const FeedbackCommentSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty').max(2000),
  is_staff_note: z.boolean().default(false),
})

// Returns the first Zod issue message or a fallback
export function firstZodError(err: z.ZodError): string {
  return err.issues[0]?.message ?? 'Invalid input'
}
