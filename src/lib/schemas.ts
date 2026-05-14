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

export const SignalsClassifyBodySchema = z.object({
  companyId: z.string().uuid(),
  text: z.string().min(10).max(10_000),
  sourceUrl: z.string().optional(),
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
