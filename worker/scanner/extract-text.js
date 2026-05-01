import * as cheerio from 'cheerio';

const MAX_CHARS = 50_000;

// Strips HTML noise and returns clean plain text suitable for role detection.
export function extractText(html) {
  const $ = cheerio.load(html);

  // Remove non-content elements
  $(
    'script, style, noscript, iframe, svg, img, video, audio, ' +
    'nav, header, footer, ' +
    '[role="navigation"], [role="banner"], [role="contentinfo"], [role="search"]'
  ).remove();

  // Remove common noise by class/id patterns
  $('[class*="cookie"], [class*="banner"], [class*="popup"], [class*="modal"], ' +
    '[class*="newsletter"], [class*="chat"], [id*="chat"], ' +
    '[aria-hidden="true"]').remove();

  const raw = $('body').text();

  return raw
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .slice(0, MAX_CHARS);
}
