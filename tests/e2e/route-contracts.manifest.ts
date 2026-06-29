export type PublicRouteContract = {
  path: string
  ctaLimit: number
  requiresDisclosure?: boolean
}

export const LUXURY_PUBLIC_ROUTE_CONTRACTS: readonly PublicRouteContract[] = [
  { path: '/', ctaLimit: 20 },
  { path: '/about', ctaLimit: 20 },
  { path: '/pricing', ctaLimit: 20 },
  { path: '/demo', ctaLimit: 20 },
  { path: '/for-coaches', ctaLimit: 20, requiresDisclosure: true },
  { path: '/for-executives', ctaLimit: 20, requiresDisclosure: true },
  { path: '/for-cio', ctaLimit: 20 },
  { path: '/for-leaders', ctaLimit: 20 },
  { path: '/for-data-officer', ctaLimit: 20 },
  { path: '/for-cdo', ctaLimit: 20 },
  { path: '/for-ciso', ctaLimit: 20 },
  { path: '/for-cpo', ctaLimit: 20 },
  { path: '/for-coo', ctaLimit: 20 },
  { path: '/executives', ctaLimit: 20 },
  { path: '/executives/active', ctaLimit: 20 },
  { path: '/executives/passive', ctaLimit: 20 },
  { path: '/executives/personas', ctaLimit: 20 },
  { path: '/career-tools', ctaLimit: 20 },
  { path: '/method-and-evidence', ctaLimit: 20 },
  { path: '/references', ctaLimit: 20 },
  { path: '/evidence-hub', ctaLimit: 20 },
  { path: '/learn-more', ctaLimit: 20, requiresDisclosure: true },
  { path: '/learn-more/inside-the-system', ctaLimit: 20 },
  { path: '/learn-more/objections', ctaLimit: 20 },
  { path: '/learn-more/common-questions', ctaLimit: 20, requiresDisclosure: true },
  { path: '/blog', ctaLimit: 40 },
  { path: '/blog/how-we-estimate-early-role-signals', ctaLimit: 20 },
  { path: '/outplacement', ctaLimit: 20 },
] as const

export const LUXURY_REDIRECT_ROUTE_CONTRACTS = [
  {
    from: '/for-vp',
    mustNotEndWith: '/for-vp',
  },
] as const

export const FOR_COACHES_ROUTE_CONTRACT = {
  firstClickChecks: [
    {
      selector: 'a[href="https://app-na2.hubspot.com/meetings/246442927"]',
      expectedUrl: /app-na2\.hubspot\.com\/meetings\/246442927/,
    },
    {
      selector: 'a[href="/for-coaches/trust-pack"]',
      expectedUrl: /\/for-coaches\/trust-pack$/,
    },
    {
      selector: 'a[href="/partners#apply"]',
      expectedUrl: /\/partners#apply$/,
    },
  ],
  readability: {
    minReadingEase: 28,
    maxTinyRatio: 0.41,
    maxCtaCount: 13,
  },
  accessibility: {
    minDisclosureCount: 1,
  },
  loadReduction: {
    maxTinyTextRatio: 0.3,
    minSupport13to14Ratio: 0.62,
    maxUppercaseTiny: 4,
    maxCtaCount: 13,
    maxMajorSectionCtas: 2,
    requiresTrustPackLink: true,
  },
  allowedRepeatedCtas: [
    ['Open channel', 4],
    ['Preview timeline', 4],
  ] as const,
} as const
