-- Coach seat purchasing: allow partners to buy seats for clients.
-- seats_purchased: how many active seat slots the partner has paid for.
-- seats_subscription_id: Stripe subscription ID for the seat bundle.
-- user_id: links the partner record to their auth user (auto-set on first dashboard visit).

alter table public.partners
  add column if not exists seats_purchased integer not null default 0,
  add column if not exists seats_subscription_id text,
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists idx_partners_user_id on public.partners(user_id);
