'use client'

import { ExecutiveBrandingProfile } from '@/components/executive/ExecutiveBrandingProfile'

/**
 * Branding profile sub-route under optionality.
 * Rendered client-side so the form is interactive.
 * Sprint ITS-3 / Ticket 22.
 */
export default function OptionalityBrandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-4">
        <div className="mb-6">
          <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-1">
            Executive Branding Profile
          </p>
          <h1 className="text-[22px] font-bold text-slate-900 leading-tight">
            Your narrative thesis and audience variants
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Keep this updated whenever your role scope or story changes.
          </p>
        </div>
        <ExecutiveBrandingProfile
          lifecycleState="optionality"
          personaVariant="in_role_quiet"
          onSave={(data) => {
            // TODO: persist to Supabase via /api/executive/branding-profile
            console.info('Branding profile saved', data)
          }}
        />
      </main>
    </div>
  )
}
