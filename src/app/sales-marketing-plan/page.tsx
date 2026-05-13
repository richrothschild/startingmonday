import type { Metadata } from 'next'
import Link from 'next/link'

type PhrasingBlock = {
  label: string
  lines: string[]
}

type Task = {
  day: string
  title: string
  owner: string
  outcome: string
  actions: string[]
  phrasing?: PhrasingBlock[]
  doneWhen: string
}

type Week = {
  id: string
  label: string
  focus: string
  checkpoint: string
  days: Task[]
}

export const metadata: Metadata = {
  title: 'Sales Plan - Starting Monday',
  description: 'A 30-day, clickable sales plan for acquiring customers, converting partners, and executing premium outreach with detailed instructions and messaging.',
  alternates: {
    canonical: 'https://startingmonday.app/sales-marketing-plan',
  },
  openGraph: {
    title: 'Sales Plan - Starting Monday',
    description: 'A 30-day, clickable sales plan for customer acquisition, partners, and premium outreach.',
    url: 'https://startingmonday.app/sales-marketing-plan',
    type: 'article',
  },
}

const WEEKS: Week[] = [
  {
    id: 'week-1',
    label: 'Week 1',
    focus: 'Lock the conversion path before spending more time on traffic.',
    checkpoint: 'At the end of the week you should know the primary promise, the primary CTA, and the three biggest friction points in the funnel.',
    days: [
      {
        day: 'Day 1',
        title: 'Audit the full funnel',
        owner: 'Founder + Growth',
        outcome: 'A prioritized blocker list from homepage to activation.',
        actions: [
          'Trace the path from first visit to signup completion and first meaningful action.',
          'Mark every point where a user might hesitate, backtrack, or lose trust.',
          'Capture screenshots and note the exact copy or UI element that caused the friction.',
          'Rank each issue by severity: blocker, distraction, or polish.'
        ],
        phrasing: [
          {
            label: 'Frame for the review',
            lines: [
              'The only question today is: what stops a qualified executive from signing up?',
              'If it does not move signup or activation, it is not a priority.'
            ],
          },
        ],
        doneWhen: 'You have one ranked list of blockers with owners attached.'
      },
      {
        day: 'Day 2',
        title: 'Choose one primary promise',
        owner: 'Founder + Design/UX',
        outcome: 'One message, one CTA, one trust line.',
        actions: [
          'Choose the one sentence that the homepage must say better than anything else.',
          'Pick the primary CTA and remove any competing action from the above-the-fold area.',
          'Write one short trust sentence that proves the product is safe, private, or methodical.',
          'Make sure the headline, body copy, and CTA all point to the same outcome.'
        ],
        phrasing: [
          {
            label: 'Candidate promise lines',
            lines: [
              'Spot executive opportunities before they post.',
              'Run your campaign before the field forms.',
              'Start your campaign.'
            ],
          },
        ],
        doneWhen: 'The page has one obvious promise and one obvious next step.'
      },
      {
        day: 'Day 3',
        title: 'Simplify the funnel',
        owner: 'Engineering + Design/UX',
        outcome: 'A single path from interest to signup.',
        actions: [
          'Remove any CTA that competes with the primary signup action.',
          'Make sure the home, pricing, and signup pages use the same language.',
          'Reduce decisions before account creation: fewer clicks, fewer choices, fewer side quests.',
          'Make the site feel like one guided motion rather than a set of options.'
        ],
        phrasing: [
          {
            label: 'Rule of thumb',
            lines: [
              'One primary action per page.',
              'If a second action is necessary, it should be clearly secondary.'
            ],
          },
        ],
        doneWhen: 'The path from homepage to signup feels obvious without explanation.'
      },
      {
        day: 'Day 4',
        title: 'Instrument the funnel',
        owner: 'Engineering + Data/Ops',
        outcome: 'A baseline dashboard for the acquisition path.',
        actions: [
          'Track page view, CTA click, signup start, signup complete, activation, and return visit.',
          'Use consistent event names so the funnel is easy to read later.',
          'Verify that every event fires once and only once.',
          'Create a simple view that shows drop-off between each step.'
        ],
        phrasing: [
          {
            label: 'Recommended event names',
            lines: [
              'cta_clicked',
              'signup_started',
              'signup_completed',
              'first_company_added',
              'briefing_viewed'
            ],
          },
        ],
        doneWhen: 'You can see where people fall out of the funnel.'
      },
      {
        day: 'Day 5',
        title: 'Check performance on mobile and desktop',
        owner: 'Engineering + Design/UX',
        outcome: 'A short list of speed and layout fixes.',
        actions: [
          'Review page speed on mobile and desktop before adding any new visual flourish.',
          'Cut or defer any element that slows the first click or makes the hero heavier.',
          'Inspect layout shift, image sizing, and any blocking scripts.',
          'Keep the page feeling fast enough that the product seems decisive.'
        ],
        phrasing: [
          {
            label: 'Review rule',
            lines: [
              'If it slows the first click, cut it.',
              'If it helps conversion and still feels fast, keep it.'
            ],
          },
        ],
        doneWhen: 'You know the top 3 performance fixes and which ones are worth shipping now.'
      },
      {
        day: 'Day 6',
        title: 'Define the synthetic council taxonomy',
        owner: 'Founder + Data/Ops',
        outcome: 'A reusable review template for every major page and journey.',
        actions: [
          'Define council roles for executive user, UX, UI, QA, support, behavioral economics, and sales.',
          'Add the named lenses you want to reuse: Thaler, Naval, Cialdini, Chris Voss.',
          'Decide how each council member scores clarity, trust, friction, and conversion.',
          'Write the rule for every review: no vague praise, only keep/cut/move/simplify decisions.'
        ],
        phrasing: [
          {
            label: 'Council rule',
            lines: [
              'Every comment must end in an action.',
              'If the review does not change a decision, it is not useful.'
            ],
          },
        ],
        doneWhen: 'You have a council structure that can be reused across pages and journeys.'
      },
      {
        day: 'Day 7',
        title: 'Run the weekly checkpoint',
        owner: 'Founder',
        outcome: 'A keep / cut / iterate decision for the first week.',
        actions: [
          'Review the blockers list and decide which items are actual blockers versus nice-to-haves.',
          'Lock the strongest message and the strongest CTA for the next week of tests.',
          'Choose the first acquisition channels to test hard, not broadly.',
          'Write down the one thing that must be better before more traffic is worth paying for.'
        ],
        phrasing: [
          {
            label: 'Decision prompt',
            lines: [
              'What changed this week?',
              'What are we keeping, cutting, or simplifying next?'
            ],
          },
        ],
        doneWhen: 'Week 2 can start with one clear message and one clear channel test.'
      },
    ],
  },
  {
    id: 'week-2',
    label: 'Week 2',
    focus: 'Find the message and channel that actually get the right users to act.',
    checkpoint: 'You should end the week with a winning angle, the first real acquisition signal, and a short list of objections that need copy fixes.',
    days: [
      {
        day: 'Day 8',
        title: 'Write three acquisition messages',
        owner: 'Founder + Growth',
        outcome: 'Three testable angles with different emotional hooks.',
        actions: [
          'Create one message about early signals, one about campaign control, and one about privacy/trust.',
          'Keep each message short enough that it could be used in a LinkedIn post or DM.',
          'Do not add new product claims; use the product differently in each angle.',
          'Decide how you will measure which message got the right user, not just the most clicks.'
        ],
        phrasing: [
          {
            label: 'Message A - early signals',
            lines: [
              'We watch your target companies and tell you when to move before the search goes public.'
            ],
          },
          {
            label: 'Message B - campaign control',
            lines: [
              'Starting Monday gives you the tools to run the campaign, not just react to postings.'
            ],
          },
          {
            label: 'Message C - privacy and trust',
            lines: [
              'Your search stays yours. No employer network, no matching marketplace, no public profile exposure.'
            ],
          },
        ],
        doneWhen: 'You have three messages that can be tested in the wild.'
      },
      {
        day: 'Day 9',
        title: 'Build landing variants',
        owner: 'Engineering + Design/UX',
        outcome: 'A simple test page for each winning angle.',
        actions: [
          'Build the smallest possible variation around the message, not a whole new product page.',
          'Keep the same CTA and pricing logic so the test isolates the message.',
          'Make the hero copy, subhead, and proof line match the angle exactly.',
          'Make sure the page still feels like Starting Monday, not a random campaign asset.'
        ],
        phrasing: [
          {
            label: 'Hero copy pattern',
            lines: [
              'Headline: one sentence with the claim.',
              'Subhead: one sentence with the mechanism.',
              'CTA: Start your campaign.'
            ],
          },
        ],
        doneWhen: 'You can send traffic to the variants without rebuilding the product.'
      },
      {
        day: 'Day 10',
        title: 'Launch the first channel test',
        owner: 'Growth',
        outcome: 'Live traffic and the first channel readout.',
        actions: [
          'Pick one channel to test first so the signal is not diluted.',
          'Send real traffic to the best variant and track the result from visit to signup.',
          'Watch for the first conversion friction immediately, not after the week is over.',
          'Capture any user comments that explain why they clicked or bounced.'
        ],
        phrasing: [
          {
            label: 'Post angle',
            lines: [
              'I scanned 200 career pages this week. Here is what executive hiring actually looks like right now.',
              'If you are in search, the timing window matters more than the posting.'
            ],
          },
        ],
        doneWhen: 'You have one live acquisition experiment producing data.'
      },
      {
        day: 'Day 11',
        title: 'Start direct outreach to executives',
        owner: 'Growth',
        outcome: 'A short list of target executives and first responses.',
        actions: [
          'Build a list of 15-20 highly relevant executives, not a broad spray list.',
          'Send short, specific messages that point to the exact reason the product helps them now.',
          'Keep the ask small: a demo, a reply, or permission to send a live example.',
          'Track which opener produced a response so the next batch gets sharper.'
        ],
        phrasing: [
          {
            label: 'Executive message',
            lines: [
              'I built Starting Monday for executives who need to spot the move before it posts.',
              'If you are actively searching, I can show you the live demo in under five minutes.',
              'If it is useful, I will send the private prep brief we use to get people moving faster.'
            ],
          },
        ],
        doneWhen: 'You have sent targeted messages and learned which one lands best.'
      },
      {
        day: 'Day 12',
        title: 'Review signups and drop-off',
        owner: 'Data/Ops + Founder',
        outcome: 'The top reasons users do not convert yet.',
        actions: [
          'Check where the funnel loses the most users: landing page, signup start, or activation.',
          'If possible, ask 2 simple questions in onboarding about why the user came and what they expected.',
          'Write down the objections that repeat across users.',
          'Turn each objection into a copy fix or product fix instead of an opinion.'
        ],
        phrasing: [
          {
            label: 'Questions to ask',
            lines: [
              'What were you hoping to solve today?',
              'What almost stopped you from starting?'
            ],
          },
        ],
        doneWhen: 'You know what is blocking conversion and why.'
      },
      {
        day: 'Day 13',
        title: 'Tighten copy, proof, and trust',
        owner: 'Founder + Design/UX',
        outcome: 'The page speaks to real objections instead of abstract aspirations.',
        actions: [
          'Rewrite any copy that sounds generic, promotional, or over-claimed.',
          'Make the proof line visible and explain the methodology where skepticism is likely.',
          'Keep the privacy and confidentiality language simple and specific.',
          'Move or remove any section that interrupts the main flow.'
        ],
        phrasing: [
          {
            label: 'Trust language',
            lines: [
              'The product is designed for confidential executive searches.',
              'Claims are backed by method and sources, not hype.'
            ],
          },
        ],
        doneWhen: 'The page feels sharper, calmer, and more trustworthy.'
      },
      {
        day: 'Day 14',
        title: 'Weekly checkpoint',
        owner: 'Founder',
        outcome: 'A channel decision and one message to scale.',
        actions: [
          'Review the best-performing acquisition angle and the first conversion signals.',
          'Pick the channel to double down on next week.',
          'Cut any angle that produced attention without user intent.',
          'Write the one lesson that should change next week’s work immediately.'
        ],
        phrasing: [
          {
            label: 'Decision prompt',
            lines: [
              'Which message and channel actually brought in the right user?',
              'What do we scale, and what do we stop doing?'
            ],
          },
        ],
        doneWhen: 'Week 3 starts with a real winning message and channel direction.'
      },
    ],
  },
  {
    id: 'week-3',
    label: 'Week 3',
    focus: 'Turn coaches, recruiters, and financial advisors into a repeatable sales motion.',
    checkpoint: 'By the end of the week you should have partner language, partner pages, and the first outreach wave out the door.',
    days: [
      {
        day: 'Day 15',
        title: 'Define the partner offer',
        owner: 'Founder + Partnerships',
        outcome: 'A clean pitch for coaches, recruiters, and financial advisors.',
        actions: [
          'Write one partner value prop for each segment: coach, recruiter, advisor.',
          'Explain how the product makes their client work better without replacing them.',
          'State the economics clearly so the partner can see the upside at a glance.',
          'Keep the language short enough that it can be used in a DM or a one-pager.'
        ],
        phrasing: [
          {
            label: 'Coach pitch',
            lines: [
              'Starting Monday handles the monitoring, briefing, and follow-up tracking so you can stay focused on strategy and client relationship.'
            ],
          },
          {
            label: 'Recruiter pitch',
            lines: [
              'This helps your candidates arrive earlier, better prepared, and more organized without adding work for you.'
            ],
          },
          {
            label: 'Advisor pitch',
            lines: [
              'This gives clients a structured way to manage a high-stakes transition with less chaos and more optionality.'
            ],
          },
        ],
        doneWhen: 'Each partner segment has a message you would actually send.'
      },
      {
        day: 'Day 16',
        title: 'Draft partner pages',
        owner: 'Design/UX + Engineering',
        outcome: 'Dedicated pages or sections for each partner type.',
        actions: [
          'Create a simple page for coaches, recruiters, and financial advisors.',
          'Each page should explain why the product matters to their clients, why it matters to them, and what the next step is.',
          'Keep the layout direct: problem, value, economics, next action.',
          'Avoid over-describing the product itself; focus on what the partner gets by using it.'
        ],
        phrasing: [
          {
            label: 'Page headline formula',
            lines: [
              'Help your clients execute with more confidence.',
              'Turn the search from reactive to disciplined.'
            ],
          },
        ],
        doneWhen: 'A partner can understand the offer without a call.'
      },
      {
        day: 'Day 17',
        title: 'Add referral economics and workflow clarity',
        owner: 'Founder + Engineering',
        outcome: 'A partner path that feels simple and credible.',
        actions: [
          'Show the referral economics where the partner is already looking, not buried in fine print.',
          'Explain the referral process in one sentence: how the partner introduces the client and how attribution works.',
          'Make sure the partner sees the client benefit and the partner benefit in the same place.',
          'Reduce the amount of explanation needed to say yes.'
        ],
        phrasing: [
          {
            label: 'Economics line',
            lines: [
              '20% recurring referral commission.',
              'Active plan referrals pay $39.80 per client per month.'
            ],
          },
        ],
        doneWhen: 'Partners can see the economics and the workflow in one glance.'
      },
      {
        day: 'Day 18',
        title: 'Build the outreach list',
        owner: 'Partnerships',
        outcome: 'A focused list of high-quality prospects to contact.',
        actions: [
          'Build a list of 25 high-quality coaches, recruiters, and advisors.',
          'Prioritize people who already speak to executives in transition.',
          'Capture the source for each contact so you know where the list came from.',
          'Do not add broad or low-fit leads just to make the number look larger.'
        ],
        phrasing: [
          {
            label: 'Where to look',
            lines: [
              'LinkedIn thought leaders',
              'coach associations',
              'recruiter networks',
              'financial advisor communities',
              'podcasts and guest lists'
            ],
          },
        ],
        doneWhen: 'You have a short list worth contacting this week.'
      },
      {
        day: 'Day 19',
        title: 'Send the first outreach wave',
        owner: 'Partnerships',
        outcome: 'First partner replies and booked conversations.',
        actions: [
          'Send short outreach with one clear ask: reply, demo, or refer one client.',
          'Personalize the first sentence so the recipient knows the note is not mass mail.',
          'Keep the message low-friction and specific to their audience.',
          'Follow up once with a single useful proof point, not a long explanation.'
        ],
        phrasing: [
          {
            label: 'Partner outreach message',
            lines: [
              'I work with executives in transition and built Starting Monday to make the search more disciplined.',
              'It helps your clients track target companies, run better prep, and stay organized between conversations.',
              'If this is relevant, I would love to show you the private partner flow in five minutes.'
            ],
          },
        ],
        doneWhen: 'At least a few of the right people have replied.'
      },
      {
        day: 'Day 20',
        title: 'Create the partner demo asset',
        owner: 'Founder + Design/UX',
        outcome: 'A short demo or brief that makes the partner story easy to show.',
        actions: [
          'Make one clean demo asset that shows how a partner would use the product with a client.',
          'Focus the demo on workflow and outcomes, not on every feature.',
          'Include one or two screenshots or a live walkthrough that a partner can share.',
          'Make it fast enough that the partner can understand the value without a meeting deck.'
        ],
        phrasing: [
          {
            label: 'Demo framing',
            lines: [
              'You keep the strategy and the relationship. We handle the execution layer between sessions.'
            ],
          },
        ],
        doneWhen: 'You have one reusable asset that supports partner selling.'
      },
      {
        day: 'Day 21',
        title: 'Weekly checkpoint',
        owner: 'Founder',
        outcome: 'A choice about which partner segment to pursue next.',
        actions: [
          'Review partner replies and identify which segment showed the most interest.',
          'Decide whether coaches, recruiters, or advisors should become the first repeatable partner motion.',
          'Capture the objections that appear most often.',
          'Write one sentence describing why the strongest partner segment cares right now.'
        ],
        phrasing: [
          {
            label: 'Decision prompt',
            lines: [
              'Which partner segment is easiest to explain, easiest to sell, and most likely to convert?',
            ],
          },
        ],
        doneWhen: 'Week 4 starts with one partner segment to focus on.'
      },
    ],
  },
  {
    id: 'week-4',
    label: 'Week 4',
    focus: 'Make the first five minutes, support path, and feedback loop reduce churn instead of creating it.',
    checkpoint: 'By the end of the week you should know whether the product feels fast, clear, and useful enough to keep users coming back.',
    days: [
      {
        day: 'Day 22',
        title: 'Define the first five minutes',
        owner: 'Founder + Engineering + Design/UX',
        outcome: 'A clear first-run success path.',
        actions: [
          'Write the first five minutes from the user perspective: what happens, what they click, what they get back.',
          'Make the first success visible as quickly as possible.',
          'Remove any setup step that does not help the user feel progress.',
          'Use the onboarding path to lead toward the first meaningful win, not just account completion.'
        ],
        phrasing: [
          {
            label: 'Onboarding line',
            lines: [
              'Add your first target company.',
              'Upload your resume.',
              'Your first briefing is ready by morning.'
            ],
          },
        ],
        doneWhen: 'A new user can see how the product starts helping them almost immediately.'
      },
      {
        day: 'Day 23',
        title: 'Build the help and FAQ path',
        owner: 'Support/CS + Engineering',
        outcome: 'A support surface that reduces hesitation and tickets.',
        actions: [
          'Create a help page that answers the most common activation and support questions.',
          'Add a short FAQ section that reduces the need for support contact.',
          'Make the help path easy to find from pages where users typically hesitate.',
          'Write answers that sound calm, direct, and specific to the product.'
        ],
        phrasing: [
          {
            label: 'Support tone',
            lines: [
              'Everything you need to get started should be one click away.',
              'If you still need help, the answer should be direct and fast.'
            ],
          },
        ],
        doneWhen: 'Users can find the answer before they decide to leave.'
      },
      {
        day: 'Day 24',
        title: 'Add chat where it actually helps',
        owner: 'Engineering + Support/CS',
        outcome: 'A chat path that removes friction instead of adding noise.',
        actions: [
          'Put chat where users are likely to need a quick answer or reassurance.',
          'Make sure the chat handoff does not feel like another form to fill out.',
          'Define the few topics chat should handle first: setup, billing, account access, and activation.',
          'Use chat to resolve confusion, not to create more surface area.'
        ],
        phrasing: [
          {
            label: 'Chat opener',
            lines: [
              'Need help getting set up?',
              'Ask a question and we will point you to the fastest path.'
            ],
          },
        ],
        doneWhen: 'Chat exists only where it makes the product easier to use.'
      },
      {
        day: 'Day 25',
        title: 'Capture feedback and suggestions',
        owner: 'Data/Ops + Support/CS',
        outcome: 'A way to learn what users want without hunting through scattered messages.',
        actions: [
          'Add a feedback page or form that lets users share an issue or suggest an improvement.',
          'Consider a simple voting mechanism so the best ideas rise to the top.',
          'Decide whether to add incentives for useful feedback or keep it lightweight and voluntary.',
          'Make sure feedback goes somewhere visible enough that it can be reviewed weekly.'
        ],
        phrasing: [
          {
            label: 'Feedback prompt',
            lines: [
              'What would make this more useful for you this week?',
              'What should we fix, add, or simplify next?'
            ],
          },
        ],
        doneWhen: 'User suggestions can be collected, reviewed, and ranked.'
      },
      {
        day: 'Day 26',
        title: 'Run the synthetic council through the journey',
        owner: 'Founder + Data/Ops',
        outcome: 'A full-journey critique from multiple synthetic personas.',
        actions: [
          'Run each synthetic user through the complete journey: discovery, signup, onboarding, support, and return visit.',
          'Ask each council lens what felt unclear, persuasive, risky, or slow.',
          'Document the recurring patterns so the council can classify users into groups.',
          'Use the council output to decide what should be improved before the next sprint.'
        ],
        phrasing: [
          {
            label: 'Council prompt',
            lines: [
              'What in this journey would make you act now?',
              'What would make you hesitate, and why?'
            ],
          },
        ],
        doneWhen: 'You have an actionable review, not just opinions.'
      },
      {
        day: 'Day 27',
        title: 'Fix the top retention blockers',
        owner: 'Engineering + Design/UX',
        outcome: 'Fewer reasons for users to stop after signup.',
        actions: [
          'Take the top blockers from the council and funnel review and ship the highest-leverage fixes first.',
          'Prioritize issues that affect activation, first use, or first return visit.',
          'Avoid spending time on low-impact polish while real friction remains.',
          'Write down which fix should move retention the most and why.'
        ],
        phrasing: [
          {
            label: 'Fix rule',
            lines: [
              'If it blocks a user from getting value, fix it now.',
              'If it just looks nice, park it.'
            ],
          },
        ],
        doneWhen: 'The highest friction point from the journey has been removed or reduced.'
      },
      {
        day: 'Day 28',
        title: 'Weekly checkpoint',
        owner: 'Founder',
        outcome: 'A decision about what is good enough to scale next.',
        actions: [
          'Review activation, support, and council findings together.',
          'Decide whether the product is ready for more users or still needs one more round of friction removal.',
          'List the three things that must improve before the next acquisition push.',
          'Write one short summary of what this month taught you about the customer.'
        ],
        phrasing: [
          {
            label: 'Checkpoint question',
            lines: [
              'What did users actually do this week, and what did that teach us?'
            ],
          },
        ],
        doneWhen: 'You know whether to scale acquisition now or refine first.'
      },
    ],
  },
  {
    id: 'closeout',
    label: 'Closeout',
    focus: 'Turn the month into repeatable operating data and premium outreach execution.',
    checkpoint: 'By the end of the month you should know your first acquisition winner, your partner lane, and whether the Mark outreach can feel unmistakably premium.',
    days: [
      {
        day: 'Day 29',
        title: 'Build the weekly ECR report',
        owner: 'Data/Ops',
        outcome: 'A weekly view of emotional load, cognitive load, and retention.',
        actions: [
          'Define the inputs that influence ECR and decide how each should be measured.',
          'Create one weighted composite score so the trend can be monitored over time.',
          'Use visuals only where they reduce confusion or improve the reading experience.',
          'Make the report actionable: one thing to keep, one thing to cut, one thing to investigate.'
        ],
        phrasing: [
          {
            label: 'Report title',
            lines: [
              'ECR weekly report: emotion, cognitive load, retention.'
            ],
          },
        ],
        doneWhen: 'There is one repeatable report that can guide product and customer decisions.'
      },
      {
        day: 'Day 30',
        title: 'Deliver the Mark-quality outreach package',
        owner: 'Founder + Partnerships + Design/UX',
        outcome: 'A private, high-trust outreach experience that feels built for one person.',
        actions: [
          'Make the Mark experience feel personal, fast, and completely ungated.',
          'Prepare the private demo, the first note, and the supporting claims so there is no friction or ambiguity.',
          'Explain the methodology behind the claims so the offer feels credible to a skeptical operator.',
          'Make the experience feel like it was built for him alone, not adapted from a generic sales campaign.'
        ],
        phrasing: [
          {
            label: 'Mark outreach note',
            lines: [
              'I built a private demo for you with no email wall and no extra friction.',
              'It shows the live prep brief, the timing signals, and the method behind the claims.',
              'If useful, I would like to walk you through it directly.'
            ],
          },
        ],
        doneWhen: 'The outreach feels like an A+ experience rather than a standard pitch.'
      },
    ],
  },
]

