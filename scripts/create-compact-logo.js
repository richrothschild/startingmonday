/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require('sharp');
const path = require('path');

// Create a compact logo that eliminates white space
async function createCompactLogo() {
  try {
    // Compact icon: 1000x1000px, fills the frame
    const logoSvg = `
      <svg width="1000" height="1000" xmlns="http://www.w3.org/2000/svg">
        <!-- Dark background rounded square -->
        <rect width="1000" height="1000" rx="140" fill="#1a2a3a"/>
        
        <!-- Orange accent bar at top -->
        <rect width="1000" height="80" rx="140" fill="#fb923c"/>
        
        <!-- Chart bars (white) - centered, no padding -->
        <g fill="#ffffff">
          <!-- Bar 1 -->
          <rect x="300" y="500" width="120" height="380" rx="20"/>
          <!-- Bar 2 (tallest) -->
          <rect x="520" y="320" width="120" height="560" rx="20"/>
          <!-- Bar 3 -->
          <rect x="740" y="420" width="120" height="460" rx="20"/>
        </g>
      </svg>
    `;

    // Convert to 1000x1000px PNG
    const result = await sharp(Buffer.from(logoSvg))
      .png()
      .toFile(path.join(__dirname, '../public/brand/starting-monday-logo-compact.png'));

    console.log('✓ Compact logo created: 1000x1000px (fills frame)');
    console.log('  Location: public/brand/starting-monday-logo-compact.png');
  } catch (error) {
    console.error('Error creating compact logo:', error.message);
  }
}

createCompactLogo();
