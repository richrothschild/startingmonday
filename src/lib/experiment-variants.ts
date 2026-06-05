export type VariantProps = Record<string, string | number | boolean | null>

function chooseBucket(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % 2
}

function keyForChannel(channel: string) {
  return `sm_variant_${channel}`
}

export function withDeterministicVariant(props: VariantProps | undefined, distinctId: string | null | undefined): VariantProps {
  const base = { ...(props ?? {}) }
  if (typeof base.variant_key === 'string' && base.variant_key.length > 0) {
    return base
  }

  const channel = typeof base.channel === 'string' ? base.channel : null
  if (!channel || (channel !== 'executives' && channel !== 'coaches')) {
    return base
  }

  const storageKey = keyForChannel(channel)
  const v1 = channel === 'executives' ? 'executive_proof_v1' : 'coach_bluf_v1'
  const v2 = channel === 'executives' ? 'executive_proof_v2' : 'coach_bluf_v2'

  try {
    const existing = window.localStorage.getItem(storageKey)
    if (existing === v1 || existing === v2) {
      base.variant_key = existing
      return base
    }

    const seed = distinctId && distinctId.length > 0 ? distinctId : `${channel}_${Date.now()}`
    const selected = chooseBucket(seed) === 0 ? v1 : v2
    window.localStorage.setItem(storageKey, selected)
    base.variant_key = selected
    return base
  } catch {
    base.variant_key = v1
    return base
  }
}
