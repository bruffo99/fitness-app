import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getAdminSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Ruffo Fitness v2",
  description: "Phase 1 foundation for a lightweight Ruffo Fitness coaching app."
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
                <span className="brand__title">Ruffo Fitness v2</span>
                <span className="brand__tag">Phase 1 coaching app foundation</span>
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
              <span>Lead capture is active in Phase 1.</span>
              <span>Check-ins, payments, messaging, scheduling, and AI remain deferred.</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
