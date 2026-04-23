import type { Metadata } from "next";
import "./globals.css";
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

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
