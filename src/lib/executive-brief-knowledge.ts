export type MentalModel = {
  id: string
  name: string
  category: 'decision' | 'strategy' | 'risk' | 'communication' | 'execution'
  summary: string
  source: string
  tags: string[]
}

export type FirstPrinciple = {
  id: string
  seat: string
  principle: string
  whyItMatters: string
  source: string
  tags: string[]
}

export const EXECUTIVE_MENTAL_MODELS: MentalModel[] = [
  { id: 'inversion', name: 'Inversion', category: 'decision', summary: 'Define what failure looks like and design to avoid it.', source: 'Charlie Munger', tags: ['risk', 'failure', 'strategy'] },
  { id: 'base-rates', name: 'Base Rates', category: 'decision', summary: 'Start from historical frequencies before custom narratives.', source: 'Kahneman and Tetlock', tags: ['forecasting', 'probability'] },
  { id: 'bayes', name: 'Bayesian Updating', category: 'decision', summary: 'Update belief strength as new evidence appears.', source: 'Bayes theorem', tags: ['forecasting', 'evidence'] },
  { id: 'expected-value', name: 'Expected Value', category: 'decision', summary: 'Compare options by probability-weighted outcome.', source: 'Decision theory', tags: ['tradeoff', 'probability'] },
  { id: 'second-order', name: 'Second-Order Effects', category: 'strategy', summary: 'Trace consequences beyond immediate impact.', source: 'Munger and Parrish', tags: ['consequence', 'strategy'] },
  { id: 'opportunity-cost', name: 'Opportunity Cost', category: 'decision', summary: 'Every commitment consumes scarce alternatives.', source: 'Economics canon', tags: ['tradeoff', 'focus'] },
  { id: 'two-way-door', name: 'Two-Way vs One-Way Doors', category: 'decision', summary: 'Move fast on reversible calls and slow on irreversible ones.', source: 'Jeff Bezos', tags: ['speed', 'reversibility'] },
  { id: 'margin-safety', name: 'Margin of Safety', category: 'risk', summary: 'Preserve buffers around key assumptions.', source: 'Graham and Munger', tags: ['risk', 'uncertainty'] },
  { id: 'premortem', name: 'Pre-Mortem', category: 'risk', summary: 'Assume failure and identify root causes now.', source: 'Gary Klein', tags: ['risk', 'planning'] },
  { id: 'constraints', name: 'Theory of Constraints', category: 'execution', summary: 'System output is constrained by the bottleneck.', source: 'Eliyahu Goldratt', tags: ['bottleneck', 'operations'] },
  { id: 'queueing', name: 'Queueing Pressure', category: 'execution', summary: 'Near-full utilization causes nonlinear delays.', source: 'Operations research', tags: ['throughput', 'ops'] },
  { id: 'feedback-loops', name: 'Feedback Loops', category: 'execution', summary: 'Reinforcing and balancing loops drive momentum.', source: 'Donella Meadows', tags: ['systems', 'momentum'] },
  { id: 'network-effects', name: 'Network Effects', category: 'strategy', summary: 'User value rises as participation rises.', source: 'Platform economics', tags: ['platform', 'moat'] },
  { id: 'switching-costs', name: 'Switching Costs', category: 'strategy', summary: 'Retention durability often depends on migration friction.', source: 'Strategy canon', tags: ['moat', 'retention'] },
  { id: 'jobs-to-be-done', name: 'Jobs To Be Done', category: 'strategy', summary: 'Customers hire outcomes, not feature lists.', source: 'Clayton Christensen', tags: ['customer', 'value'] },
  { id: 'five-forces', name: 'Five Forces', category: 'strategy', summary: 'Industry structure determines long-term margin pressure.', source: 'Michael Porter', tags: ['competition', 'market'] },
  { id: 'good-strategy', name: 'Kernel of Good Strategy', category: 'strategy', summary: 'Diagnosis, guiding policy, and coherent action.', source: 'Richard Rumelt', tags: ['strategy', 'focus'] },
  { id: 'probabilistic-thinking', name: 'Probabilistic Thinking', category: 'decision', summary: 'Express confidence in percentages, not absolutes.', source: 'Annie Duke', tags: ['forecasting', 'risk'] },
  { id: 'resulting', name: 'Avoid Resulting', category: 'decision', summary: 'Judge process quality separately from outcome luck.', source: 'Annie Duke', tags: ['decision', 'review'] },
  { id: 'incentives', name: 'Incentives Drive Behavior', category: 'strategy', summary: 'Behavior follows reward structures.', source: 'Charlie Munger', tags: ['behavior', 'organization'] },
  { id: 'goodhart', name: "Goodhart's Law", category: 'execution', summary: 'Metrics degrade when they become sole targets.', source: 'Charles Goodhart', tags: ['metrics', 'governance'] },
  { id: 'psych-safety', name: 'Psychological Safety', category: 'communication', summary: 'Teams surface risk faster when dissent is safe.', source: 'Amy Edmondson', tags: ['team', 'risk'] },
  { id: 'tactical-empathy', name: 'Tactical Empathy', category: 'communication', summary: 'Label counterpart concerns to reduce friction.', source: 'Chris Voss', tags: ['negotiation', 'interview'] },
  { id: 'batna', name: 'BATNA', category: 'communication', summary: 'The best alternative defines negotiation leverage.', source: 'Fisher and Ury', tags: ['negotiation', 'tradeoff'] },
  { id: 'story-data-action', name: 'Story Data Action', category: 'communication', summary: 'Use narrative, evidence, and clear next move.', source: 'Executive comms practice', tags: ['communication', 'leadership'] },
  { id: 'first-principles', name: 'First Principles Decomposition', category: 'decision', summary: 'Reduce problem to non-negotiable truths.', source: 'Feynman tradition', tags: ['reasoning', 'clarity'] },
  { id: 'feynman-technique', name: 'Feynman Technique', category: 'communication', summary: 'If you cannot explain it simply, you do not understand it.', source: 'Richard Feynman', tags: ['learning', 'clarity'] },
  { id: 'latticework', name: 'Latticework of Models', category: 'decision', summary: 'Use multiple disciplines to avoid one-model blindness.', source: 'Charlie Munger', tags: ['reasoning', 'multi-model'] },
  { id: 'anti-fragile', name: 'Antifragility', category: 'risk', summary: 'Some systems improve with bounded stress.', source: 'Nassim Taleb', tags: ['risk', 'resilience'] },
  { id: 'survival-first', name: 'Survival First', category: 'risk', summary: 'Avoid catastrophic downside before maximizing upside.', source: 'Taleb and Munger', tags: ['risk', 'portfolio'] },
]

