export const siteConfig = {
  name: "Ruffo Fitness",
  shortName: "Ruffo Fitness",
  title: "Ruffo Fitness | Online Fitness Coaching for Fat Loss, Body Recomp, and Accountability",
  description:
    "Ruffo Fitness offers direct online fitness coaching for fat loss, body recomposition, and accountability. No gimmicks, no fluff, just structured coaching built around real goals.",
  domain: "fitness.ruffo.ai",
  url: "https://fitness.ruffo.ai",
  ogImage: "/images/after.jpg",
  // Google Analytics 4. Public by design — it ships in the page source.
  // Empty string disables analytics entirely. Annotated `as string` so the
  // surrounding `as const` doesn't narrow it to a literal type.
  gaMeasurementId: "G-TXG2MPWMFG" as string,
  keywords: [
    "Ruffo Fitness",
    "online fitness coach",
    "fat loss coaching",
    "body recomposition coach",
    "fitness accountability coaching",
    "online personal training",
    "fitness coach for men over 40",
    "fitness coach for men over 50"
  ]
} as const;
