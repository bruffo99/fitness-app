import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getClientSession } from "@/lib/client-auth";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: "Client Login",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true, nocache: true }
  }
};

const ERROR_MESSAGES: Record<string, string> = {
  "1": "That sign-in link is invalid or expired. Request a new one to continue."
};

const SUCCESS_MESSAGES: Record<string, string> = {
  "1": "Check your inbox. Your secure sign-in link is on the way."
};

export default async function PortalLoginPage(props: { searchParams: SearchParams }) {
  const session = await getClientSession();

  if (session) {
    redirect("/portal");
  }

  const searchParams = await props.searchParams;
  const errorKey = typeof searchParams.error === "string" ? searchParams.error : "";
  const successKey = typeof searchParams.sent === "string" ? searchParams.sent : "";
  const errorMessage = ERROR_MESSAGES[errorKey] ?? "";
  const successMessage = SUCCESS_MESSAGES[successKey] ?? "";

  return (
    <section className="page">
      <div className="container">
        <div className="auth-grid">
          <div className="admin-panel auth-hero">
            <div className="section__eyebrow">Client access</div>
            <h1>
              Sign in to your <span className="accent">coaching portal</span>
            </h1>
            <p>
              Access your coaching notes, current targets, and upcoming client features from one
              secure link sent to your email.
            </p>
            <div className="pill-row">
              <span className="pill">Private portal</span>
              <span className="pill">Active targets</span>
              <span className="pill">Coach updates</span>
            </div>
          </div>

          <div className="admin-panel">
            <div className="section__eyebrow">Magic link</div>
            <p className="muted">Enter your email and we&apos;ll send a secure sign-in link.</p>

            {successMessage ? <div className="feedback">{successMessage}</div> : null}
            {errorMessage ? <div className="feedback feedback--error">{errorMessage}</div> : null}

            <form action="/api/auth/magic" method="post" className="form">
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" required autoComplete="email" />
              </div>
              <button type="submit" className="button">
                Email sign-in link
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
