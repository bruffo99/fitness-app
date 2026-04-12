import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Inquiry Received",
  description: "Your Ruffo Fitness coaching inquiry has been received and is queued for review.",
  robots: {
    index: false,
    follow: false
  }
};

export default function ThanksPage() {
  return (
    <div className="page thanks-page">
      <section className="container thanks-page__wrap">
        <div className="card card--hero thanks-page__card">
          <div className="page-kicker">Inquiry received</div>
          <h1>
            You&apos;re <span className="accent">in.</span>
          </h1>
          <p className="thanks-page__lead">
            Your coaching inquiry is in front of Ruffo. It has been received, logged,
            and queued for review.
          </p>

          <div className="thanks-page__steps">
            <div className="thanks-page__step">
              <strong>What happens next</strong>
              <p>
                Ruffo reviews your goal, your context, and your preferred contact method
                before any offer is made.
              </p>
            </div>
            <div className="thanks-page__step">
              <strong>How you&apos;ll hear back</strong>
              <p>
                If the fit is right, the follow-up comes by email, phone, or text based
                on what you submitted.
              </p>
            </div>
          </div>

          <p className="thanks-page__note">
            No extra forms. No fake urgency. The next move is a direct reply once the
            intake has been reviewed.
          </p>

          <div className="inline-actions">
            <Link href="/" className="button">
              Back to homepage
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
