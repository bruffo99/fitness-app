import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { socialLinks } from "@/lib/social";
import { SocialIcon } from "@/app/components/SocialIcon";

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
            <Link href="/my-story" className="site-nav__link">
              My story
            </Link>
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
          <nav className="site-footer__social" aria-label="Social media">
            {socialLinks.map((social) => (
              <a
                key={social.key}
                href={social.url}
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Ruffo Fitness on ${social.label}`}
              >
                <SocialIcon platform={social.key} />
              </a>
            ))}
          </nav>
          <div className="site-footer__legal">
            <span>Coaching inquiries are reviewed before onboarding begins.</span>
            <span>Scheduling, billing, and check-ins are handled after intake.</span>
            <span>© {new Date().getFullYear()} Ruffo Fitness</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
