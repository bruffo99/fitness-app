"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

const DEBOUNCE_MS = 300;

export function ProspectsSearchInput({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQuery);
  const [pending, startTransition] = useTransition();

  // Sync value if URL changes externally (e.g. filter tab click)
  useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  // Debounced URL update
  useEffect(() => {
    if (value === initialQuery) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      const trimmed = value.trim();
      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }
      // Reset to page 1 on new search
      params.delete("page");
      const qs = params.toString();
      const url = qs ? `/admin/prospects?${qs}` : "/admin/prospects";
      startTransition(() => {
        router.push(url as never);
      });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="prospect-search">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by name, email, or goal…"
        className="prospect-search__input"
        aria-label="Search prospects"
      />
      {pending && <span className="prospect-search__indicator">searching…</span>}
    </div>
  );
}
