# Yuzu Companion — Initial Data Schema

This is the first-pass schema for the server-side system of record.

## Design Rules

- Keep server-side data small and auditable.
- Do not store conversation history in the server DB for v1.
- Do not store provider API keys in the server DB for v1.
- Prefer client-side encrypted storage for sensitive provider credentials.
- Keep public catalog data separate from private local character data.
- Use credit ledger entries instead of mutating a single balance field with no history.
- Treat Postgres as the first and primary server database.
- Do not split into a separate admin database unless a real admin feature needs it.
- Keep the schema v1-friendly: only tables that directly support auth, credits, provider registry, catalog, and tool metadata.

---

## Core Entities

### users

Represents the internal account owner.

Fields:

- `id` UUID primary key
- `handle` text unique, human-readable account name
- `display_name` text nullable
- `avatar_url` text nullable
- `status` text not null, default `active`
- `created_at` timestamptz not null
- `updated_at` timestamptz not null
- `last_login_at` timestamptz nullable

Notes:

- `handle` should be stable.
- `avatar_url` is for public or synced account-level avatars only.

---

### auth_identities

Stores linked login methods for a user.

Fields:

- `id` UUID primary key
- `user_id` UUID foreign key -> `users.id`
- `provider` text not null (`google`, `github`, later others)
- `provider_subject` text not null
- `provider_email` text nullable
- `email_verified` boolean not null default false
- `created_at` timestamptz not null
- `updated_at` timestamptz not null

Constraints:

- unique `(provider, provider_subject)`
- unique `(user_id, provider)` if you only want one identity per provider per user

---

### sessions

Server-side login sessions.

Fields:

- `id` UUID primary key
- `user_id` UUID foreign key -> `users.id`
- `session_token_hash` text not null
- `expires_at` timestamptz not null
- `revoked_at` timestamptz nullable
- `created_at` timestamptz not null
- `last_seen_at` timestamptz nullable
- `ip_hash` text nullable
- `user_agent_hash` text nullable

Notes:

- store only a hash of the session token, not the raw token
- revocation should be cheap

---

## Credits / Entitlements

### credit_wallets

Represents the current spendable state for a user.

Fields:

- `user_id` UUID primary key foreign key -> `users.id`
- `daily_balance` integer not null default 0
- `bonus_balance` integer not null default 0
- `subscription_balance` integer not null default 0
- `daily_grant_amount` integer not null default 0
- `daily_resets_at` timestamptz not null
- `last_daily_grant_at` timestamptz nullable
- `updated_at` timestamptz not null

Notes:

- `daily_balance` resets and does not stack.
- `bonus_balance` can accumulate.
- `subscription_balance` is optional and plan-driven.

---

### credit_ledger_entries

Append-only ledger for all credit events.

Fields:

- `id` UUID primary key
- `user_id` UUID foreign key -> `users.id`
- `entry_type` text not null
- `source` text not null
- `amount` integer not null
- `currency` text not null default `credit`
- `reference_type` text nullable
- `reference_id` UUID nullable
- `metadata` jsonb not null default `{}`
- `created_at` timestamptz not null

Suggested `entry_type` values:

- `daily_grant`
- `bonus_topup`
- `subscription_grant`
- `chat_charge`
- `tool_charge`
- `image_charge`
- `refund`
- `admin_adjustment`

Notes:

- positive amount = credit addition
- negative amount = spend
- every spend should be traceable back to a request / turn / tool event

---

### user_entitlements

Feature access per user.

Fields:

- `user_id` UUID primary key foreign key -> `users.id`
- `plan_key` text not null default `free`
- `nsfw_enabled` boolean not null default false
- `premium_models_enabled` boolean not null default false
- `image_generation_enabled` boolean not null default false
- `daily_credit_override` integer nullable
- `request_limit_override` integer nullable
- `updated_at` timestamptz not null

Notes:

- this is where plan-based access lives
- plan changes should update the entitlement row, not rewrite history

---

## Provider Registry

### provider_profiles

Represents a user-configured provider connection or alias mapping.

Fields:

- `id` UUID primary key
- `user_id` UUID foreign key -> `users.id`
- `label` text not null
- `provider_kind` text not null
- `base_url` text not null
- `enabled` boolean not null default true
- `capabilities` jsonb not null default `{}`
- `model_alias_map` jsonb not null default `{}`
- `created_at` timestamptz not null
- `updated_at` timestamptz not null

Notes:

- do not store raw API keys here for v1
- capability metadata should include chat / tools / vision / image flags

---

### provider_models

Normalized model catalog per provider profile.

Fields:

- `id` UUID primary key
- `provider_profile_id` UUID foreign key -> `provider_profiles.id`
- `alias` text not null
- `display_name` text not null
- `model_name` text not null
- `base_credit_cost` integer not null
- `supports_tools` boolean not null default false
- `supports_vision` boolean not null default false
- `supports_streaming` boolean not null default true
- `supports_json` boolean not null default false
- `supports_images` boolean not null default false
- `max_context_hint` integer nullable
- `enabled` boolean not null default true
- `created_at` timestamptz not null
- `updated_at` timestamptz not null

Notes:

- the UI should show `alias` / `display_name`, not raw provider internals
- cost is per chat turn unless overridden by tool pricing

