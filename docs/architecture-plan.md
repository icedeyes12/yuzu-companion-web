# Yuzu Companion — Architecture Plan

## Scope

A lightweight AI chatbot / assistant platform with:
- Google/GitHub OAuth login
- BYOK model providers (user brings API key + base URL)
- model-specific credit costs
- character catalog + user-defined character cards
- optional weather tool via Open-Meteo
- image generation via one or more user-configurable endpoints
- basic monetization / entitlement hooks for future paid tiers
- privacy-first handling of sensitive user data

This is intentionally **not** a giant memory-heavy consumer chat app. It should stay small, understandable, and cheap to run.

---

## Product Principles

1. **Local-first where possible**
   - User-created characters can live client-side when private.
   - Sensitive provider credentials should not be exposed to other users.

2. **Server-side only for shared state**
   - Auth state.
   - Shared character catalog.
   - Entitlements / credits / abuse control.
   - Optional synchronized user preferences.

3. **Credits as a usage gate, not a billing system first**
   - Credits are the simplest way to keep the service sustainable.
   - Different models can have different costs.
   - Tool usage can also burn credits when it hits real infra.

4. **Tool calls are part of the assistant cost**
   - If the model decides to call weather or image generation, the app should charge according to the tool policy.
   - The user should not need to understand internal function-call plumbing.

5. **Privacy defaults to conservative**
   - Location must be opt-in.
   - Avatar and profile assets should not be over-shared.
   - No unnecessary conversation storage on the server at first.

---

## Core Data Boundaries

### Keep server-side
- OAuth identities
- session/auth state
- credit balance / entitlement state
- catalog character records
- published/shared character cards
- abuse tracking / rate limiting metadata
- optional subscription/payment state
- optional user preferences that must sync across devices

### Keep client-side first
- private character cards
- local conversation history
- saved prompts / presets
- provider API keys and base URLs
- local UI preferences
- optional local avatar cache if user wants it private

### Maybe server-side later
- synced avatars
- synced character packs
- cross-device user settings
- conversation backups

---

## Auth Plan

### OAuth providers
- Google
- GitHub

### Flow
1. User signs in with OAuth.
2. Backend receives provider identity.
3. Backend creates or links internal user record.
4. Backend issues session cookie or equivalent token.
5. Frontend uses session to access account state.

### Why server-side auth state exists
- session invalidation
- device logout
- credit accounting tied to a stable user ID
- abuse/rate-limit management

### Important rule
OAuth is only for identity. It should **not** be the storage mechanism for provider API keys.

---

## Credit Model

### Recommended shape
Use a **per-action credit model**, not token-perfect billing at first.

Examples:
- Cheap model: 2 credits / chat turn
- Mid model: 5 credits / chat turn
- Expensive model: 15 credits / chat turn
- Image generation: separate cost per image
- Tool calls: optional surcharge if they hit paid infra

### Why this is good
- simple mental model
- easy to explain
- predictable for users
- easy to enforce on server

### Suggested policy layers
1. **Daily free grant**
   - e.g. 10 credits/day, or a small rolling allowance
   - enough for casual use

2. **Model tier pricing**
   - each model has its own cost
   - more capable models cost more

3. **Tool pricing**
   - weather may be free if it is cached and cheap
   - image generation should consume credits
   - agent-invoked image generation still charges the user

4. **Roleplay / character premium actions**
   - if a character triggers richer tools, that cost is part of the turn

### Important principle
If the assistant invokes a tool on the user’s behalf, **the user still pays**. The model is acting for them, not for free.

---

## Tool Pricing Ideas

### Weather
- Free or near-free
- Server-side cached
- Open-Meteo upstream calls only on cache miss
- Location consent required

### Image generation
- Separate credit cost per image
- Different endpoints can have different costs
- If the model requests image generation during chat, deduct credits from the same wallet

### Other future tools
- web search / retrieval
- file analysis
- voice
- memory backup
- long-running agent tasks

Each can get its own credit weight later.

---

## Character System

### Two character types
1. **Catalog characters**
   - server-side shared content
   - discoverable
   - can be featured, tagged, ranked, moderated

2. **Private user characters**
   - local-first
   - stored in browser by default
   - optionally synced later

### Character card fields
- id
- name
- description / persona prompt
- greeting
- tags
- avatar reference
- visibility
- version / updated timestamp
- optional tool preferences

### Avatar storage
Best default:
- **private characters**: browser-local asset reference or data URL metadata
- **catalog characters**: server asset or remote URL under control

If the user uploads an avatar for a private character:
- keep it client-side by default
- optionally sync later if they explicitly enable sync

This keeps sensitive or personal avatars from becoming accidental public assets.

---

## Provider / BYOK Plan

### User brings
- API key
- base URL
- optional model alias mapping

### Storage
- prefer client-side encrypted storage for provider credentials
- do not send raw key to catalog or other users
- only use the key for requests on behalf of that user

### Why this matters
- minimizes liability
- keeps the platform lightweight
- avoids becoming a secret vault unless absolutely needed

### Future option
If the user wants sync across devices, encrypt credentials before syncing.

---

## Secret Handling Strategy

