import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  alternates: {
    canonical: "/"
  }
};

export default async function HomePage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const status = typeof searchParams.status === "string" ? searchParams.status : "";

  return (
    <div className="public-home">
      <section className="hero">
        <div className="container hero__grid">
          <div className="card card--hero home-reveal home-reveal--delay-100">
            <div className="hero__eyebrow home-reveal">Online coaching</div>
            <h1 className="home-reveal home-reveal--delay-100">
              Built <span className="accent">different.</span> Train with intent.
            </h1>
            <p className="hero__lead home-reveal home-reveal--delay-200">
              Ruffo Fitness is for people who are done guessing. You get real structure,
              direct feedback, and a plan built around your actual goal — fat loss,
              body recomposition, or getting your discipline back. Start with the intake,
              state the target, and the conversation starts without the usual fitness-industry nonsense.
            </p>
            <div className="pill-row home-reveal home-reveal--delay-300">
              <span className="pill">1:1 coaching inquiries</span>
              <span className="pill">Goal-focused intake</span>
              <span className="pill">Direct follow-up</span>
              <span className="pill">No gimmicks</span>
            </div>

            <div className="inline-actions home-reveal home-reveal--delay-400" style={{ marginTop: "2rem" }}>
              <Link href="#lead-form" className="button">
                Start your intake
              </Link>
            </div>

            <div className="hero__stats home-reveal home-reveal--delay-500" style={{ marginTop: "2rem" }}>
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

          <div className="card card--feature home-reveal home-reveal--delay-300">
            <div className="section__eyebrow">What to expect</div>
            <div className="stack">
              <p className="muted">
                The intake stays simple on purpose. You send the basics, Ruffo reviews
                the lead, and qualified inquiries move into onboarding only after the
                fit is clear.
              </p>
              <ul className="list">
                <li>Short intake form for serious coaching inquiries</li>
                <li>Clear space to explain the real goal and current sticking points</li>
                <li>Direct follow-up based on your preferred contact method</li>
                <li>Client setup begins only after the fit is clear</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--proof">
        <div className="container">
          <div className="proof-header home-reveal">
            <div className="section__eyebrow">Transformation proof</div>
            <h2 className="home-reveal home-reveal--delay-100">
              The <span className="accent">proof</span>
            </h2>
            <p className="proof-lead home-reveal home-reveal--delay-200">
              This is not stock photography or borrowed credibility. It is Ruffo,
              and it is the standard: real work, real consistency, and results that
              had to be earned.
            </p>
          </div>

          <div className="proof-grid">
            <div className="proof-card">
              <div className="proof-card__top">
                <h3>Before</h3>
                <span>Starting point</span>
              </div>
              <div className="proof-image-frame">
                <Image
                  src="/images/before.jpg"
                  alt="Before transformation"
                  fill
                  sizes="(max-width: 980px) 100vw, 50vw"
                  className="proof-image"
                />
              </div>
            </div>

            <div className="proof-card proof-card--after">
              <div className="proof-card__top">
                <h3>After</h3>
                <span>Earned, not given</span>
              </div>
              <div className="proof-image-frame">
                <Image
                  src="/images/after.jpg"
                  alt="After transformation"
                  fill
                  sizes="(max-width: 980px) 100vw, 50vw"
                  className="proof-image"
                />
              </div>
            </div>
          </div>

          <div className="proof-metrics">
            <div className="proof-metric">
              <strong>52</strong>
              <span>Years old</span>
            </div>
            <div className="proof-metric">
              <strong>6&apos;3&quot;</strong>
              <span>Height</span>
            </div>
            <div className="proof-metric">
              <strong>Real</strong>
              <span>Body recomp</span>
            </div>
          </div>

          <p className="proof-note">
            Coaching only works when the standard is real. If you want shortcuts,
            this is the wrong place. If you want structure, accountability, and visible
            change over time, you&apos;re exactly where you should be.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container grid-2">
          <div className="card">
            <div className="section__eyebrow home-reveal">Get started</div>
            <h2 id="lead-form" className="home-reveal home-reveal--delay-100">
              Tell Ruffo what you want to <span className="accent">change.</span>
            </h2>
            <p className="home-reveal home-reveal--delay-200">
              This is the first step for serious coaching inquiries. Keep it direct,
              explain what you want to change, what has not been working, and enough
              context to make the follow-up useful.
            </p>

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
                <label htmlFor="phone">Phone <span className="field__optional">(optional)</span></label>
                <input id="phone" name="phone" type="tel" />
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="goalType">Primary goal type</label>
                  <select id="goalType" name="goalType" required>
                    <option value="">Select a goal</option>
                    <option value="fat_loss">Fat loss</option>
                    <option value="muscle_gain">Muscle gain</option>
                    <option value="body_recomp">Body recomposition</option>
                    <option value="performance">Athletic performance</option>
                    <option value="general_health">General health &amp; fitness</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="fitnessLevel">Current fitness level</label>
                  <select id="fitnessLevel" name="fitnessLevel" required>
                    <option value="">Select a level</option>
                    <option value="beginner">Beginner — little to no training history</option>
                    <option value="intermediate">Intermediate — training consistently 1–2 years</option>
                    <option value="advanced">Advanced — 3+ years of structured training</option>
                  </select>
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="timeline">When do you want to start?</label>
                  <select id="timeline" name="timeline">
                    <option value="">No preference</option>
                    <option value="asap">As soon as possible</option>
                    <option value="1_3_months">Within 1–3 months</option>
                    <option value="3_6_months">3–6 months out</option>
                    <option value="6_plus_months">Just exploring for now</option>
                  </select>
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
              </div>
              <div className="field">
                <label htmlFor="goalSummary">Describe your goal in detail</label>
                <textarea
                  id="goalSummary"
                  name="goalSummary"
                  placeholder="What specifically are you trying to change? What has not been working?"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="injuries">Injuries or physical limitations <span className="field__optional">(optional)</span></label>
                <textarea
                  id="injuries"
                  name="injuries"
                  placeholder="Any current or past injuries, chronic pain, or movement restrictions Ruffo should know about."
                />
              </div>
              <div className="field">
                <label htmlFor="referralSource">How did you hear about Ruffo Fitness? <span className="field__optional">(optional)</span></label>
                <select id="referralSource" name="referralSource">
                  <option value="">Select one</option>
                  <option value="referral">Friend or family referral</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="google">Google search</option>
                  <option value="youtube">YouTube</option>
                  <option value="podcast">Podcast</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="message">Anything else? <span className="field__optional">(optional)</span></label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Any other context that would help Ruffo understand where you're starting from."
                />
              </div>
              <button type="submit" className="button">
                Submit inquiry
              </button>
            </form>
          </div>

          <div className="card">
            <div className="section__eyebrow home-reveal home-reveal--delay-100">Before you submit</div>
            <h2 className="home-reveal home-reveal--delay-200">
              What happens after the <span className="accent">form lands.</span>
            </h2>
            <ul className="list home-reveal home-reveal--delay-300">
              <li>Your inquiry is reviewed before any coaching offer is made</li>
              <li>Follow-up happens by email, phone, or text based on your preference</li>
              <li>Client records are created only when a lead is accepted</li>
              <li>Billing, scheduling, and check-ins come later, after fit is confirmed</li>
            </ul>
            <p className="home-reveal home-reveal--delay-400">
              The point is a strong first conversation, not a bloated portal pretending
              to be value. First comes clarity. Then comes execution.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
