/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require('sharp');
const path = require('path');

// Create LinkedIn company banner with icon: 1200x627px
async function createBanner() {
  try {
    // Create SVG background with text
    // LinkedIn company banners: 1200x627px (16:9)
    // Safe visible area: 1050x480px centered
    // One line only - centered in middle
    const bgSvg = `
      <svg width="1200" height="627" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="1200" height="627" fill="url(#grad)"/>
        <rect width="8" height="627" fill="#fb923c"/>
        
        <!-- One line: Signal. Prepare. Execute. -->
        <text x="750" y="260" font-size="52" font-weight="900" fill="#fbbf24" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle">Signal. Prepare. Execute.</text>
      </svg>
    `;

    // Create the base banner
    const banner = await sharp(Buffer.from(bgSvg)).png();
    
    const result = await banner
      .toFile(path.join(__dirname, '../public/brand/linkedin-company-banner-final.png'));

    console.log('✓ LinkedIn company banner created: 1200x627px');
    console.log('  Location: public/brand/linkedin-company-banner-final.png');
  } catch (error) {
    console.error('Error creating banner:', error.message);
  }
}

createBanner();
