import Link from "next/link";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function HomePage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const status = typeof searchParams.status === "string" ? searchParams.status : "";

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="card card--hero">
            <div className="hero__eyebrow">Online coaching</div>
            <h1>
              Built <span className="accent">different.</span> Train with intent.
            </h1>
            <p className="hero__lead">
              Ruffo Fitness is for people who want real structure, direct feedback, and
              a clear path forward. Start with the intake, state the goal, and let the
              conversation begin without the usual sales friction.
            </p>
            <div className="pill-row">
              <span className="pill">1:1 coaching inquiries</span>
              <span className="pill">Goal-focused intake</span>
              <span className="pill">Direct follow-up</span>
              <span className="pill">No gimmicks</span>
            </div>

            <div className="inline-actions" style={{ marginTop: "2rem" }}>
              <Link href="#lead-form" className="button">
                Start your intake
              </Link>
              <Link href="/admin" className="button-secondary">
                Open admin area
              </Link>
            </div>

            <div className="hero__stats" style={{ marginTop: "2rem" }}>
              <div className="hero__stat">
                <span className="hero__stat-value">20+</span>
                <span className="hero__stat-label">Years training</span>
              </div>
              <div className="hero__stat">
                <span className="hero__stat-value">1:1</span>
                <span className="hero__stat-label">Private coaching focus</span>
              </div>
              <div className="hero__stat">
                <span className="hero__stat-value">Real</span>
                <span className="hero__stat-label">Results over hype</span>
              </div>
            </div>
          </div>

          <div className="card card--feature">
            <div className="section__eyebrow">What to expect</div>
            <div className="stack">
              <p className="muted">
                The intake stays simple on purpose. You send the basics, Ruffo reviews
                the lead, and qualified inquiries move into onboarding only after the
                fit is clear.
              </p>
              <ul className="list">
                <li>Short intake form for coaching inquiries</li>
                <li>Space to explain your main goal in your own words</li>
                <li>Direct follow-up based on your preferred contact method</li>
                <li>Client setup begins only after the lead is reviewed</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid-2">
          <div className="card">
            <div className="section__eyebrow">Get started</div>
            <h2 id="lead-form">
              Tell Ruffo what you want to <span className="accent">change.</span>
            </h2>
            <p>
              This is the first step for serious coaching inquiries. Keep it direct,
              explain the goal, and include enough context for a useful reply.
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
            <div className="section__eyebrow">Before you submit</div>
            <h2>
              What happens after the <span className="accent">form lands.</span>
            </h2>
            <ul className="list">
              <li>Your inquiry is reviewed by the coaching team</li>
              <li>Follow-up happens by email, phone, or text based on your preference</li>
              <li>Client records are created only when a lead is accepted</li>
              <li>Billing, scheduling, and check-ins are handled later in the process</li>
            </ul>
            <p>
              The goal is a strong first contact, not a bloated member portal. The
              admin side stays focused on pipeline, notes, and conversion.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
