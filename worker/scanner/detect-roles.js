const LEVEL_KEYWORDS = [
  'vp', 'vice president', 'director', 'head of', 'chief', 'cio', 'cto', 'coo', 'cfo', 'cpo',
  'principal', 'staff', 'senior', 'lead', 'manager', 'president', 'fellow',
];

const FUNCTION_KEYWORDS = [
  'technology', 'engineering', 'it ', 'information technology', 'infrastructure',
  'digital', 'transformation', 'operations', 'product', 'platform', 'data', 'security',
  'software', 'systems', 'architecture', 'cloud', 'devops', 'ai', 'machine learning',
];

const MAX_HITS = 20;
const MAX_TITLE_LENGTH = 120;
const MIN_TITLE_LENGTH = 5;

// Heuristic scan of extracted page text to surface candidate job titles.
// Runs before Claude scoring to filter out non-role lines cheaply.
export function detectRoles(text, userProfile) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const hits = [];
  const seen = new Set();

  const targetRoles = (userProfile.target_titles || []).map(r => r.toLowerCase());

  for (const line of lines) {
    if (line.length > MAX_TITLE_LENGTH || line.length < MIN_TITLE_LENGTH) continue;

    const lower = line.toLowerCase();
    const hasLevel = LEVEL_KEYWORDS.some(kw => lower.includes(kw));
    const hasFunction = FUNCTION_KEYWORDS.some(kw => lower.includes(kw));
    const matchesTarget = targetRoles.some(role =>
      lower.includes(role.split(' ')[0])
    );

    if ((hasLevel && hasFunction) || matchesTarget) {
      if (!seen.has(lower)) {
        seen.add(lower);
        hits.push({ title: line });
      }
    }

    if (hits.length >= MAX_HITS) break;
  }

  return hits;
}
