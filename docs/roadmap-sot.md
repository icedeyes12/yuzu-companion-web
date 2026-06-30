# Yuzu Companion — Roadmap SOT

> This is the source-of-truth roadmap for the first public version of Yuzu Companion.
> If anything in brainstorming conflicts with this doc, this doc wins.

## Product Goal

Ship a lightweight, privacy-first AI assistant platform with:
- OAuth login
- BYOK model access
- model-specific credit costs
- public character catalog
- private character workspace
- weather/location support
- image generation support
- optional premium / entitlement gates

The product should stay small, understandable, and cheap to operate.

---

## Non-Goals for v1

Do **not** build these into v1:
- server-stored conversation history
- file processing / document ingestion
- voice pipeline
- long-term semantic memory
- multi-agent orchestration
- heavy analytics
- large media hosting system
- full offline sync engine

---

## Product Surfaces

### Public surfaces
- marketing / landing page
- login / signup
- public character catalog
- pricing / entitlement pages
- policy pages

### Authenticated surfaces
- chat UI
- character manager
- provider settings
- credits wallet
- account / security settings
- location permissions / weather settings
- image generation settings

### Private local-only surfaces
- encrypted provider keys
- private character drafts
- local conversation history
- local avatar cache
- local prompt presets

---

## Milestone 0 — Architecture Lock

**Goal:** remove ambiguity before implementation.

### Exit criteria
- server/client boundary is fixed
- credit rules are fixed
- auth method is fixed
- private vs public storage policy is fixed
- tool policy is fixed
- model aliasing policy is fixed

### Deliverables
- final architecture doc
- initial DB schema
- provider registry rules
- credit model rules

---

## Milestone 1 — Identity + Account Shell

**Goal:** users can create or access an account.

### In scope
- Google OAuth
- GitHub OAuth
- internal user record creation
- session cookie or signed session token
- basic account page
- logout / session revoke

### Exit criteria
- user can log in with Google or GitHub
- user identity is stable across sessions
- account state is retrievable server-side

### Notes
OAuth is only for identity. It is not where provider API keys live.

---

## Milestone 2 — Credit Wallet

**Goal:** every paid action is enforced by credits.

### In scope
- daily free grant
- model-specific per-turn pricing
- tool pricing hooks
- credit ledger
- balance display
- out-of-credit handling

### Core pricing rules
- each model has a fixed base cost per assistant turn
- image generation has its own cost
- weather may be free if cached, but can still be metered if needed
- tool-initiated actions are charged to the same user turn

### Exit criteria
- user can see balance
- user can spend credits
- failed/aborted requests do not corrupt balances
- credit history is auditable

---

## Milestone 3 — Provider Registry + BYOK

**Goal:** users bring their own key and base URL.

### In scope
- provider setup form
- API key input
- base URL input
- model alias mapping
- credential encryption at rest on client
- provider capability metadata

### Provider capabilities to track
- chat
- streaming
- vision
- tool calling support
- structured output support
- image generation support
- max context hints

### Exit criteria
- user can add a provider profile
- user can select an alias instead of raw model name
- the app can route to different provider endpoints safely

---

## Milestone 4 — Chat Runtime

**Goal:** a working assistant loop exists.

### In scope
- chat composer
- message streaming
- assistant response rendering
- turn-level pricing
- tool budget handling
- error / retry states

### Exit criteria
- user can send a message and receive a streamed reply
- each reply deducts the correct model price
- tool calls can be counted and charged
- UI remains responsive during long turns

### Important policy
If a model chooses to call a tool, the user still pays for the full turn.

---

## Milestone 5 — Character System

**Goal:** character cards become a first-class feature.

### In scope
- create / edit / delete private character cards
- import / export character cards
- public character catalog browsing
- featured / curated character listing
- attach character to a chat session
- Yuzu as default character

### Character types
- private local character
- public catalog character
- curated staff/system character
- user-submitted public character

### Exit criteria
- user can create a character
- user can browse catalog characters
- user can switch between characters
- Yuzu is available as the default starter character

---

## Milestone 6 — Weather + Location

**Goal:** make assistant context-aware without overcollecting data.

### In scope
- browser location consent flow
- city / coarse location storage as needed
- timezone / current time injection
- weather tool via Open-Meteo
- cache + request coalescing

### Exit criteria
- user can opt in/out of location
- assistant can answer weather questions for allowed locations
- upstream weather requests are rate-aware and cached

### Policy
Location should be minimal, explicit, and revocable.

---

## Milestone 7 — Image Generation

**Goal:** image generation is available as a separate capability.

### In scope
- image provider registry
- multiple endpoints
- image prompt UI
- image result display
- per-image credit pricing
- optional save/export flow

### Exit criteria
- user can generate an image
- each image deducts the right cost
- model-invoked image generation is charged in the same turn
- image endpoints can differ by cost and capability

---

## Milestone 8 — Entitlements + Policy Gates

**Goal:** unlock paid or restricted features cleanly.

### In scope
- subscription flags
- top-up credits
- premium model access
- NSFW entitlement gate if used
- feature flags by plan
- moderation hooks for public content

### Exit criteria
- plan flags are enforced server-side
- premium access can be turned on/off without redeploying
- moderation of public catalog content is possible

---

## Milestone 9 — Secrets + Deployment Boundary

**Goal:** no secret is forced into the wrong place.

### In scope
- app-owned provider secrets in server-side env vars
- user-owned BYOK secrets in encrypted client storage
- serverless route handlers for any request that must hide app-owned secrets
- documentation for where to store each secret class

### Exit criteria
- user knows where to store their own provider key
- app-owned built-in provider keys never ship to the browser
- Supabase / DB / payment / webhook secrets are stored as server secrets only

---

## Secret Placement Rules

### User-owned secrets
Store in the client first, encrypted if possible:
- BYOK API key
- BYOK base URL token if any
- provider-specific user credentials

### App-owned secrets
Store as server-side environment variables only:
- built-in model provider API keys
- built-in image generation provider keys
- Supabase service role key
- webhook secrets
- payment provider secret keys
- any internal admin token

### Shared rule
If a secret can affect multiple users or the whole app, it belongs on the server. If it belongs only to one user’s personal provider setup, it belongs to that user’s encrypted local storage.

---

## v1 Cutline

If scope gets tight, keep only:
- OAuth login
- Postgres-backed auth + credits + catalog
- client-side private characters
- BYOK secret storage in client
- weather cached server-side
- image generation charged per output
- chat turn pricing
- no conversation history in server DB yet

That is the smallest version that still feels real.

---

## Implementation Order

1. auth + sessions
2. credit wallet
3. provider registry / BYOK
4. chat runtime
5. character system
6. weather + location
7. image generation
8. entitlements / payments
9. hardening

This order is intentional: every later milestone depends on the earlier ones.

---

## Decision Rules

When unsure, choose the option that is:
- cheaper to run
- easier to explain to users
- easier to audit
- less dependent on external storage
- more privacy-preserving

If a feature requires a complex backend subsystem to support a small early user base, defer it.
