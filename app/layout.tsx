import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getAdminSession } from "@/lib/auth";
import { siteConfig } from "@/lib/site";
import { ToastProvider } from "@/app/components/Toast";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Ruffo Fitness transformation result"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage]
  },
  category: "fitness"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAdminSession();

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    brand: siteConfig.name,
    image: `${siteConfig.url}${siteConfig.ogImage}`,
    founder: {
      "@type": "Person",
      name: "Brian Ruffo",
      alternateName: "Ruffo"
    },
    areaServed: "United States",
    serviceType: ["Online fitness coaching", "Fat loss coaching", "Body recomposition coaching"],
    sameAs: []
  };

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
        />
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
          <ToastProvider>
            <main>{children}</main>
          </ToastProvider>
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
