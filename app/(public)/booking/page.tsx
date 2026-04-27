import type { Metadata } from "next";
import Link from "next/link";
import { CalendlyEmbed } from "./CalendlyEmbed";

export const metadata: Metadata = {
  title: "Book a Session | Ruffo Fitness",
  description:
    "Book a 1-hour advisory session with Ruffo. $150. Direct coaching conversation — no fluff, just clarity on your goal, your plan, and your next steps.",
  robots: { index: true, follow: true },
};

export default function BookingPage() {
  return (
    <div className="public-home">
      <section className="hero">
        <div className="container">
          <div className="card card--hero">
            <div className="hero__eyebrow">Advisory session</div>
            <p style={{ fontSize: "1.65rem", fontWeight: 700, letterSpacing: "0.01em", color: "var(--text-strong)", margin: "0 0 0.25rem", lineHeight: 1.2 }}>
              One hour. <span className="accent">Real answers.</span>
            </p>
            <div className="pill-row">
              <span className="pill">1 hour</span>
              <span className="pill">$150</span>
              <span className="pill">Video call</span>
              <span className="pill">Payment at booking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Calendly embed — immediately visible after hero */}
      <section className="section" style={{ paddingTop: "1.5rem" }}>
        <div className="container">
          <div className="card">
            <div className="section__eyebrow">Pick your time</div>
            <p className="muted" style={{ marginBottom: "1.5rem" }}>
              Select a time below. Payment is collected through PayPal as part of
              the booking — your spot is confirmed once payment is complete.
            </p>
            <CalendlyEmbed url="https://calendly.com/brianruffo/introduction-session" />
          </div>
        </div>
      </section>

      {/* Supporting info below the calendar */}
      <section className="section">
        <div className="container grid-2">
          <div className="card">
            <div className="section__eyebrow">What you get</div>
            <ul className="list">
              <li>Honest assessment of your current approach — what&apos;s working and what&apos;s not</li>
              <li>A clear direction for training, nutrition, or both</li>
              <li>Answers to the specific questions you&apos;ve been stuck on</li>
              <li>No generic advice — everything tailored to your actual situation</li>
            </ul>
          </div>
          <div className="card">
            <div className="section__eyebrow">Good fit for</div>
            <ul className="list">
              <li>You&apos;ve been spinning your wheels and want a direct read on why</li>
              <li>You want a program review before committing to full coaching</li>
              <li>You&apos;re making a major body composition push and want to get it right</li>
              <li>You need accountability and a plan from someone who&apos;s actually done it</li>
            </ul>
            <div className="inline-actions" style={{ marginTop: "1.5rem" }}>
              <Link href="/#lead-form" className="button-secondary">
                Apply for coaching instead
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
