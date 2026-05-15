import { ImageResponse } from 'next/og'

/* eslint-disable @stylistic/jsx-quotes */

export const runtime = 'nodejs'
export const alt = 'Starting Monday - Be ready. Be early.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const containerStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column' as const,
  justifyContent: 'center',
  alignItems: 'flex-start',
  background: '#0f172a',
  padding: '80px 80px 80px 96px',
  position: 'relative' as const,
}

const accentBarStyle = {
  position: 'absolute' as const,
  left: 0,
  top: 0,
  width: 8,
  height: '100%',
  background: '#f97316',
}

const brandContainerStyle = {
  display: 'flex',
  marginBottom: 40,
}

const brandStartStyle = {
  color: '#ffffff',
  fontSize: 16,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
}

const brandMonthStyle = {
  color: '#f97316',
  fontSize: 16,
  fontWeight: 700,
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
}

const headlineStyle = {
  fontSize: 68,
  fontWeight: 700,
  lineHeight: 1.1,
  color: '#f8fafc',
  marginBottom: 36,
  maxWidth: 900,
}

const sublineStyle = {
  fontSize: 24,
  color: '#94a3b8',
  lineHeight: 1.5,
}

export default function Image() {
  return new ImageResponse(
    <div style={containerStyle}>
      {/* Orange left accent bar */}
      <div style={accentBarStyle} />

      {/* Brand */}
      <div style={brandContainerStyle}>
        <span style={brandStartStyle}>
          STARTING&nbsp;
        </span>
        <span style={brandMonthStyle}>
          MONDAY
        </span>
      </div>

      {/* Headline */}
      <div style={headlineStyle}>
        The role was never posted. You found it anyway.
      </div>

      {/* Subline */}
      <div style={sublineStyle}>
        For senior executives in search.
      </div>
    </div>,
    size,
  )
}
