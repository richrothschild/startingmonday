export type PlacedProofActionId = 'celebration' | 'maintenance' | 'peer_referral'

export type PlacedProofAction = {
  id: PlacedProofActionId
  title: string
  description: string
  href: string
  isEnabled: boolean
  disabledReason?: string
}

const PLACED_PROOF_ACTIONS: readonly PlacedProofAction[] = [
  {
    id: 'celebration',
    title: 'Capture the outcome signal',
    description: 'Record placement context so we can preserve the strongest trust moment in your search history.',
    href: '/dashboard/placed',
    isEnabled: true,
  },
  {
    id: 'maintenance',
    title: 'Switch to market maintenance mode',
    description: 'Keep quiet market visibility with lightweight monitoring after placement.',
    href: '/settings/billing',
    isEnabled: true,
  },
  {
    id: 'peer_referral',
    title: 'Refer one peer in transition',
    description: 'Referral flow is staged for Sprint 7 so this trust moment can seed a durable flywheel.',
    href: '/dashboard/placed#peer-referral',
    isEnabled: false,
    disabledReason: 'Coming in Sprint 7: proof architecture and procurement hardening.',
  },
]

export function getPlacedProofActions(): readonly PlacedProofAction[] {
  return PLACED_PROOF_ACTIONS
}