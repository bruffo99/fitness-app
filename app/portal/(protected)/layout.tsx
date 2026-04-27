import Link from "next/link";
import { redirect } from "next/navigation";
import { getClientSession } from "@/lib/client-auth";
import { PortalNav } from "@/app/portal/PortalNav";

export default async function PortalLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getClientSession();

  if (!user) {
    redirect("/portal/login");
  }

  return (
    <>
      <header className="site-header">
        <div className="container site-header__inner">
          <Link href="/portal" className="brand">
            <span className="brand__title">
              Ruffo <span className="brand__title-accent">Fitness</span>
            </span>
            <span className="brand__tag">Client coaching portal</span>
          </Link>
          <nav className="site-nav">
            <PortalNav />
            <span className="site-nav__divider" />
            <Link href="/api/auth/signout" className="site-nav__button">
              Sign out
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}
