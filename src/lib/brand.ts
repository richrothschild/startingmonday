export type BrandContext = {
  isMandateSignal: boolean
  name: string
  wordmarkPrimary: string
  wordmarkAccent: string
  origin: string
}

const MANDATE_SIGNAL_HOSTS = new Set(['mandatesignal.com', 'www.mandatesignal.com'])

function normalizeHost(host: string | null | undefined): string {
  if (!host) return ''
  return host.toLowerCase().split(':')[0]
}

function expandHostCandidates(host: string | null | undefined): string[] {
  if (!host) return []
  return host
    .split(',')
    .map((part) => normalizeHost(part.trim()))
    .filter(Boolean)
}

export function getBrandContextFromHost(host: string | null | undefined): BrandContext {
  const normalizedHost = normalizeHost(host)
  const isMandateSignal = MANDATE_SIGNAL_HOSTS.has(normalizedHost)

  if (isMandateSignal) {
    return {
      isMandateSignal: true,
      name: 'MandateSignal',
      wordmarkPrimary: 'Mandate',
      wordmarkAccent: 'Signal',
      origin: 'https://mandatesignal.com',
    }
  }

  return {
    isMandateSignal: false,
    name: 'Starting Monday',
    wordmarkPrimary: 'Starting',
    wordmarkAccent: 'Monday',
    origin: 'https://startingmonday.app',
  }
}

export function getBrandContextFromHosts(hosts: Array<string | null | undefined>): BrandContext {
  const candidates = hosts.flatMap((host) => expandHostCandidates(host))

  const mandateSignalHost = candidates.find((candidate) => MANDATE_SIGNAL_HOSTS.has(candidate))
  if (mandateSignalHost) {
    return getBrandContextFromHost(mandateSignalHost)
  }

  const fallbackHost = candidates[0] ?? null
  return getBrandContextFromHost(fallbackHost)
}
