import type { Metadata } from "next";
import { LinksClient } from "./LinksClient";

export const metadata: Metadata = {
  title: "Links",
  description:
    "All things Ruffo Fitness in one place — book a session, apply for coaching, and follow along on Instagram, TikTok, YouTube, and Facebook.",
  alternates: { canonical: "/links" },
  robots: { index: true, follow: true },
};

export default function LinksPage() {
  return <LinksClient />;
}
