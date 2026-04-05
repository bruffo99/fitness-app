import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  formatDate,
  statusLabel,
  statusClass,
  type ProspectStatusValue
} from "@/lib/utils";

const STATUS_FILTERS: Array<{ value: ProspectStatusValue | "ALL"; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "NEW_LEAD", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "CLIENT_ACTIVE", label: "Active clients" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "ARCHIVED", label: "Archived" }
];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ProspectsPage(props: { searchParams: SearchParams }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const searchParams = await props.searchParams;
  const filter = typeof searchParams.status === "string" ? searchParams.status : "ALL";

  const where = filter !== "ALL" ? { status: filter as ProspectStatusValue } : {};

  const [prospects, counts] = await Promise.all([
    prisma.prospect.findMany({
      where,
      orderBy: { createdAt: "desc" }
    }),
    prisma.prospect.groupBy({
      by: ["status"],
      _count: { status: true }
    })
  ]);

  const countMap = Object.fromEntries(
    counts.map((c: (typeof counts)[number]) => [c.status, c._count.status])
  ) as Partial<Record<ProspectStatusValue, number>>;
  const total = Object.values(countMap).reduce((a, b) => a + (b ?? 0), 0);

  return (
    <section className="page">
      <div className="container">
        <div className="page-header">
          <div className="page-kicker">Admin pipeline</div>
          <h1>
            Prospect <span className="accent">pipeline</span>
          </h1>
          <p>Review, manage, and convert leads.</p>
        </div>

        <div className="filter-tabs">
          {STATUS_FILTERS.map((f) => {
            const count = f.value === "ALL" ? total : (countMap[f.value] ?? 0);
            return (
              <Link
                key={f.value}
                href={f.value === "ALL" ? "/admin/prospects" : `/admin/prospects?status=${f.value}`}
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
            <table>
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
                    <td colSpan={6} className="empty-state">No prospects match this filter.</td>
                  </tr>
                ) : (
                  prospects.map((p: (typeof prospects)[number]) => (
                    <tr key={p.id}>
                      <td>{p.firstName} {p.lastName}</td>
                      <td>{p.email}</td>
                      <td>{p.goalSummary}</td>
                      <td>
                        <span className={`badge badge--${statusClass(p.status)}`}>
                          {statusLabel(p.status)}
                        </span>
                      </td>
                      <td>{formatDate(p.createdAt)}</td>
                      <td>
                        <Link href={`/admin/prospects/${p.id}`} className="table-action">
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="inline-actions" style={{ marginTop: "1.5rem" }}>
          <Link href="/admin" className="button-secondary">Back to dashboard</Link>
        </div>
      </div>
    </section>
  );
}
