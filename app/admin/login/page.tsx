import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminLoginPage(props: { searchParams: SearchParams }) {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  const searchParams = await props.searchParams;
  const error = typeof searchParams.error === "string" ? searchParams.error : "";

  return (
    <section className="page">
      <div className="container">
        <div className="auth-grid">
          <div className="admin-panel auth-hero">
            <div className="section__eyebrow">Admin access</div>
            <h1>
              Coaching <span className="accent">command center.</span>
            </h1>
            <p>
              Use the coaching admin credentials to review inquiries, manage the
              pipeline, and convert accepted prospects into client records.
            </p>
            <div className="pill-row">
              <span className="pill">Prospect pipeline</span>
              <span className="pill">Coach notes</span>
              <span className="pill">Client conversion</span>
            </div>
          </div>

          <div className="admin-panel">
            <div className="section__eyebrow">Sign in</div>
            <p className="muted">Enter the bootstrap admin credentials to continue.</p>

            {error ? (
              <div className="feedback feedback--error">
                Sign-in failed. Check the bootstrap admin credentials and try again.
              </div>
            ) : null}

            <form action="/api/admin/login" method="post" className="form">
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" required />
              </div>
              <div className="field">
                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password" required />
              </div>
              <button type="submit" className="button">
                Sign in
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