const PRIORITIES = [
  {
    title: 'Customer acquisition',
    body: 'Make the homepage, signup, and first-run experience convert more of the right users.',
  },
  {
    title: 'Partner sales',
    body: 'Build coach, recruiter, and advisor motions that create recurring distribution.',
  },
  {
    title: 'Premium outreach',
    body: 'Treat Mark Horstman as an account-based experience with zero fluff and high trust.',
  },
]

const MESSAGE_BANK = [
  {
    title: 'Executive outreach',
    body: [
      'I built Starting Monday for senior executives who need to spot the move before it posts.',
      'If you are in active search, I can show you the live demo in under five minutes.',
      'If it is useful, I will send the private prep brief we use to help people move faster.'
    ],
  },
  {
    title: 'Coach pitch',
    body: [
      'Starting Monday handles the monitoring, briefing, and follow-up tracking so you can stay focused on strategy and client relationship.',
      'You keep the judgment. We handle the execution layer between sessions.'
    ],
  },
  {
    title: 'Recruiter pitch',
    body: [
      'This helps your candidates arrive earlier, better prepared, and more organized without adding work for you.',
      'It gives you a sharper client experience without changing your core process.'
    ],
  },
  {
    title: 'Advisor pitch',
    body: [
      'This gives clients a structured way to manage a high-stakes transition with less chaos and more optionality.',
      'It fits the moment when the question is not only money, but timing, confidence, and next-step clarity.'
    ],
  },
  {
    title: 'Mark note',
    body: [
      'I built a private demo for you with no email wall and no extra friction.',
      'It shows the live prep brief, the timing signals, and the method behind the claims.'
    ],
  },
]

