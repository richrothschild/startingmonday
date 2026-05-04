import { createClient } from '@/lib/supabase/server'

export type SubscriptionStatus = 'inactive' | 'trialing' | 'active' | 'paused' | 'past_due' | 'canceled'
export type SubscriptionTier = 'free' | 'monitor' | 'active'

export interface UserSubscription {
  tier: SubscriptionTier
  status: SubscriptionStatus
  trialEndsAt: Date | null
  periodEnd: Date | null
  isActive: boolean   // trialing or paid active (paused users lose feature access)
  isPaid: boolean     // paid subscription exists (active or paused - hides plan cards)
  isPaused: boolean
}

const FEATURE_TIERS: Record<string, SubscriptionTier[]> = {
  pipeline:         ['free', 'monitor', 'active'],
  contacts:         ['free', 'monitor', 'active'],
  scan:             ['monitor', 'active'],
  ai_chat:          ['active'],
  prep_brief:       ['active'],
  strategy_brief:   ['active'],
  outreach_draft:   ['active'],
  daily_briefing:   ['active'],
  resume_tailor:    ['active'],
}

export async function getUserSubscription(userId: string): Promise<UserSubscription> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('users')
    .select('subscription_tier, subscription_status, trial_ends_at, subscription_period_end')
    .eq('id', userId)
    .single()

  const tier = (data?.subscription_tier ?? 'free') as SubscriptionTier
  const status = (data?.subscription_status ?? 'inactive') as SubscriptionStatus
  const trialEndsAt = data?.trial_ends_at ? new Date(data.trial_ends_at) : null
  const periodEnd = data?.subscription_period_end ? new Date(data.subscription_period_end) : null

  const trialActive = status === 'trialing' && trialEndsAt != null && trialEndsAt > new Date()
  const paidActive = status === 'active'
  const isPaused = status === 'paused'
  const isActive = trialActive || paidActive

  return { tier, status, trialEndsAt, periodEnd, isActive, isPaid: paidActive || isPaused, isPaused }
}

export function canAccessFeature(sub: UserSubscription, feature: string): boolean {
  if (!sub.isActive) return false
  const allowed = FEATURE_TIERS[feature]
  if (!allowed) return false
  return allowed.includes(sub.tier) || sub.status === 'trialing'
}
