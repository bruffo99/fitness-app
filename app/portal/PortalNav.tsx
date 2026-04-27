"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

const NAV_ITEMS: { label: string; href: Route }[] = [
  { label: "Home", href: "/portal" },
  { label: "Check-in", href: "/portal/checkin" },
  { label: "Gym", href: "/portal/gym" },
  { label: "My Plan", href: "/portal/plan" },
];

export function PortalNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/portal") return pathname === "/portal";
    return pathname.startsWith(href);
  }

  return (
    <>
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`site-nav__link${isActive(item.href) ? " site-nav__link--active" : ""}`}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}