---

### tool_providers

Registry for non-chat tools such as weather or image generation.

Fields:

- `id` UUID primary key
- `tool_key` text not null unique
- `display_name` text not null
- `tool_kind` text not null
- `enabled` boolean not null default true
- `pricing_mode` text not null default `fixed`
- `base_cost` integer not null default 0
- `capabilities` jsonb not null default `{}`
- `created_at` timestamptz not null
- `updated_at` timestamptz not null

Examples:

- `weather.current`
- `weather.forecast`
- `image.generate`

---

## Characters

### character_catalog_entries

Public or curated characters visible in the shared catalog.

Fields:

- `id` UUID primary key
- `owner_user_id` UUID nullable foreign key -> `users.id`
- `visibility` text not null default `public`
- `source_type` text not null default `user`
- `name` text not null
- `slug` text unique nullable
- `description` text nullable
- `greeting` text nullable
- `system_prompt` text nullable
- `scenario` text nullable
- `tags` text[] not null default `{}`
- `avatar_url` text nullable
- `avatar_mime` text nullable
- `avatar_hash` text nullable
- `is_featured` boolean not null default false
- `is_nsfw` boolean not null default false
- `created_at` timestamptz not null
- `updated_at` timestamptz not null
- `published_at` timestamptz nullable
- `deleted_at` timestamptz nullable

Notes:

- this table is for shared catalog content only
- private character drafts should stay client-side in v1

---

### character_catalog_versions

Version history for catalog entries.

Fields:

- `id` UUID primary key
- `character_id` UUID foreign key -> `character_catalog_entries.id`
- `version_number` integer not null
- `diff_summary` text nullable
- `payload` jsonb not null
- `created_at` timestamptz not null
- `created_by_user_id` UUID nullable foreign key -> `users.id`

Notes:

- keeps the catalog auditable
- supports rollback and moderation review

---

## Minimum v1 Table Set

If you want the smallest coherent production schema, start with:

- `users`
- `auth_identities`
- `sessions`
- `credit_wallets`
- `credit_ledger_entries`
- `user_entitlements`
- `provider_profiles`
- `provider_models`
- `tool_providers`
- `character_catalog_entries`
- `character_catalog_versions`

That is enough for login, billing-like usage, provider config, and shared character catalog.

---

## Out of Scope for v1

Do not add these yet unless there is a real reason:

- conversation history tables
- message attachments / file storage tables
- private character sync tables
- avatar upload pipeline tables
- payment processor tables
- admin audit dashboards beyond simple logs
- semantic memory tables

Keep the first schema boring and usable.

---

## Why this is the right first schema

- Postgres handles accounts, credits, and catalog data cleanly.
- It gives you auditable history through ledger entries.
- It keeps the app small without forcing premature multi-database complexity.
- It leaves room for a later split if scale or security boundaries demand it.

---

## Location / Weather Consent

### user_location_settings

Stores explicit user permission and defaults for weather/location usage.

Fields:

- `user_id` UUID primary key foreign key -> `users.id`
- `location_enabled` boolean not null default false
- `location_precision` text not null default `coarse`
- `timezone` text nullable
- `locale` text nullable
- `last_known_city` text nullable
- `last_known_region` text nullable
- `last_known_country` text nullable
- `updated_at` timestamptz not null

Notes:

- do not store exact coordinates unless the product later needs them
- user should be able to revoke location usage cleanly

---

## Media / Avatar Strategy

### v1 recommendation

Do not create a general image storage subsystem yet.

Use:

- `avatar_url` for catalog/public assets
- client-side local storage for private avatars
- optional later object storage if the feature pressure is real

If you later need server-managed avatars, add a dedicated `media_assets` table.

---

## Optional Future Tables

These are intentionally not required for v1:

- `conversation_threads`
- `conversation_messages`
- `message_embeddings`
- `user_prompt_presets`
- `sync_backups`
- `payment_customers`
- `subscriptions`
- `topup_orders`
- `moderation_reports`
- `admin_audit_logs`

---

## Indexes to Add Early

Recommended indexes:

- `auth_identities(provider, provider_subject)` unique index
- `sessions(user_id)`
- `sessions(session_token_hash)` unique index
- `credit_ledger_entries(user_id, created_at desc)`
- `character_catalog_entries(visibility, is_featured, created_at desc)`
- `character_catalog_entries(slug)` unique index
- `provider_models(provider_profile_id, alias)` unique index
- `character_votes(character_id, user_id)` unique index

---

## Data Handling Rules

1. Never store raw provider secrets in the initial schema.
2. Never store conversation history on the server unless the product later needs sync.
3. Ledger entries are append-only.
4. User-facing model names are aliases, not raw provider IDs.
5. Tool charges and chat charges must be separately auditable.
6. Location is opt-in and revocable.
7. Public catalog content should be versioned.

---

## Recommended First Migration

Start with these tables first:

- `users`
- `auth_identities`
- `sessions`
- `credit_wallets`
- `credit_ledger_entries`
- `user_entitlements`
- `provider_profiles`
- `provider_models`
- `tool_providers`
- `character_catalog_entries`
- `character_catalog_versions`
- `user_location_settings`

That is enough to launch the first controlled version of the product.