function TaskCard({ task }: { task: Task }) {
  return (
    <details className="group border border-slate-200 rounded-xl bg-white overflow-hidden shadow-[0_1px_0_rgba(15,23,42,0.02)]">
      <summary className="cursor-pointer list-none px-4 sm:px-5 py-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors">
        <div>
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-1">{task.day}</p>
          <p className="text-[15px] font-semibold text-slate-900 leading-snug">{task.title}</p>
          <p className="text-[12px] text-slate-500 mt-1.5">Owner: {task.owner}</p>
        </div>
        <span className="shrink-0 text-slate-400 text-[18px] leading-none group-open:rotate-45 transition-transform">+</span>
      </summary>
      <div className="px-4 sm:px-5 pb-5 pt-0 space-y-4 border-t border-slate-100">
        <div className="pt-4">
          <p className="text-[12px] font-semibold text-slate-900 mb-1">Outcome</p>
          <p className="text-[13px] text-slate-600 leading-relaxed">{task.outcome}</p>
        </div>

        <div>
          <p className="text-[12px] font-semibold text-slate-900 mb-2">How to execute</p>
          <ul className="space-y-2 text-[13px] text-slate-600 leading-relaxed">
            {task.actions.map(action => (
              <li key={action} className="flex gap-2.5">
                <span className="text-orange-500 shrink-0">-</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>

        {task.phrasing && task.phrasing.length > 0 && (
          <div className="space-y-3">
            <p className="text-[12px] font-semibold text-slate-900">Needed content and phrasing</p>
            {task.phrasing.map(block => (
              <div key={block.label} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500 mb-2">{block.label}</p>
                <div className="space-y-1.5 text-[13px] text-slate-700 leading-relaxed">
                  {block.lines.map(line => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 px-4 py-3">
          <p className="text-[12px] font-semibold text-emerald-900 mb-1">Done when</p>
          <p className="text-[13px] text-emerald-900/80 leading-relaxed">{task.doneWhen}</p>
        </div>
      </div>
    </details>
  )
}

export default function SalesMarketingPlanPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="bg-slate-950 sticky top-0 z-20 border-b border-slate-900/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-[10px] font-bold tracking-[0.18em] uppercase text-white hover:opacity-80 transition-opacity" aria-label="Go to homepage">
            <span className="text-white">Starting </span><span className="text-orange-500">Monday</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/pricing" className="hidden sm:inline text-[13px] text-slate-400 hover:text-white transition-colors">Pricing</Link>
            <Link href="/optimize" className="hidden sm:inline text-[13px] text-slate-400 hover:text-white transition-colors">Free Profile Grade</Link>
            <Link href="/login" className="text-[13px] text-slate-400 hover:text-white transition-colors">Log in</Link>
            <Link href="/signup" className="text-[13px] font-semibold bg-white text-slate-900 px-4 py-1.5 rounded hover:bg-slate-100 transition-colors">Try free</Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="bg-slate-950 px-4 sm:px-6 py-16 sm:py-20 border-b border-slate-900">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-3xl">
              <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-orange-500 mb-4">Sales plan</p>
              <h1 className="text-[36px] sm:text-[48px] font-bold text-white leading-[1.05] tracking-tight mb-5">
                Build customers first.
                <br />
                Partners second.
                <br />
                Mark quality last.
              </h1>
              <p className="text-[16px] sm:text-[18px] text-slate-300 leading-relaxed max-w-2xl mb-6">
                This is a 30-day execution board for acquisition, partner sales, and premium outreach. Click any day to expand the instructions, the needed content, and the exact phrasing to use.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {['Customer acquisition', 'Partner channels', 'Mark-quality outreach', 'Click to expand'].map(chip => (
                  <span key={chip} className="text-[11px] font-semibold text-slate-300 border border-slate-700 rounded-full px-3 py-1.5 bg-slate-900/60">
                    {chip}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/signup" className="inline-block bg-orange-500 text-slate-900 text-[13px] font-bold px-5 py-2.5 rounded hover:bg-orange-600 transition-colors">Start free trial</Link>
                <Link href="/pricing" className="inline-block text-[13px] font-semibold text-white border border-slate-700 px-5 py-2.5 rounded hover:border-slate-500 hover:bg-slate-900 transition-colors">Review pricing</Link>
                <Link href="/about" className="inline-block text-[13px] font-semibold text-slate-300 border border-slate-800 px-5 py-2.5 rounded hover:border-slate-700 hover:text-white transition-colors">About Richard</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 py-10 border-b border-slate-100 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PRIORITIES.map(priority => (
                <div key={priority.title} className="bg-white border border-slate-200 rounded-xl p-5">
                  <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-orange-500 mb-2">Priority</p>
                  <p className="text-[15px] font-semibold text-slate-900 mb-2">{priority.title}</p>
                  <p className="text-[13px] text-slate-600 leading-relaxed">{priority.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 py-14 border-b border-slate-100">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-400 mb-2">Copy bank</p>
                <h2 className="text-[24px] font-bold text-slate-900 leading-tight">Messaging to use in outreach and partner conversations</h2>
              </div>
              <p className="hidden md:block text-[13px] text-slate-500 max-w-md leading-relaxed">These are the short forms. Expand the plan below to see where each line should be used and what to do with it.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {MESSAGE_BANK.map(item => (
                <details key={item.title} className="group border border-slate-200 rounded-xl bg-white overflow-hidden">
                  <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="text-[15px] font-semibold text-slate-900">{item.title}</p>
                      <p className="text-[12px] text-slate-500 mt-1">Click for the exact phrasing to use</p>
                    </div>
                    <span className="text-slate-400 text-[18px] leading-none group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-5 pb-5 pt-0 border-t border-slate-100">
                    <div className="pt-4 space-y-2 text-[13px] text-slate-700 leading-relaxed">
                      {item.body.map(line => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 py-16 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-slate-400 mb-2">30-day board</p>
              <h2 className="text-[28px] sm:text-[32px] font-bold text-slate-900 leading-tight">Day-by-day execution, fully clickable</h2>
              <p className="text-[14px] text-slate-500 mt-3 max-w-2xl leading-relaxed">Every task opens to show the objective, the actions, the wording to use, and the definition of done. This is intentionally sales-first: acquire users, then build partner leverage, then execute the Mark outreach with no wasted motion.</p>
            </div>

            <div className="space-y-10">
              {WEEKS.map(week => (
                <section key={week.id} id={week.id} className="scroll-mt-24">
                  <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 mb-5">
                    <div>
                      <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-2">{week.label}</p>
                      <h3 className="text-[22px] font-bold text-slate-900">{week.focus}</h3>
                    </div>
                    <p className="text-[13px] text-slate-500 leading-relaxed max-w-2xl">{week.checkpoint}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {week.days.map(task => (
                      <TaskCard key={task.day} task={task} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 pb-16">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-2xl bg-slate-950 border border-slate-900 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div className="max-w-2xl">
                <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-orange-500 mb-3">End state</p>
                <h2 className="text-[24px] sm:text-[28px] font-bold text-white leading-tight mb-3">One winning acquisition message, one partner lane, one premium outreach experience.</h2>
                <p className="text-[14px] text-slate-300 leading-relaxed">If the month works, the result should be obvious: more qualified users, a cleaner partner motion, and one Mark-level outreach package that feels bespoke and credible.</p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <Link href="/signup" className="inline-block bg-orange-500 text-slate-900 text-[13px] font-bold px-5 py-2.5 rounded hover:bg-orange-600 transition-colors">Start free trial</Link>
                <Link href="/demo" className="inline-block text-[13px] font-semibold text-white border border-slate-700 px-5 py-2.5 rounded hover:border-slate-500 hover:bg-slate-900 transition-colors">Run the live demo</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
