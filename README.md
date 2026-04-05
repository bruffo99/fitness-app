# Ruffo Fitness

Small Next.js app for Ruffo Fitness coaching inquiries, internal lead management, and basic client onboarding records.

## Stack

- Next.js App Router with TypeScript
- Prisma ORM
- SQLite for local development
- Server-side admin auth using a signed `httpOnly` session cookie

## What This App Includes

- Public homepage with coaching inquiry form
- Prospect intake persistence through Prisma
- Internal admin pages for:
  - reviewing prospects
  - updating pipeline status
  - saving notes
  - converting accepted prospects into client records
- Schema for:
  - prospects
  - users
  - admin sessions
  - magic link tokens
  - client profiles
  - client targets
- Server-side admin auth:
  - credentials are posted to the server
  - the server creates a signed, `httpOnly` session cookie
  - active sessions are also tracked in the database
- Conversion flow that creates or updates the client `User`, creates a `ClientProfile`, creates a starter `ClientTarget`, and marks the prospect as active

## Not Implemented Yet

- Weekly check-ins
- Full client dashboards or member portals
- Payments or subscriptions
- Messaging
- Scheduling
- AI-assisted features

## Routes

- `/` public landing page with lead capture
- `/admin/login` admin sign-in
- `/admin` admin overview for prospect and client data
- `/admin/prospects` prospect pipeline list
- `/admin/prospects/[id]` prospect detail and conversion view
- `/api/prospects` POST route for lead capture
- `/api/admin/login` POST route for admin sign-in
- `/api/admin/logout` POST route for admin sign-out

## Data Model Summary

- `Prospect`: lead capture records
- `User`: admin or future client accounts
- `AdminSession`: database-backed admin session records
- `MagicLinkToken`: future-ready auth token / magic link scaffold
- `ClientProfile`: onboarding and client record scaffold
- `ClientTarget`: goal and target scaffold tied to a client profile

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env
```

3. Set values in `.env`, especially:

- `DATABASE_URL`
- `SESSION_SECRET`
- `ADMIN_BOOTSTRAP_EMAIL`
- `ADMIN_BOOTSTRAP_PASSWORD`

4. Create the database and Prisma client:

```bash
npm run db:push
npm run prisma:generate
```

5. Start the app:

```bash
npm run dev
```

Then open `http://localhost:3003`.

## Notes

- The first successful admin sign-in using the bootstrap credentials will upsert the initial admin user record.
- Prospect conversion is transactional so the account, client profile, starter target, and prospect status update stay in sync.
- This repo does not modify `/root/projects/fitness-site`.
