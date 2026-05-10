-- E2.4: Sector-level regulatory pressure calendar.
-- Tracks regulatory waves that historically force technology leadership changes.
-- Matched against company sector tags; generates regulatory_change signals
-- at most once per 90 days per company per event.

create table public.regulatory_events (
  id             uuid        primary key default gen_random_uuid(),
  name           text        not null,
  description    text        not null,
  sector_tags    text[]      not null,
  active_from    date        not null,
  active_until   date,                   -- null = ongoing
  signal_summary text        not null,
  outreach_angle text,
  severity       text        not null default 'medium'
                               check (severity in ('low', 'medium', 'high', 'critical')),
  created_at     timestamptz not null default now()
);

create index idx_regulatory_events_active
  on public.regulatory_events (active_from, active_until);

-- Seed: regulatory events active in 2026.
-- signal_summary is used verbatim in company_signals.signal_summary.
-- sector_tags are matched against a keyword map over companies.sector.

insert into public.regulatory_events
  (name, description, sector_tags, active_from, active_until, signal_summary, outreach_angle, severity)
values
(
  'SEC Cybersecurity Disclosure Rules',
  'Public companies must disclose material incidents within 4 business days and provide annual cybersecurity risk management disclosures. Board-level governance of cyber risk is now a reporting requirement.',
  array['public_company', 'technology', 'financial_services', 'healthcare'],
  '2023-12-18',
  null,
  'SEC cybersecurity disclosure rules require public companies to maintain board-level security governance. Non-compliance risk is driving CISO hiring and upgrades — many organizations are actively replacing or elevating their security leadership posture.',
  'Public companies upgrading CISO capabilities under SEC cybersecurity rules are the most active search market right now. This is a sustained 24-month hiring catalyst.',
  'high'
),
(
  'CMMC Phase 2 — Defense Contractor Compliance',
  'Cybersecurity Maturity Model Certification Phase 2 requires Department of Defense contractors to achieve CMMC Level 2 certification, enforced via contract requirements from 2025 onward.',
  array['defense', 'government', 'aerospace', 'manufacturing'],
  '2025-01-01',
  null,
  'CMMC Phase 2 is driving CISO and security program upgrades across the defense industrial base. Defense contractors without a certified CISO are at risk of losing contract eligibility — executive security leadership is a compliance requirement, not a nice-to-have.',
  'Defense contractors under CMMC pressure are actively hiring or upgrading CISOs. The compliance deadline creates a defined urgency that accelerates searches.',
  'high'
),
(
  'HIPAA Enforcement Wave (OCR Audit Program)',
  'HHS Office for Civil Rights has resumed active HIPAA enforcement with a focus on healthcare system cybersecurity. Large settlements and corrective action plans are driving CISO accountability at healthcare organizations.',
  array['healthcare', 'health_tech', 'life_sciences'],
  '2024-06-01',
  null,
  'HHS HIPAA enforcement is escalating across healthcare systems and health tech companies. Organizations that have experienced breaches or OCR investigations are replacing CISOs and upgrading their security program leadership under formal corrective action plans.',
  'Healthcare CISOs under regulatory pressure from HIPAA enforcement are among the most time-compressed leadership search situations — corrective action deadlines create non-negotiable hiring timelines.',
  'high'
),
(
  'NY DFS Part 500 Cybersecurity Requirements',
  'New York Department of Financial Services Part 500 cybersecurity regulations require a CISO designation, annual certification, and specific technical controls. Phased amendments through 2024-2025 added stricter requirements.',
  array['financial_services', 'banking', 'insurance', 'fintech'],
  '2024-11-01',
  null,
  'NY DFS Part 500 amendments require regulated financial services entities to designate a qualified CISO and certify compliance annually. Organizations without a senior security executive or with a CISO not meeting qualifications are actively searching for replacements.',
  'NY DFS Part 500 creates a regulatory mandate for CISO-level security leadership at all regulated New York financial institutions. This is a non-discretionary hiring driver.',
  'high'
),
(
  'DORA — EU Digital Operational Resilience Act',
  'The Digital Operational Resilience Act applies to all EU financial services entities. Full compliance required from January 2025. Mandates ICT risk management, incident reporting, third-party oversight, and operational resilience testing.',
  array['financial_services', 'banking', 'insurance', 'fintech', 'technology'],
  '2025-01-17',
  null,
  'DORA compliance requires EU financial services firms to mature their ICT governance, incident response, and third-party risk programs. Many global firms are hiring or upgrading their CIO and CISO leadership specifically to own DORA compliance accountability.',
  'Global financial institutions with EU operations are upgrading technology and security leadership under DORA. The regulation created a new governance accountability structure that often requires executive-level changes.',
  'medium'
),
(
  'AI Governance Regulation Wave (EU AI Act + US State Laws)',
  'The EU AI Act (phased from 2025-2026) and growing US state AI legislation are creating new governance requirements for organizations using AI in regulated contexts. Chief AI Officers and AI governance roles are emerging as regulatory accountability roles.',
  array['technology', 'financial_services', 'healthcare', 'insurance', 'retail'],
  '2025-02-01',
  null,
  'Emerging AI governance regulation is creating new executive accountability requirements. Organizations deploying AI in regulated contexts are establishing Chief AI Officer roles or expanding CDO/CTO mandates — generating a new category of senior technology leadership demand.',
  'AI regulatory pressure is creating executive roles that did not exist 18 months ago. Early movers in building AI governance leadership are attracting candidates who want to define the function.',
  'medium'
),
(
  'FedRAMP Modernization and Cloud Security Requirements',
  'FedRAMP Revision 5 and OMB memoranda are raising cloud security requirements for federal contractors and agencies. Government-adjacent technology companies must achieve or maintain FedRAMP authorization to continue serving federal customers.',
  array['government', 'cloud', 'saas', 'technology'],
  '2024-01-01',
  null,
  'FedRAMP Revision 5 is raising the security bar for government technology vendors. Companies at risk of losing FedRAMP authorization — or trying to achieve it for the first time — are hiring CISOs with federal compliance experience as a strategic necessity.',
  'Government technology vendors under FedRAMP pressure are hiring CISOs specifically for federal compliance track records. This is one of the most qualification-specific CISO search segments.',
  'medium'
);
