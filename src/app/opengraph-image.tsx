import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const alt = 'Starting Monday - Find executive roles before they post'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        background: '#0f172a',
        padding: '80px 80px 80px 96px',
        position: 'relative',
      }}
    >
      {/* Orange left accent bar */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 8, height: '100%', background: '#f97316' }} />

      {/* Brand */}
      <div style={{ display: 'flex', marginBottom: 40 }}>
        <span style={{ color: '#ffffff', fontSize: 16, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          STARTING&nbsp;
        </span>
        <span style={{ color: '#f97316', fontSize: 16, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          MONDAY
        </span>
      </div>

      {/* Headline */}
      <div
        style={{
          fontSize: 68,
          fontWeight: 700,
          lineHeight: 1.1,
          color: '#f8fafc',
          marginBottom: 36,
          maxWidth: 900,
        }}
      >
        The role was never posted. You found it anyway.
      </div>

      {/* Subline */}
      <div style={{ fontSize: 24, color: '#94a3b8', lineHeight: 1.5 }}>
        For senior executives in search.
      </div>
    </div>,
    size,
  )
}
