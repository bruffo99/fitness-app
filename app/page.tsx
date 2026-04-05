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
            <div className="hero__eyebrow">Online coaching</div>
            <h1>Simple, practical coaching for people who want a clear next step.</h1>
            <p>
              Ruffo Fitness helps new clients start with a short intake instead of a
              long sales process. Share your goal, a bit of context, and the best way
              to reach you.
            </p>
            <div className="pill-row">
              <span className="pill">1:1 coaching inquiries</span>
              <span className="pill">Goal-focused intake</span>
              <span className="pill">Personal follow-up</span>
              <span className="pill">Simple onboarding</span>
            </div>
          </div>

          <div className="card">
            <div className="section__eyebrow">What to expect</div>
            <div className="stack">
              <p className="muted">
                The site is built to start the conversation clearly. You send the
                basics, Ruffo reviews your inquiry, and qualified leads move into
                client onboarding from there.
              </p>
              <ul className="list">
                <li>Short intake form for coaching inquiries</li>
                <li>Space to explain your main goal in your own words</li>
                <li>Direct follow-up based on your preferred contact method</li>
                <li>Client setup begins only after the lead is reviewed</li>
              </ul>
              <div className="inline-actions">
                <Link href="#lead-form" className="button">
                  Start your intake
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
            <div className="section__eyebrow">Get started</div>
            <h2 id="lead-form">Tell Ruffo what you want to work on.</h2>
            <p>
              This form is for people interested in coaching. It keeps the first step
              straightforward and gives enough context for a useful follow-up.
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
            <h2>What happens after the form is sent.</h2>
            <ul className="list">
              <li>Your inquiry is reviewed by the coaching team</li>
              <li>Follow-up happens by email, phone, or text based on your preference</li>
              <li>Client records are created only when a lead is accepted</li>
              <li>Billing, scheduling, and check-ins are handled later in the process</li>
            </ul>
            <p>
              The goal here is a clean first contact, not an all-in-one member portal.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
