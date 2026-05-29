import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <svg width="180" height="180" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Starting Monday icon">
        <defs>
          <linearGradient id="gradC" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#FB923C" />
          </linearGradient>
        </defs>

        <rect width="512" height="512" rx="72" fill="#0B1220" />
        <rect x="96" y="98" width="320" height="316" rx="32" fill="#111827" stroke="#334155" strokeWidth="8" />
        <rect x="128" y="128" width="256" height="32" rx="16" fill="#1F2937" />
        <rect x="142" y="194" width="44" height="168" rx="12" fill="#E2E8F0" />
        <rect x="234" y="226" width="44" height="136" rx="12" fill="#E2E8F0" />
        <rect x="326" y="174" width="44" height="188" rx="12" fill="#E2E8F0" />
        <path d="M126 106C154 70 198 48 248 48C296 48 340 68 370 102" fill="none" stroke="url(#gradC)" strokeWidth="18" strokeLinecap="round" />
        <circle cx="392" cy="100" r="10" fill="#F97316" />
      </svg>
    ),
    { ...size }
  )
}