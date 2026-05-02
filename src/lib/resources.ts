// Curated external resources surfaced contextually in prep briefs.
// Version 1: Manager Tools / Career Tools episodes tagged by topic.
// Add more resources here as partnerships expand.

export type Resource = {
  title: string
  source: string
  url: string
  description: string
  tags: string[]
}

export const RESOURCES: Resource[] = [
  {
    title: 'The Interview Series',
    source: 'Career Tools',
    url: 'https://www.manager-tools.com/map/careers/interviewing',
    description: 'Step-by-step guidance on every phase of the executive interview process.',
    tags: ['interview', 'preparation', 'general'],
  },
  {
    title: 'Behavioral Interview Questions',
    source: 'Career Tools',
    url: 'https://www.manager-tools.com/map/careers/interviewing',
    description: 'How to structure STAR-format answers for behavioral questions at the executive level.',
    tags: ['interview', 'behavioral', 'pushback', 'narrative'],
  },
  {
    title: 'Salary Negotiation',
    source: 'Career Tools',
    url: 'https://www.manager-tools.com/map/careers/salary-negotiation',
    description: 'How to negotiate compensation at the senior executive level without leaving money on the table.',
    tags: ['negotiation', 'offer', 'compensation'],
  },
  {
    title: 'Thank You Notes After Interviews',
    source: 'Career Tools',
    url: 'https://www.manager-tools.com/map/careers/interviewing',
    description: 'Why and how to send follow-up notes that keep you top of mind with interviewers.',
    tags: ['follow-up', 'after interview', 'thank you'],
  },
  {
    title: 'Networking for Job Seekers',
    source: 'Career Tools',
    url: 'https://www.manager-tools.com/map/careers/networking',
    description: 'Systematic approach to building and leveraging your network during a search.',
    tags: ['networking', 'contacts', 'outreach', 'people'],
  },
  {
    title: 'The First 90 Days Planning',
    source: 'Career Tools',
    url: 'https://www.manager-tools.com/map/careers/interviewing',
    description: 'How to signal executive readiness by discussing your entry plan in the interview room.',
    tags: ['first 90 days', 'onboarding', 'transition', 'entry plan'],
  },
  {
    title: 'References: How to Prepare Them',
    source: 'Career Tools',
    url: 'https://www.manager-tools.com/map/careers/references',
    description: 'How to brief your references so they tell the story you need told.',
    tags: ['references', 'preparation'],
  },
  {
    title: 'Executive Presence in Interviews',
    source: 'Career Tools',
    url: 'https://www.manager-tools.com/map/careers/interviewing',
    description: 'How to project confidence and authority in high-stakes executive conversations.',
    tags: ['executive presence', 'confidence', 'narrative', 'positioning'],
  },
  {
    title: 'Questions to Ask Interviewers',
    source: 'Career Tools',
    url: 'https://www.manager-tools.com/map/careers/interviewing',
    description: 'The questions that signal strategic thinking versus the ones that signal inexperience.',
    tags: ['questions', 'interview', 'strategic'],
  },
  {
    title: 'Evaluating a Job Offer',
    source: 'Career Tools',
    url: 'https://www.manager-tools.com/map/careers/evaluating-offers',
    description: 'Framework for evaluating an executive offer beyond base salary.',
    tags: ['offer', 'evaluation', 'decision'],
  },
]

/**
 * Returns up to maxResults resources relevant to the given text context.
 * Matches by checking if any resource tag appears in the lowercased context.
 */
export function getRelevantResources(context: string, maxResults = 3): Resource[] {
  const lower = context.toLowerCase()
  const scored = RESOURCES.map(r => {
    const hits = r.tags.filter(tag => lower.includes(tag)).length
    return { resource: r, hits }
  })
  return scored
    .filter(s => s.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, maxResults)
    .map(s => s.resource)
}

/**
 * Returns a default set of resources when no specific context is available.
 */
export function getDefaultResources(maxResults = 2): Resource[] {
  return RESOURCES.slice(0, maxResults)
}
