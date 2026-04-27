"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

const NAV_ITEMS: { label: string; href: Route }[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Prospects", href: "/admin/prospects" },
  { label: "Follow-ups", href: "/admin/followups" },
  { label: "Check-ins", href: "/admin/checkins" },
];

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <Link href="/admin" className="brand">
          <span className="brand__title">
            Ruffo <span className="brand__title-accent">Fitness</span>
          </span>
          <span className="brand__tag">Admin</span>
        </Link>
      </div>

      <nav className="admin-nav">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`admin-nav__link${isActive(item.href) ? " admin-nav__link--active" : ""}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="admin-sidebar__footer">
        <p className="admin-sidebar__email">{email}</p>
        <form action="/api/admin/logout" method="post">
          <button type="submit" className="admin-sidebar__signout">
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
