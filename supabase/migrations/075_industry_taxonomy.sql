-- Industry taxonomy reference tables
-- Used as seed data for company industry classification in Starting Monday.
-- sectors → broad groupings; industries → specific categories within a sector.
-- companies.sector (free-text) can reference industry.slug for structured filtering.

create table if not exists sectors (
  id          serial primary key,
  name        text not null unique,
  slug        text not null unique,
  sort_order  int  not null default 0
);

create table if not exists industries (
  id          serial primary key,
  sector_id   int  not null references sectors(id) on delete cascade,
  name        text not null,
  slug        text not null unique,
  sort_order  int  not null default 0
);

-- Seed: sectors
insert into sectors (name, slug, sort_order) values
  ('Financial Services',          'financial-services',     1),
  ('Healthcare & Life Sciences',  'healthcare',             2),
  ('Technology',                  'technology',             3),
  ('Retail & Consumer',           'retail-consumer',        4),
  ('Industrial & Energy',         'industrial-energy',      5),
  ('Media & Telecommunications',  'media-telecom',          6),
  ('Professional Services',       'professional-services',  7),
  ('Public Sector & Education',   'public-sector',          8);

-- Seed: industries (Financial Services)
insert into industries (sector_id, name, slug, sort_order)
select s.id, i.name, i.slug, i.sort_order
from sectors s,
(values
  ('Banking & Capital Markets', 'banking-capital-markets',  1),
  ('Insurance',                 'insurance',                2),
  ('Wealth & Asset Management', 'wealth-asset-management',  3),
  ('Fintech / Payments',        'fintech-payments',         4),
  ('Private Equity & Venture Capital', 'private-equity-vc', 5)
) as i(name, slug, sort_order)
where s.slug = 'financial-services';

-- Seed: industries (Healthcare & Life Sciences)
insert into industries (sector_id, name, slug, sort_order)
select s.id, i.name, i.slug, i.sort_order
from sectors s,
(values
  ('Health Systems & Hospitals',        'health-systems-hospitals',     1),
  ('Health Insurance & Managed Care',   'health-insurance-managed-care', 2),
  ('Pharmaceuticals & Biotech',         'pharma-biotech',               3),
  ('Medical Devices',                   'medical-devices',              4),
  ('Digital Health / Healthtech',       'digital-health',               5)
) as i(name, slug, sort_order)
where s.slug = 'healthcare';

-- Seed: industries (Technology)
insert into industries (sector_id, name, slug, sort_order)
select s.id, i.name, i.slug, i.sort_order
from sectors s,
(values
  ('Enterprise Software / SaaS',    'enterprise-software-saas',   1),
  ('Cybersecurity',                 'cybersecurity',              2),
  ('Cloud & Infrastructure',        'cloud-infrastructure',       3),
  ('Data & Analytics',              'data-analytics',             4),
  ('Artificial Intelligence / ML',  'ai-ml',                      5),
  ('Hardware & Semiconductors',     'hardware-semiconductors',    6),
  ('IT Services & Consulting',      'it-services-consulting',     7)
) as i(name, slug, sort_order)
where s.slug = 'technology';

-- Seed: industries (Retail & Consumer)
insert into industries (sector_id, name, slug, sort_order)
select s.id, i.name, i.slug, i.sort_order
from sectors s,
(values
  ('Retail & E-commerce',        'retail-ecommerce',       1),
  ('Consumer Goods & Apparel',   'consumer-goods-apparel', 2),
  ('Food & Beverage',            'food-beverage',          3),
  ('Automotive',                 'automotive',             4)
) as i(name, slug, sort_order)
where s.slug = 'retail-consumer';

-- Seed: industries (Industrial & Energy)
insert into industries (sector_id, name, slug, sort_order)
select s.id, i.name, i.slug, i.sort_order
from sectors s,
(values
  ('Manufacturing & Industrial',   'manufacturing-industrial',  1),
  ('Energy & Utilities',           'energy-utilities',          2),
  ('Oil & Gas',                    'oil-gas',                   3),
  ('Aerospace & Defense',          'aerospace-defense',         4),
  ('Transportation & Logistics',   'transportation-logistics',  5)
) as i(name, slug, sort_order)
where s.slug = 'industrial-energy';

-- Seed: industries (Media & Telecommunications)
insert into industries (sector_id, name, slug, sort_order)
select s.id, i.name, i.slug, i.sort_order
from sectors s,
(values
  ('Telecommunications',               'telecommunications',    1),
  ('Media & Entertainment',            'media-entertainment',   2),
  ('Publishing & Information Services','publishing-info',       3),
  ('AdTech / MarTech',                 'adtech-martech',        4)
) as i(name, slug, sort_order)
where s.slug = 'media-telecom';

-- Seed: industries (Professional Services)
insert into industries (sector_id, name, slug, sort_order)
select s.id, i.name, i.slug, i.sort_order
from sectors s,
(values
  ('Management Consulting',   'management-consulting', 1),
  ('Legal Services',          'legal-services',        2),
  ('Accounting & Tax',        'accounting-tax',        3),
  ('HR & Talent Services',    'hr-talent-services',    4),
  ('Real Estate & PropTech',  'real-estate-proptech',  5)
) as i(name, slug, sort_order)
where s.slug = 'professional-services';

-- Seed: industries (Public Sector & Education)
insert into industries (sector_id, name, slug, sort_order)
select s.id, i.name, i.slug, i.sort_order
from sectors s,
(values
  ('Federal Government',       'federal-government',   1),
  ('State & Local Government', 'state-local-gov',      2),
  ('Defense & Intelligence',   'defense-intelligence', 3),
  ('Higher Education',         'higher-education',     4),
  ('K-12 Education',           'k12-education',        5),
  ('Nonprofit & NGO',          'nonprofit-ngo',        6)
) as i(name, slug, sort_order)
where s.slug = 'public-sector';

-- Read access for authenticated users (industry data is public reference)
alter table sectors    enable row level security;
alter table industries enable row level security;

create policy "sectors are publicly readable"
  on sectors for select using (true);

create policy "industries are publicly readable"
  on industries for select using (true);
