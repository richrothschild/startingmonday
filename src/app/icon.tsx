import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'serif',
            fontWeight: 700,
            fontSize: 22,
            color: '#f97316',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          M
        </span>
      </div>
    ),
    { ...size }
  )
}
