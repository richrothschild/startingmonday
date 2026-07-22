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
