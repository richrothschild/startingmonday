alter table public.partners
  add column if not exists white_label_brand_name text,
  add column if not exists white_label_track_id text,
  add column if not exists white_label_tier_id text,
  add column if not exists white_label_primary_color text,
  add column if not exists white_label_accent_color text,
  add column if not exists white_label_support_email text,
  add column if not exists white_label_logo_url text;

update public.partners
set
  white_label_brand_name = coalesce(nullif(white_label_brand_name, ''), name),
  white_label_track_id = coalesce(nullif(white_label_track_id, ''), 'executive_transition'),
  white_label_tier_id = coalesce(nullif(white_label_tier_id, ''), 'boutique'),
  white_label_primary_color = coalesce(nullif(white_label_primary_color, ''), '#0f172a'),
  white_label_accent_color = coalesce(nullif(white_label_accent_color, ''), '#f97316'),
  white_label_support_email = coalesce(nullif(white_label_support_email, ''), email)
where is_active = true;