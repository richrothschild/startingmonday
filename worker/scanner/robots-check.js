// Returns true if scanning the given URL is permitted by robots.txt
export async function isAllowedByRobots(pageUrl) {
  try {
    const { protocol, host } = new URL(pageUrl);
    const robotsUrl = `${protocol}//${host}/robots.txt`;

    const res = await fetch(robotsUrl, {
      headers: { 'User-Agent': 'StartingMondayBot/1.0' },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return true; // No robots.txt = allowed

    const text = await res.text();
    return !isDisallowed(text, pageUrl);
  } catch {
    return true; // Network error fetching robots.txt — don't block the scan
  }
}

function isDisallowed(robotsTxt, url) {
  const path = new URL(url).pathname;
  const lines = robotsTxt.split('\n').map(l => l.split('#')[0].trim());

  let applicable = false;

  for (const line of lines) {
    const lower = line.toLowerCase();

    if (lower.startsWith('user-agent:')) {
      const agent = line.slice('user-agent:'.length).trim();
      applicable = agent === '*' || agent.toLowerCase() === 'startingmondaybot';
    } else if (applicable && lower.startsWith('disallow:')) {
      const disallowPath = line.slice('disallow:'.length).trim();
      if (disallowPath && path.startsWith(disallowPath)) return true;
    }
  }

  return false;
}
