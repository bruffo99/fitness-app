import Link from "next/link";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function HomePage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const status = typeof searchParams.status === "string" ? searchParams.status : "";

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="card">
            <div className="hero__eyebrow">Phase 1</div>
            <h1>Private coaching, rebuilt on a tighter foundation.</h1>
            <p>
              Ruffo Fitness v2 starts with a simple intake path and a secure admin
              foundation. This phase captures new leads, stores the first data models,
              and creates the base for client onboarding without shipping later-phase
              features too early.
            </p>
            <div className="pill-row">
              <span className="pill">Lead capture</span>
              <span className="pill">Admin sign-in</span>
              <span className="pill">SQLite + Prisma schema</span>
              <span className="pill">Client scaffolds</span>
            </div>
          </div>

          <div className="card">
            <div className="section__eyebrow">What exists now</div>
            <div className="stack">
              <p className="muted">
                The app is intentionally narrow. It handles early prospect collection,
                admin access, and starter records for eventual client onboarding.
              </p>
              <ul className="list">
                <li>Prospect intake form that writes to the database</li>
                <li>Admin login using a signed, `httpOnly` cookie</li>
                <li>Schema for users, tokens, profiles, targets, and sessions</li>
                <li>Admin page showing captured leads and basic counts</li>
              </ul>
              <div className="inline-actions">
                <Link href="#lead-form" className="button">
                  Join coaching waitlist
                </Link>
                <Link href="/admin" className="button-secondary">
                  Open admin area
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid-2">
          <div className="card">
            <div className="section__eyebrow">Lead capture</div>
            <h2 id="lead-form">Start with a short intake.</h2>
            <p>
              This is the only public workflow in Phase 1. It preserves lead capture
              while the rest of the coaching product is still being staged.
            </p>

            {status === "success" ? (
              <div className="feedback">Thanks. Your inquiry was received.</div>
            ) : null}

            {status === "duplicate" ? (
              <div className="feedback feedback--error">
                That email is already on file. Reach out directly if you need help.
              </div>
            ) : null}

            {status === "error" ? (
              <div className="feedback feedback--error">
                The form could not be submitted. Check the required fields and try
                again.
              </div>
            ) : null}

            <form action="/api/prospects" method="post" className="form">
              <div className="field-row">
                <div className="field">
                  <label htmlFor="firstName">First name</label>
                  <input id="firstName" name="firstName" required />
                </div>
                <div className="field">
                  <label htmlFor="lastName">Last name</label>
                  <input id="lastName" name="lastName" required />
                </div>
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" required />
              </div>
              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input id="phone" name="phone" type="tel" />
              </div>
              <div className="field">
                <label htmlFor="preferredContact">Preferred contact method</label>
                <select id="preferredContact" name="preferredContact">
                  <option value="">No preference</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone call</option>
                  <option value="text">Text message</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="goalSummary">Primary goal</label>
                <textarea
                  id="goalSummary"
                  name="goalSummary"
                  placeholder="What are you trying to improve right now?"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="message">Anything else? <span className="field__optional">(optional)</span></label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Any context that would help Ruffo understand where you're starting from."
                />
              </div>
              <button type="submit" className="button">
                Submit inquiry
              </button>
            </form>
          </div>

          <div className="card">
            <div className="section__eyebrow">Deferred by design</div>
            <h2>What this phase does not build yet.</h2>
            <ul className="list">
              <li>Weekly check-ins and habit reviews</li>
              <li>Member dashboards beyond the admin foundation</li>
              <li>Payments, subscriptions, or billing portals</li>
              <li>Messaging, scheduling, or AI assistant flows</li>
            </ul>
            <p>
              Those features depend on stable onboarding and account structures first.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
