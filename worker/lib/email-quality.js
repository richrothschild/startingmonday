const MAX_SUBJECT_CHARS = 70
const MAX_SENTENCE_WORDS = 35
const MAX_AVG_SENTENCE_WORDS = 20

function htmlToText(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function sentences(text) {
  return text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.split(/\s+/).length > 2)
}

export function reviewEmail(subject, html) {
  const issues = []

  if (subject.length > MAX_SUBJECT_CHARS) {
    issues.push('Subject is ' + subject.length + ' chars - Gmail truncates at ' + MAX_SUBJECT_CHARS)
  }

  if (html.includes('&mdash;')) {
    issues.push('HTML body contains &mdash; entity - use a regular hyphen')
  }

  const parts = sentences(htmlToText(html))
  if (!parts.length) return issues

  const wordCounts = parts.map(s => s.split(/\s+/).length)
  const longOnes = wordCounts.filter(n => n > MAX_SENTENCE_WORDS)
  if (longOnes.length) {
    issues.push(longOnes.length + ' sentence(s) over ' + MAX_SENTENCE_WORDS + ' words (longest: ' + Math.max(...longOnes) + ')')
  }

  const avg = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length
  if (avg > MAX_AVG_SENTENCE_WORDS) {
    issues.push('Average sentence is ' + Math.round(avg) + ' words - aim for under ' + MAX_AVG_SENTENCE_WORDS)
  }

  return issues
}