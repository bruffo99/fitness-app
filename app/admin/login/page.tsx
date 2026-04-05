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
      <div className="container" style={{ maxWidth: "620px" }}>
        <div className="card">
          <div className="section__eyebrow">Admin access</div>
          <h1>Sign in</h1>
          <p>
            Phase 1 uses a server-issued session cookie. Credentials stay on the
            server and are not embedded in client-side JavaScript.
          </p>

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
    </section>
  );
}
