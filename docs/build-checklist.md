# Yuzu Companion — Build Checklist

## Phase 1 — Data Foundation
- [ ] Finalize Postgres schema
- [ ] Add SQL migrations
- [ ] Decide runtime DB access pattern: Supabase transaction pooler + raw SQL/thin query layer
- [ ] Define seed data for Yuzu + starter catalog
- [ ] Confirm env vars needed for runtime

## Phase 2 — Auth
- [ ] Google OAuth working
- [ ] GitHub OAuth working
- [ ] Session creation and logout
- [ ] User record creation/linking

## Phase 3 — Credit Wallet
- [ ] Daily grant logic
- [ ] Ledger table writes
- [ ] Deduct credits per model turn
- [ ] Block out-of-credit requests cleanly

## Phase 4 — Provider Registry / BYOK
- [ ] Save provider alias profiles
- [ ] Store BYOK secrets client-side encrypted
- [ ] Map alias to model + capability metadata
- [ ] Support multiple provider endpoints

## Phase 5 — Chat Runtime
- [ ] Chat UI
- [ ] Streaming assistant replies
- [ ] Turn pricing
- [ ] Tool-call budget handling

## Phase 6 — Character System
- [ ] Yuzu default character
- [ ] Private character create/edit/import/export
- [ ] Public catalog browsing
- [ ] Catalog fork/export into private use

## Phase 7 — Tools
- [ ] Weather tool with cache + location consent
- [ ] Image generation tool with per-image pricing
- [ ] Model-invoked tool calls charged to the same turn

## Done Criteria
- [ ] A user can log in
- [ ] A user can chat
- [ ] Credits are charged correctly
- [ ] A user can pick a character
- [ ] Weather and image tools work
- [ ] The app stays privacy-first and cheap to run

> Note: Phase 1 is the only thing to build before auth.