// Database type definitions for feedback system

export type FeedbackItem = {
  id: string
  type: 'feedback' // V1 is feedback-only
  title: string
  body: string
  category: 'bug' | 'feature_request' | 'ui_ux' | 'performance' | 'other'
  status: 'new' | 'under_review' | 'planned' | 'in_progress' | 'shipped' | 'declined'
  user_id: string
  staff_notes: string | null
  screenshot_url: string | null
  created_at: string
  updated_at: string
  first_staff_response_at: string | null
  status_decided_at: string | null
  vote_count: number
  comment_count: number
  user_voted: boolean
  user_profiles?: {
    full_name: string
    email: string
  } | null
}

export type FeedbackVote = {
  id: string
  user_id: string
  item_id: string
  created_at: string
}

export type FeedbackComment = {
  id: string
  user_id: string
  item_id: string
  body: string
  is_staff_note: boolean
  created_at: string
  updated_at: string
}

export type FeedbackStatusHistory = {
  id: string
  item_id: string
  old_status: string | null
  new_status: 'new' | 'under_review' | 'planned' | 'in_progress' | 'shipped' | 'declined'
  changed_by: string
  change_note: string | null
  created_at: string
}

// Extended types for UI
export type FeedbackItemWithUser = FeedbackItem & {
  user_profiles: {
    full_name: string
    email: string
  } | null
}

export type FeedbackItemWithComments = FeedbackItem & {
  feedback_comments: (FeedbackComment & {
    user_profiles: {
      full_name: string
    } | null
  })[]
}

export type FeedbackItemWithHistory = FeedbackItem & {
  feedback_status_history: (FeedbackStatusHistory & {
    user_profiles: {
      full_name: string
    } | null
  })[]
}

// SLA tracking
export type FeedbackSLAMetrics = {
  item_id: string
  title: string
  status: string
  created_at: string
  first_staff_response_at: string | null
  status_decided_at: string | null
  time_to_first_response_hours: number | null
  time_to_decision_hours: number | null
  exceeds_24h_no_response: boolean
  exceeds_7d_no_decision: boolean
}
