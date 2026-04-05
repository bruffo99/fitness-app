# Ruffo Fitness v2

Working coaching-app prototype in a separate project directory from `/root/projects/fitness-site`.

## Stack

- Next.js App Router with TypeScript
- Prisma ORM
- SQLite for local development
- Server-side admin auth using a signed `httpOnly` session cookie

## What This Build Includes

- Public landing page with lead capture form
- Prospect intake persistence through Prisma
- Initial schema for:
  - prospects
  - users
  - admin sessions
  - magic link tokens
  - client profiles
  - client targets
- Admin sign-in foundation that is stronger than a frontend bearer token:
  - credentials are posted to the server
  - the server creates a signed, `httpOnly` session cookie
  - active sessions are also tracked in the database
- Minimal admin page showing prospect intake and foundation counts

## Not Implemented Yet

The following are intentionally not implemented yet:

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
- Lead capture, admin login, pipeline management, notes, and prospect conversion are implemented.
- Prospect conversion currently marks a lead as active and creates a `User` record, but it does not yet create a `ClientProfile`. That should be fixed before calling the client-conversion flow production-ready.
- This repo does not modify `/root/projects/fitness-site`.