export const EXECUTIVE_FIRST_PRINCIPLES: FirstPrinciple[] = [
  { id: 'operator-ownership', seat: 'Operator', principle: 'Every key outcome needs one accountable owner.', whyItMatters: 'Shared ownership creates hidden failure gaps.', source: 'COO operating doctrine', tags: ['execution', 'ownership'] },
  { id: 'operator-process', seat: 'Operator', principle: 'Documented process precedes scale hiring.', whyItMatters: 'Headcount amplifies process quality, good or bad.', source: 'Operations canon', tags: ['process', 'scale'] },
  { id: 'operator-flow', seat: 'Operator', principle: 'Flow throughput beats local utilization.', whyItMatters: 'Busy teams can still miss strategic outcomes.', source: 'Goldratt', tags: ['throughput', 'bottleneck'] },
  { id: 'capitalist-edge', seat: 'Capitalist', principle: 'Large markets without structural edge remain unattractive.', whyItMatters: 'Scale potential alone does not produce durable value capture.', source: 'Venture screening practice', tags: ['market', 'moat'] },
  { id: 'capitalist-efficiency', seat: 'Capitalist', principle: 'Capital efficiency reflects founder judgment quality.', whyItMatters: 'Resource discipline predicts resilience under uncertainty.', source: 'Modern VC practice', tags: ['finance', 'judgment'] },
  { id: 'skeptic-bear', seat: 'Skeptic', principle: 'Every bull case requires an explicit bear case.', whyItMatters: 'Unstated downside assumptions create strategic blind spots.', source: 'Market analysis discipline', tags: ['risk', 'assumptions'] },
  { id: 'skeptic-base-rates', seat: 'Skeptic', principle: 'Compare narrative claims against base rates.', whyItMatters: 'Exceptionalist stories frequently overstate likely outcomes.', source: 'Kahneman and Tetlock', tags: ['forecasting', 'evidence'] },
  { id: 'builder-reliability', seat: 'Builder', principle: 'Reliability and security are product-level commitments.', whyItMatters: 'Trust and retention collapse under operational fragility.', source: 'SRE and security engineering', tags: ['reliability', 'trust'] },
  { id: 'builder-modularity', seat: 'Builder', principle: 'Modular boundaries reduce blast radius.', whyItMatters: 'Tightly coupled systems fail in chains.', source: 'Architecture canon', tags: ['systems', 'resilience'] },
  { id: 'storyteller-positioning', seat: 'Storyteller', principle: 'Positioning is strategy, not copywriting.', whyItMatters: 'Category framing sets pricing and conversion leverage.', source: 'Ries and Trout', tags: ['positioning', 'strategy'] },
  { id: 'storyteller-emotion', seat: 'Storyteller', principle: 'People choose with emotion and justify with logic.', whyItMatters: 'Messaging must handle both affective and analytical concerns.', source: 'Behavioral marketing canon', tags: ['messaging', 'buying'] },
  { id: 'numbers-cash', seat: 'Numbers Person', principle: 'Cash survival precedes optimization goals.', whyItMatters: 'High-level growth narratives cannot offset insolvency risk.', source: 'CFO doctrine', tags: ['finance', 'risk'] },
  { id: 'numbers-unit-econ', seat: 'Numbers Person', principle: 'Unit economics must work before aggressive scale.', whyItMatters: 'Scaling broken economics compounds losses.', source: 'SaaS finance practice', tags: ['unit-economics', 'growth'] },
  { id: 'risk-consent', seat: 'Ethicist/Risk', principle: 'Consent must be explicit for high-sensitivity data use.', whyItMatters: 'Legal compliance and trust require transparent permission.', source: 'Privacy and risk governance', tags: ['privacy', 'compliance'] },
  { id: 'risk-minimization', seat: 'Ethicist/Risk', principle: 'Collect only data required for user value.', whyItMatters: 'Data minimization lowers liability and misuse exposure.', source: 'Privacy engineering practice', tags: ['data', 'risk'] },
  { id: 'domain-trust', seat: 'Domain Expert', principle: 'Executive transitions are trust-mediated decisions.', whyItMatters: 'Proof and relationships matter more than generic advice.', source: 'Executive coaching practice', tags: ['executive', 'trust'] },
  { id: 'domain-story-evidence', seat: 'Domain Expert', principle: 'Stories with evidence outperform claims without receipts.', whyItMatters: 'Senior interviews test judgment under scrutiny.', source: 'Executive interview practice', tags: ['interview', 'evidence'] },
  { id: 'competitor-copy', seat: 'Competitor', principle: 'Features are copyable, distribution and relationships are harder.', whyItMatters: 'Defensibility depends on adoption channels and switching friction.', source: 'Competitive strategy canon', tags: ['moat', 'competition'] },
  { id: 'competitor-speed', seat: 'Competitor', principle: 'Iteration speed matters when parity is inevitable.', whyItMatters: 'Time-to-learning can beat time-to-perfection.', source: 'Startup competition patterns', tags: ['speed', 'iteration'] },
  { id: 'dalio-truth', seat: 'Dalio', principle: 'Radical truth beats comfort narratives.', whyItMatters: 'Decision systems improve when disagreement is visible.', source: 'Ray Dalio Principles', tags: ['truth', 'governance'] },
  { id: 'dalio-systems', seat: 'Dalio', principle: 'Systemized decision loops outperform heroic improvisation.', whyItMatters: 'Repeatability enables scaling and postmortem learning.', source: 'Ray Dalio Principles', tags: ['systems', 'learning'] },
  { id: 'duke-process', seat: 'Duke', principle: 'Decision quality is process quality under uncertainty.', whyItMatters: 'Luck can mask bad choices in the short term.', source: 'Annie Duke', tags: ['decision', 'probability'] },
  { id: 'duke-probabilities', seat: 'Duke', principle: 'Use explicit probabilities and confidence ranges.', whyItMatters: 'Vague certainty blocks calibration and learning.', source: 'Annie Duke', tags: ['forecasting', 'calibration'] },
  { id: 'munger-inversion', seat: 'Munger', principle: 'Invert to surface hidden failure modes.', whyItMatters: 'Avoiding predictable mistakes compounds advantage.', source: 'Charlie Munger', tags: ['risk', 'reasoning'] },
  { id: 'munger-incentives', seat: 'Munger', principle: 'Incentives shape outcomes more reliably than intent.', whyItMatters: 'Organizational design should start with reward structures.', source: 'Charlie Munger', tags: ['incentives', 'behavior'] },
  { id: 'bezos-customer-backward', seat: 'Bezos', principle: 'Start with customer outcomes, then design backward.', whyItMatters: 'Internal activity should remain subordinate to external value.', source: 'Bezos letters', tags: ['customer', 'product'] },
  { id: 'bezos-reversibility', seat: 'Bezos', principle: 'Classify decisions by reversibility before deciding speed.', whyItMatters: 'Governance overhead should match irreversibility.', source: 'Bezos letters', tags: ['decision-speed', 'risk'] },
  { id: 'kahneman-bias', seat: 'Kahneman', principle: 'Intuition is a hypothesis, not final evidence.', whyItMatters: 'Systematic bias emerges under uncertainty and pressure.', source: 'Kahneman', tags: ['bias', 'reasoning'] },
  { id: 'kahneman-reference-class', seat: 'Kahneman', principle: 'Use reference classes to counter planning optimism.', whyItMatters: 'Inside-view planning routinely underestimates complexity.', source: 'Kahneman and Tversky', tags: ['planning', 'forecasting'] },
]

