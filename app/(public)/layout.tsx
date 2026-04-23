import Link from "next/link";
import { getAdminSession } from "@/lib/auth";

export default async function PublicLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAdminSession();

  return (
    <div className="shell">
      <header className="site-header">
        <div className="container site-header__inner">
          <Link href="/" className="brand">
            <span className="brand__title">
              Ruffo <span className="brand__title-accent">Fitness</span>
            </span>
            <span className="brand__tag">Built different. Train with intent.</span>
          </Link>
          <nav className="site-nav">
            <Link href="/booking" className="site-nav__link">
              Book a session
            </Link>
            <Link href="/#lead-form" className="site-nav__link">
              Apply
            </Link>
            {session ? (
              <form action="/api/admin/logout" method="post">
                <button type="submit" className="site-nav__button">
                  Sign out
                </button>
              </form>
            ) : null}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="container site-footer__inner">
          <span>Coaching inquiries are reviewed before onboarding begins.</span>
          <span>Scheduling, billing, and check-ins are handled after intake.</span>
        </div>
      </footer>
    </div>
  );
}