### Two classes of secrets

#### 1) User-owned secrets
These belong to the user and should stay private to their account/device:
- BYOK API keys
- user-provided base URLs
- optional user-specific provider tokens

Recommended storage:
- local browser storage, encrypted at rest
- never sent to other users
- never copied into public catalog data

#### 2) App-owned secrets
These belong to the platform and must never ship to the browser:
- Supabase service role key
- OAuth client secrets
- server-side database credentials
- any built-in provider key used by the app itself

Recommended storage:
- deployed environment variables on the hosting platform
- local `.env.local` for development only
- never committed to git

### Important routing rule
If the browser would need a secret to call a provider directly, that secret is already in the wrong place.

Use one of these patterns instead:
- **BYOK direct from client** for user-owned keys only
- **serverless / route-handler proxy** for app-owned secrets

### Built-in model / image generation
If the app pays for a shared provider key:
- do **not** expose that key in the client
- call the provider through a serverless endpoint or route handler
- keep the provider key in environment variables

If you truly want zero backend for a feature, then that feature must be BYOK only.

### Supabase secret placement
If Supabase is used for auth or database access:
- public anon key can be used in the client
- service role key must stay server-side only
- any admin database credential stays server-side only

---

## Location / Weather Privacy

### Consent model
- location is opt-in
- default: unavailable
- user can grant it temporarily or persistently
- user can revoke it at any time

### Data handling
- use coarse location when possible
- do not expose exact location to models unless needed
- include only the minimum location detail necessary for the tool request
- attach date/time context to the prompt separately, not as a hidden data leak

### Weather flow
1. assistant decides weather is relevant
2. app checks user consent + available location
3. app queries cache
4. if cache miss, call Open-Meteo
5. return normalized weather data to the model

---

## Database Need: Yes, But Small

### You probably need a DB for:
- users
- OAuth identities
- sessions / login state
- credits and transactions
- shared character catalog
- moderation flags
- entitlement tiers
- maybe sync metadata later

### You probably do **not** need DB for first version:
- private conversations
- private local characters
- API keys

### Suggested split
- **Server DB**: shared, account, entitlement data
- **Client storage**: private user data

### Database recommendation
Use **Postgres first** as the canonical server database.

Why:
- good fit for users / auth / credits / catalog
- easy to model with migrations
- flexible enough for later expansion
- avoids splitting core state across too many systems too early

---

## Payment / Monetization Options

### Option A: no payments at first
- just free daily credits
- manual admin grants
- good for alpha / tiny user count

### Option B: simple top-up / tiered plans later
- buy credits
- unlock more daily credits
- unlock premium models
- unlock NSFW if your policy allows it

### Option C: hybrid
- free daily credits
- paid top-up when free pool runs out
- optional premium model access

For now, keep the architecture payment-ready but do not build payment complexity until needed.

---

## NSFW / Policy Gate

If you want an unlockable NSFW mode:
- make it a **server-side entitlement flag**
- gate it per account
- do not rely only on frontend toggles
- make it explicit in UI and moderation policy

This should be treated like a capability flag, not a hidden mode.

---

## Recommended MVP Stack

### Frontend
- Next.js
- App Router
- client-side local state for private stuff
- server calls only for auth, credits, catalog, shared data

### Backend
- Next.js route handlers or small separate API
- Postgres for auth / credits / catalog
- cached weather tool
- image tool adapters

### Storage
- server DB for shared state
- browser storage for private user data
- optional object storage later only if needed

---

## Roadmap Phases

### Phase 0 — Architecture Lock
- finalize server/client boundary
- finalize credit rules
- finalize what gets stored where

### Phase 1 — Auth + user state
- Google/GitHub OAuth
- user record creation
- session management
- basic account page

### Phase 2 — Credit wallet
- daily free credits
- model-based credit costs
- deduction on chat turns
- balance display

### Phase 3 — Character catalog
- shared catalog CRUD
- featured / tags / visibility
- private local character import/export

### Phase 4 — Provider BYOK
- save API key + base URL locally
- provider profile selection
- model aliasing / masking

### Phase 5 — Tooling
- weather tool with cache + consent
- image generation tool adapters
- tool credit charging

### Phase 6 — Safety / policy
- NSFW entitlement gate
- moderation hooks
- abuse / rate limit controls

### Phase 7 — Sync later, only if needed
- cross-device sync for private profiles
- optional avatar sync
- optional encrypted backup

---

## Open Questions

1. Should credits reset daily, refill hourly, or be a rolling wallet?
2. Should model cost be fixed per turn or adjust by context length?
3. Should catalog characters be user-generated, curated, or both?
4. Should avatars for private characters stay strictly local?
5. Should NSFW be a paid unlock, age gate, or both?
6. Should image generation be free only for certain endpoints, or always paid by credits?

---

## Strong Default Recommendation

If you want the simplest workable version:
- OAuth for login
- small DB for auth + credits + catalog
- client-side private character storage
- encrypted local storage for BYOK keys
- weather cached server-side
- image generation charged per output
- model pricing per chat turn
- no conversation history in server DB yet

That gives you a sane first release without overbuilding.
