# Database

This folder contains the v1 Postgres schema and SQL migrations.

## Rules

- Use raw SQL migrations, not Prisma, for v1.
- Run the app against the Supabase transaction pooler.
- Keep private user data client-side unless it must be shared or billed.
- Do not store provider API keys in this database.

## Files

- `migrations/0001_initial.sql` — initial v1 schema
