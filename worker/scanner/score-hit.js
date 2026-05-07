import Anthropic from '@anthropic-ai/sdk';

// Lazy client so the API key is read at call time, not module load time.
let _client = null
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return _client
}

const SYSTEM_PROMPT =
  'You are an AI assistant that evaluates job posting fit. ' +
  'Respond only with valid JSON. No explanation, no markdown.';

const ROLE_TYPE_HINTS = {
  cio:          'Also treat as strong matches: VP Technology, VP IT, Head of Technology, SVP Technology.',
  cto:          'Also treat as strong matches: VP Engineering, SVP Engineering, Head of Engineering, Chief Architect.',
  cdo_data:     'Also treat as strong matches: Head of Data, SVP Analytics, VP Data Science, Chief AI Officer, VP Data and Analytics.',
  cdo_digital:  'Also treat as strong matches: VP Digital Transformation, Head of Digital, SVP Digital, VP Digital Strategy.',
  ciso:         'Also treat as strong matches: VP Information Security, Director of Cybersecurity, Head of Security, Chief Security Officer, VP Cybersecurity.',
  cpo:          'Also treat as strong matches: VP Product, Head of Product, GM Product, SVP Product, VP Product Management.',
  coo:          'Also treat as strong matches: President, SVP Operations, Head of Operations, VP Operations (senior scope).',
  vp_technology:'Also treat as strong matches: Director of Engineering, Head of Engineering, VP IT, Director of Technology.',
}

// Calls Claude Haiku to score a single detected role hit against the user profile.
// Returns { score: 0-100, is_match: boolean, summary: string }
export async function scoreHit(hit, userProfile, companyName) {
  const roleHint = userProfile.role_type ? (ROLE_TYPE_HINTS[userProfile.role_type] ?? '') : ''
  const userPrompt = `
Job title detected: "${hit.title}"
Company: ${companyName}

Candidate profile:
- Target roles: ${(userProfile.target_titles || []).join(', ') || 'Not specified'}
- Target sectors: ${(userProfile.target_sectors || []).join(', ') || 'Not specified'}
- Role type: ${userProfile.role_type || 'Not specified'}${roleHint ? `\n- Role equivalents: ${roleHint}` : ''}

Respond with JSON only:
{
  "score": <integer 0-100>,
  "is_match": <boolean, true if score >= 60>,
  "summary": "<one sentence — why this is or isn't a strong match>"
}`.trim();

  try {
    const response = await getClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content[0].text.trim();
    const jsonStr = text.match(/\{[\s\S]*\}/)?.[0];
    if (!jsonStr) throw new Error('No JSON found in response');
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error(`[score-hit] Scoring failed for "${hit.title}": ${err.message}`);
    return { score: 0, is_match: false, summary: 'Scoring unavailable.' };
  }
}
