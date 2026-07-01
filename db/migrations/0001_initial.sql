-- Yuzu Companion v1 initial schema
-- Postgres-first, raw SQL, transaction pooler runtime

create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  handle text unique not null,
  display_name text,
  avatar_url text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists auth_identities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  provider text not null,
  provider_subject text not null,
  provider_email text,
  email_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_subject),
  unique (user_id, provider)
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  session_token_hash text not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz,
  ip_hash text,
  user_agent_hash text
);

create table if not exists credit_wallets (
  user_id uuid primary key references users(id) on delete cascade,
  daily_balance integer not null default 0,
  bonus_balance integer not null default 0,
  subscription_balance integer not null default 0,
  daily_grant_amount integer not null default 0,
  daily_resets_at timestamptz not null default now(),
  last_daily_grant_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists credit_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  entry_type text not null,
  source text not null,
  amount integer not null,
  currency text not null default 'credit',
  reference_type text,
  reference_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists user_entitlements (
  user_id uuid primary key references users(id) on delete cascade,
  plan_key text not null default 'free',
  nsfw_enabled boolean not null default false,
  premium_models_enabled boolean not null default false,
  image_generation_enabled boolean not null default false,
  daily_credit_override integer,
  request_limit_override integer,
  updated_at timestamptz not null default now()
);

create table if not exists provider_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  label text not null,
  provider_kind text not null,
  base_url text not null,
  enabled boolean not null default true,
  capabilities jsonb not null default '{}'::jsonb,
  model_alias_map jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists provider_models (
  id uuid primary key default gen_random_uuid(),
  provider_profile_id uuid not null references provider_profiles(id) on delete cascade,
  alias text not null,
  display_name text not null,
  model_name text not null,
  base_credit_cost integer not null,
  supports_tools boolean not null default false,
  supports_vision boolean not null default false,
  supports_streaming boolean not null default true,
  supports_json boolean not null default false,
  supports_images boolean not null default false,
  max_context_hint integer,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider_profile_id, alias)
);

create table if not exists tool_providers (
  id uuid primary key default gen_random_uuid(),
  tool_key text not null unique,
  display_name text not null,
  tool_kind text not null,
  enabled boolean not null default true,
  pricing_mode text not null default 'fixed',
  base_cost integer not null default 0,
  capabilities jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists character_catalog_entries (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references users(id) on delete set null,
  visibility text not null default 'public',
  source_type text not null default 'user',
  name text not null,
  slug text unique,
  description text,
  greeting text,
  system_prompt text,
  scenario text,
  tags text[] not null default '{}'::text[],
  avatar_url text,
  avatar_mime text,
  avatar_hash text,
  is_featured boolean not null default false,
  is_nsfw boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  deleted_at timestamptz
);

create table if not exists character_catalog_versions (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references character_catalog_entries(id) on delete cascade,
  version_number integer not null,
  diff_summary text,
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  unique (character_id, version_number)
);

create index if not exists idx_auth_identities_user_id on auth_identities(user_id);
create index if not exists idx_sessions_user_id on sessions(user_id);
create index if not exists idx_credit_ledger_user_id_created_at on credit_ledger_entries(user_id, created_at desc);
create index if not exists idx_provider_profiles_user_id on provider_profiles(user_id);
create index if not exists idx_provider_models_profile_id on provider_models(provider_profile_id);
create index if not exists idx_character_catalog_visibility on character_catalog_entries(visibility, is_featured, created_at desc);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_users_updated_at before update on users
for each row execute function set_updated_at();
create trigger trg_auth_identities_updated_at before update on auth_identities
for each row execute function set_updated_at();
create trigger trg_sessions_updated_at before update on sessions
for each row execute function set_updated_at();
create trigger trg_credit_wallets_updated_at before update on credit_wallets
for each row execute function set_updated_at();
create trigger trg_user_entitlements_updated_at before update on user_entitlements
for each row execute function set_updated_at();
create trigger trg_provider_profiles_updated_at before update on provider_profiles
for each row execute function set_updated_at();
create trigger trg_provider_models_updated_at before update on provider_models
for each row execute function set_updated_at();
create trigger trg_tool_providers_updated_at before update on tool_providers
for each row execute function set_updated_at();
create trigger trg_character_catalog_entries_updated_at before update on character_catalog_entries
for each row execute function set_updated_at();

insert into tool_providers (tool_key, display_name, tool_kind, pricing_mode, base_cost)
values
  ('weather.current', 'Weather Current', 'weather', 'fixed', 0),
  ('weather.forecast', 'Weather Forecast', 'weather', 'fixed', 0),
  ('image.generate', 'Image Generation', 'image', 'fixed', 0)
on conflict (tool_key) do nothing;

-- This migration is intentionally v1-minimal. Private conversation history,
-- raw provider secrets, and media storage are left out on purpose.