const KEYWORD_TO_MODEL_IDS: Array<{ keywords: string[]; modelIds: string[]; principleIds: string[] }> = [
  {
    keywords: ['interview', 'mock', 'question', 'grill', 'answer', 'story'],
    modelIds: ['first-principles', 'feynman-technique', 'probabilistic-thinking', 'tactical-empathy', 'story-data-action'],
    principleIds: ['domain-story-evidence', 'domain-trust', 'duke-process', 'kahneman-bias'],
  },
  {
    keywords: ['company', 'market', 'competition', 'strategy', 'positioning'],
    modelIds: ['five-forces', 'good-strategy', 'jobs-to-be-done', 'second-order', 'network-effects'],
    principleIds: ['capitalist-edge', 'competitor-copy', 'storyteller-positioning', 'skeptic-base-rates'],
  },
  {
    keywords: ['risk', 'legal', 'transcription', 'privacy', 'safety', 'compliance'],
    modelIds: ['premortem', 'margin-safety', 'anti-fragile', 'survival-first'],
    principleIds: ['risk-consent', 'risk-minimization', 'builder-reliability', 'dalio-truth'],
  },
  {
    keywords: ['execution', 'meeting', 'notes', 'operations', 'cadence'],
    modelIds: ['constraints', 'queueing', 'feedback-loops', 'goodhart'],
    principleIds: ['operator-ownership', 'operator-process', 'operator-flow', 'dalio-systems'],
  },
  {
    keywords: ['salary', 'offer', 'finance', 'pricing', 'economics'],
    modelIds: ['expected-value', 'opportunity-cost', 'switching-costs', 'margin-safety'],
    principleIds: ['numbers-cash', 'numbers-unit-econ', 'capitalist-efficiency', 'duke-probabilities'],
  },
]

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  const result: T[] = []
  for (const item of items) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    result.push(item)
  }
  return result
}

