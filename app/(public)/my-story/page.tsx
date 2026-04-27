import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Story | Ruffo Fitness",
  description: "How Brian Ruffo went from 400 pounds with Type 2 diabetes to a decade-long transformation — and why he now coaches others through theirs.",
  alternates: { canonical: "/my-story" },
};

export default function MyStoryPage() {
  return (
    <div className="story-page">
      <section className="story-hero">
        <div className="container story-hero__inner">
          <div className="hero__eyebrow">The origin</div>
          <h1>
            The 400-pound<br />
            <span className="accent">wake-up call.</span>
          </h1>
          <p className="story-hero__lead">
            And why your first step matters more than you think.
          </p>
        </div>
      </section>

      <section className="story-body">
        <div className="container story-body__inner">

          <p className="story-lede">
            Look, I&apos;m not going to sugarcoat this.
          </p>

          <p>
            There was a moment standing in front of my bathroom mirror in my early 40s
            when I couldn&apos;t even look at myself anymore.
          </p>

          <div className="story-callout">
            <span>400 pounds.</span>
            <span>Type 2 diabetes.</span>
            <span>Foot problems that made every step painful.</span>
          </div>

          <p>
            And a terrifying glimpse into my future: walkers, scooters, mobility
            devices — or worse.
          </p>

          <p className="story-emphasis">That was my rock bottom.</p>

          <p>
            But here&apos;s what nobody tells you about rock bottom: it&apos;s also the
            most solid foundation you&apos;ll ever stand on to rebuild your life.
          </p>

          <h2>The decision that changes everything</h2>

          <p>
            I didn&apos;t need another diet. I didn&apos;t need another
            &ldquo;miracle&rdquo; workout plan.
          </p>

          <p className="story-emphasis">
            I needed to make one decision: I wanted to live — really live — not just exist.
          </p>

          <p>
            I wanted to be strong. Lean. Mobile. I wanted to experience life with my
            family and friends without being a prisoner in my own failing body.
          </p>

          <p>
            So I started. Then I stopped. Started again. Stopped again.
          </p>

          <p>Sound familiar?</p>

          <p className="story-emphasis">Then came the moment of truth: all in, or not at all.</p>

          <h2>The year that rewrote my story</h2>

          <p>
            I worked with the best fitness trainers, nutrition experts, and body
            transformation specialists who understand the unique challenges of
            transforming bodies in their 40s, 50s, and beyond.
          </p>

          <p>Within one year, everything changed.</p>

          <p>
            Not just my body. Not just the numbers on the scale. But the way I felt when
            I woke up. The energy I had. The confidence that came from looking in that
            same mirror and actually liking what I saw.
          </p>

          <p className="story-emphasis">That was over 10 years ago.</p>

          <h2>Why I&apos;m telling you this</h2>

          <p>
            Since my transformation, hundreds of people have asked me: &ldquo;How did
            you do it? What was the secret?&rdquo;
          </p>

          <p className="story-emphasis">
            The truth? There&apos;s no secret. There&apos;s a decision. There&apos;s a
            process. There&apos;s a journey.
          </p>

          <p>
            And there are coaches who actually specialize in real body transformation —
            people who understand that our bodies in our 40s, 50s, and beyond
            don&apos;t respond like they did at 25.
          </p>

          <p>
            Now I help people just like you — people who are tired of feeling trapped,
            tired of putting life on hold, tired of wondering &ldquo;what if?&rdquo;
          </p>

          <h2>Your turn</h2>

          <p>You&apos;re reading this for a reason.</p>

          <p>
            Maybe you&apos;re at your own rock bottom. Maybe you&apos;re just tired of
            feeling tired. Maybe you&apos;ve started and stopped before — join the club.
          </p>

          <p className="story-emphasis">
            But here&apos;s what matters: you&apos;re here. Right now. In this moment.
          </p>

          <p>
            That means you still have that spark — that desire to be healthy, strong,
            and free.
          </p>

          <p>
            I&apos;m not going to promise it&apos;s easy. I&apos;m not going to tell
            you it happens overnight.
          </p>

          <p className="story-emphasis">
            But if a 400-pound guy with diabetes and failing health could transform his
            life and maintain it for over a decade — you can take the first step.
          </p>

          <p>
            Not tomorrow. Not after the holidays. Not when conditions are perfect.
          </p>

          <div className="story-cta">
            <p className="story-emphasis" style={{ marginBottom: "2rem" }}>Today.</p>

            <div className="story-proof">
              <div className="proof-card">
                <div className="proof-card__top">
                  <h3>Before</h3>
                  <span>Starting point</span>
                </div>
                <div className="proof-image-frame">
                  <Image
                    src="/images/before.jpg"
                    alt="Brian Ruffo before transformation"
                    fill
                    sizes="(max-width: 680px) 100vw, 340px"
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
                    alt="Brian Ruffo after transformation"
                    fill
                    sizes="(max-width: 680px) 100vw, 340px"
                    className="proof-image"
                  />
                </div>
              </div>
            </div>

            <Link href="/#lead-form" className="button" style={{ fontSize: "1.1rem", padding: "1rem 2rem", marginTop: "2.5rem" }}>
              Apply for coaching
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}
