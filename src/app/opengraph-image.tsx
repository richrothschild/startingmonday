
import { ImageResponse } from 'next/og'
import './opengraph-image.css'

export const runtime = 'nodejs'
export const alt = 'Starting Monday - Be ready. Be early.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div className="og-container">
      {/* Orange left accent bar */}
      <div className="og-accent-bar" />

      {/* Brand */}
      <div className="og-brand-container">
        <span className="og-brand-start">
          STARTING&nbsp;
        </span>
        <span className="og-brand-month">
          MONDAY
        </span>
      </div>

      {/* Headline */}
      <div className="og-headline">
        The role was never posted. You found it anyway.
      </div>

      {/* Subline */}
      <div className="og-subline">
        For senior executives in search.
      </div>
    </div>,
    size,
  )
}
