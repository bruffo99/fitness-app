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
- Best-effort lead emails after a successful inquiry save:
  - welcome/confirmation email to the prospect
  - notification email to the owner or admin
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
- `PUBLIC_APP_URL`
- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`
- `PROSPECT_NOTIFICATION_EMAIL`

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
- Prospect email sending is best-effort. If Gmail credentials are missing or email delivery fails, the prospect is still saved and the form still redirects with success.
- Gmail sending follows the old app pattern and expects an app password, not your normal Gmail password.
- This repo does not modify `/root/projects/fitness-site`.
