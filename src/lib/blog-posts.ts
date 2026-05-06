export interface BlogPostMeta {
  slug: string
  title: string
  description: string
  date: string
  readTime: string
  keywords: string[]
}

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: 'executive-search-firms-cio',
    title: 'What Executive Search Firms Actually Want from CIO Candidates',
    description: 'Most technology executives think about executive search firms the wrong way. Here is how retained search actually works, what gets you on the short list, and why timing matters more than almost anything else.',
    date: '2026-05-06',
    readTime: '6 min read',
    keywords: [
      'executive search firms CIO',
      'how to work with executive search firms',
      'CIO search firms',
      'what executive recruiters want',
      'CIO job search strategy',
      'retained executive search',
      'how to get on CIO short list',
    ],
  },
  {
    slug: 'cio-job-search-timeline',
    title: 'How Long Does a CIO Job Search Really Take?',
    description: 'The honest answer most people do not say out loud: six to eighteen months. The range is that wide for a reason, and where you land in it depends on decisions you make before you start.',
    date: '2026-05-06',
    readTime: '5 min read',
    keywords: [
      'CIO job search timeline',
      'how long does executive job search take',
      'CIO job search strategy',
      'executive job search timeline',
      'technology executive search',
      'CIO career transition',
    ],
  },
  {
    slug: 'vp-to-cio-transition',
    title: 'How VPs of Technology Make the Move to CIO',
    description: 'The VP-to-CIO move is not a promotion. It is a repositioning. What changes in the CIO seat, what search firms look for, and how to build the case before the search starts.',
    date: '2026-05-07',
    readTime: '5 min read',
    keywords: [
      'VP to CIO transition',
      'VP technology to CIO',
      'how to become a CIO',
      'VP IT to CIO',
      'CIO career path',
      'technology executive promotion',
      'VP of technology career',
    ],
  },
  {
    slug: 'ciso-interview-preparation',
    title: 'How to Prepare for a CISO Interview',
    description: 'CISO interviews test something most security executives are not trained to do: explain risk in business terms to a room that does not think in frameworks. Here is how to prepare for the conversations that actually matter.',
    date: '2026-05-07',
    readTime: '5 min read',
    keywords: [
      'CISO interview preparation',
      'CISO interview questions',
      'chief information security officer interview',
      'how to prepare for CISO interview',
      'cybersecurity executive interview',
      'CISO board presentation',
    ],
  },
  {
    slug: 'what-companies-want-chief-data-officer',
    title: 'What Companies Actually Want in a Chief Data Officer',
    description: 'Most CDO job descriptions tell you what the company wants you to do. Very few tell you what they actually need. The gap between those two things is where most CDO searches go wrong.',
    date: '2026-05-07',
    readTime: '5 min read',
    keywords: [
      'chief data officer requirements',
      'what companies look for in CDO',
      'chief data officer skills',
      'CDO hiring criteria',
      'chief data officer job search',
      'chief data officer career',
    ],
  },
  {
    slug: 'cio-compensation-negotiation',
    title: 'How to Negotiate CIO Compensation',
    description: 'The compensation conversation for a CIO role has a different structure than every negotiation you have had before. What to know before the offer, how to read the room, and where most executives leave money on the table.',
    date: '2026-05-07',
    readTime: '6 min read',
    keywords: [
      'CIO compensation',
      'CIO salary negotiation',
      'chief information officer compensation',
      'how to negotiate executive compensation',
      'CIO total compensation',
      'technology executive salary',
      'CIO offer negotiation',
    ],
  },
  {
    slug: 'cio-board-presentation',
    title: 'How to Prepare for a Board Presentation as a New CIO',
    description: 'The board presentation is not a technology briefing. It is a risk and value conversation. What the board actually wants to hear in the first ninety days, and how to walk in ready.',
    date: '2026-05-08',
    readTime: '5 min read',
    keywords: [
      'CIO board presentation',
      'new CIO board meeting',
      'CIO presenting to board of directors',
      'technology board presentation',
      'CIO first 90 days',
      'how to present to board as CIO',
      'CIO board communication',
    ],
  },
  {
    slug: 'pe-backed-cio',
    title: 'What PE-Backed Companies Look for in a CIO',
    description: 'PE-backed companies hire CIOs for a different reason than public companies do. The mandate is tighter, the timeline is compressed, and the equity is structured around an exit. What you need to know before you take the call.',
    date: '2026-05-08',
    readTime: '6 min read',
    keywords: [
      'PE-backed CIO',
      'private equity CIO',
      'CIO private equity company',
      'technology leader private equity',
      'CIO equity compensation PE',
      'private equity technology executive',
      'CIO portfolio company',
    ],
  },
  {
    slug: 'executive-resume-gaps',
    title: 'The Executive Resume Gaps That Kill CIO Candidacies',
    description: 'Most CIO resumes are read by a search firm associate before they reach a partner. Here are the gaps that filter candidates out before the first conversation and how to close them.',
    date: '2026-05-08',
    readTime: '5 min read',
    keywords: [
      'CIO resume',
      'executive resume for CIO',
      'CIO resume tips',
      'technology executive resume',
      'how to write a CIO resume',
      'CIO resume mistakes',
      'executive resume gaps',
    ],
  },
  {
    slug: 'retained-search-firms',
    title: 'How to Work with Retained Search Firms Without Losing Leverage',
    description: 'Retained search firms work for the client, not the candidate. Understanding how they actually operate changes how you manage every relationship and every search.',
    date: '2026-05-08',
    readTime: '5 min read',
    keywords: [
      'retained search firms CIO',
      'how to work with executive recruiters',
      'executive search firm strategy',
      'CIO headhunter relationship',
      'retained search candidate strategy',
      'executive recruiter tips',
      'how to get on CIO short list',
    ],
  },
]

export function getPost(slug: string): BlogPostMeta | undefined {
  return BLOG_POSTS.find(p => p.slug === slug)
}
