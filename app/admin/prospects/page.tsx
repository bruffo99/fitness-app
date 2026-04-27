import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, type ProspectStatusValue } from "@/lib/utils";
import { StatusBadge } from "@/app/components/StatusBadge";
import { ProspectsSearchInput } from "@/app/components/ProspectsSearchInput";

const PAGE_SIZE = 25;

const STATUS_FILTERS: Array<{ value: ProspectStatusValue | "ALL"; label: string }> = [
  { value: "ALL",           label: "All" },
  { value: "NEW_LEAD",      label: "New" },
  { value: "CONTACTED",     label: "Contacted" },
  { value: "QUALIFIED",     label: "Qualified" },
  { value: "CLIENT_ACTIVE", label: "Active clients" },
  { value: "INACTIVE",      label: "Inactive" },
  { value: "ARCHIVED",      label: "Archived" },
];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getStringParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string
): string {
  const value = searchParams[key];
  return typeof value === "string" ? value : "";
}

export default async function ProspectsPage(props: { searchParams: SearchParams }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const searchParams = await props.searchParams;
  const filter = getStringParam(searchParams, "status") || "ALL";
  const query  = getStringParam(searchParams, "q").trim();
  const page   = Math.max(1, parseInt(getStringParam(searchParams, "page") || "1", 10) || 1);

  const where: {
    status?: ProspectStatusValue;
    OR?: Array<Record<string, { contains: string; mode?: "insensitive" }>>;
  } = {};

  if (filter !== "ALL") {
    where.status = filter as ProspectStatusValue;
  }

  if (query) {
    // SQLite Prisma — no 'mode: insensitive', but Prisma normalizes simple contains
    where.OR = [
      { firstName:   { contains: query } },
      { lastName:    { contains: query } },
      { email:       { contains: query } },
      { goalSummary: { contains: query } },
    ];
  }

  const [prospects, total, counts] = await Promise.all([
    prisma.prospect.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.prospect.count({ where }),
    prisma.prospect.groupBy({ by: ["status"], _count: { status: true } }),
  ]);

  const countMap = Object.fromEntries(
    counts.map((c) => [c.status, c._count.status])
  ) as Partial<Record<ProspectStatusValue, number>>;
  const grandTotal = Object.values(countMap).reduce((a, b) => a + (b ?? 0), 0);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Build href that preserves status + query
  function buildPageHref(p: number): Route {
    const params = new URLSearchParams();
    if (filter !== "ALL") params.set("status", filter);
    if (query) params.set("q", query);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return (qs ? `/admin/prospects?${qs}` : "/admin/prospects") as Route;
  }

  function buildFilterHref(value: ProspectStatusValue | "ALL"): Route {
    const params = new URLSearchParams();
    if (value !== "ALL") params.set("status", value);
    if (query) params.set("q", query);
    const qs = params.toString();
    return (qs ? `/admin/prospects?${qs}` : "/admin/prospects") as Route;
  }

  return (
    <section className="page">
      <div className="container">
        <div className="page-header">
          <div className="page-kicker">Admin pipeline</div>
          <h1>
            Prospect <span className="accent">pipeline</span>
          </h1>
          <p>Review, manage, and convert leads.</p>
          <div className="inline-actions" style={{ marginTop: "1rem" }}>
            <Link href="/admin/prospects/new" className="button">
              + Add prospect
            </Link>
          </div>
        </div>

        <ProspectsSearchInput initialQuery={query} />

        <div className="filter-tabs">
          {STATUS_FILTERS.map((f) => {
            const count = f.value === "ALL" ? grandTotal : (countMap[f.value] ?? 0);
            return (
              <Link
                key={f.value}
                href={buildFilterHref(f.value)}
                className={`filter-tab${filter === f.value ? " filter-tab--active" : ""}`}
              >
                {f.label}
                {count > 0 && <span className="filter-tab__count">{count}</span>}
              </Link>
            );
          })}
        </div>

        <div className="admin-panel" style={{ marginTop: "1rem" }}>
          <div className="table-wrap">
            <table className="prospect-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Goal</th>
                  <th>Status</th>
                  <th>Added</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {prospects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      {query
                        ? `No prospects match "${query}".`
                        : "No prospects match this filter."}
                    </td>
                  </tr>
                ) : (
                  prospects.map((p) => (
                    <tr key={p.id} className="prospect-row">
                      <td>
                        <Link
                          href={`/admin/prospects/${p.id}`}
                          className="prospect-row__link"
                        >
                          {p.firstName} {p.lastName}
                        </Link>
                      </td>
                      <td>{p.email}</td>
                      <td className="prospect-row__goal">{p.goalSummary}</td>
                      <td>
                        <StatusBadge status={p.status} />
                      </td>
                      <td>{formatDate(p.createdAt)}</td>
                      <td>
                        <Link
                          href={`/admin/prospects/${p.id}`}
                          className="table-action"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              {page > 1 ? (
                <Link href={buildPageHref(page - 1)} className="button-secondary">
                  ← Previous
                </Link>
              ) : (
                <span className="button-secondary button-secondary--disabled">
                  ← Previous
                </span>
              )}
              <span className="pagination__info">
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link href={buildPageHref(page + 1)} className="button-secondary">
                  Next →
                </Link>
              ) : (
                <span className="button-secondary button-secondary--disabled">
                  Next →
                </span>
              )}
            </div>
          )}
        </div>

        <div className="inline-actions" style={{ marginTop: "1.5rem" }}>
          <Link href="/admin" className="button-secondary">
            Back to dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
