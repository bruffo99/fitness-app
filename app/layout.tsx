import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getAdminSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Ruffo Fitness",
  description: "Private coaching inquiries and client intake for Ruffo Fitness."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAdminSession();

  return (
    <html lang="en">
      <body>
        <div className="shell">
          <header className="site-header">
            <div className="container site-header__inner">
              <Link href="/" className="brand">
                <span className="brand__title">
                  Ruffo <span className="brand__title-accent">Fitness</span>
                </span>
                <span className="brand__tag">Built different. Intake and coaching admin.</span>
              </Link>
              <nav className="site-nav">
                <Link href="/" className="site-nav__link">
                  Home
                </Link>
                <Link href="/admin" className="site-nav__link">
                  Admin
                </Link>
                {session ? (
                  <form action="/api/admin/logout" method="post">
                    <button type="submit" className="site-nav__button">
                      Sign out
                    </button>
                  </form>
                ) : (
                  <Link href="/admin/login" className="site-nav__button">
                    Admin sign in
                  </Link>
                )}
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
      </body>
    </html>
  );
}