export function suggestMentalModels(input: string, maxItems = 6): MentalModel[] {
  const text = input.toLowerCase()
  const matchedIds = KEYWORD_TO_MODEL_IDS
    .filter(rule => rule.keywords.some(keyword => text.includes(keyword)))
    .flatMap(rule => rule.modelIds)

  const selected = uniqueById(
    matchedIds
      .map(id => EXECUTIVE_MENTAL_MODELS.find(model => model.id === id))
      .filter((model): model is MentalModel => !!model),
  )

  if (selected.length >= maxItems) return selected.slice(0, maxItems)

  const fallback = EXECUTIVE_MENTAL_MODELS.filter(model => !selected.some(item => item.id === model.id))
  return [...selected, ...fallback].slice(0, maxItems)
}

export function suggestFirstPrinciples(input: string, maxItems = 6): FirstPrinciple[] {
  const text = input.toLowerCase()
  const matchedIds = KEYWORD_TO_MODEL_IDS
    .filter(rule => rule.keywords.some(keyword => text.includes(keyword)))
    .flatMap(rule => rule.principleIds)

  const selected = uniqueById(
    matchedIds
      .map(id => EXECUTIVE_FIRST_PRINCIPLES.find(principle => principle.id === id))
      .filter((principle): principle is FirstPrinciple => !!principle),
  )

  if (selected.length >= maxItems) return selected.slice(0, maxItems)

  const fallback = EXECUTIVE_FIRST_PRINCIPLES.filter(principle => !selected.some(item => item.id === principle.id))
  return [...selected, ...fallback].slice(0, maxItems)
}
