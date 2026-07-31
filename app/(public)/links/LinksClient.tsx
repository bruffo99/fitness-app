"use client";

import Link from "next/link";
import { socialLinks } from "@/lib/social";
import { SocialIcon } from "@/app/components/SocialIcon";
import { trackEvent } from "@/lib/analytics";

export function LinksClient() {
  return (
    <div className="page links-page">
      <section className="container links-page__wrap">
        <header className="links-page__head">
          <span className="brand__title links-page__brand">
            Ruffo <span className="brand__title-accent">Fitness</span>
          </span>
          <p className="links-page__tag">
            Fat loss, body recomposition, and accountability coaching for men 40+.
          </p>
        </header>

        <div className="links-page__actions">
          <Link
            href="/booking"
            className="button links-page__cta"
            onClick={() => trackEvent("links_click", { destination: "booking" })}
          >
            Book a session — $150
          </Link>
          <Link
            href="/#lead-form"
            className="button-secondary links-page__link"
            onClick={() => trackEvent("links_click", { destination: "apply" })}
          >
            Apply for coaching
          </Link>
          <Link
            href="/my-story"
            className="button-secondary links-page__link"
            onClick={() => trackEvent("links_click", { destination: "my_story" })}
          >
            My story
          </Link>
        </div>

        <nav className="links-page__social" aria-label="Social media">
          {socialLinks.map((social) => (
            <a
              key={social.key}
              href={social.url}
              className="links-page__social-link"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent("links_click", { destination: `social_${social.key}` })
              }
            >
              <SocialIcon platform={social.key} className="links-page__social-icon" />
              <span className="links-page__social-label">{social.label}</span>
              <span className="links-page__social-handle">{social.handle}</span>
            </a>
          ))}
        </nav>
      </section>
    </div>
  );
}
