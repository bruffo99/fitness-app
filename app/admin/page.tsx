import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/app/components/StatusBadge";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: {
    index: false, follow: false, nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true, nocache: true },
  },
};

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const now = new Date();
  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );

  const [prospectCount, clientCount, followUpCount, recentProspects] =
    await Promise.all([
      prisma.prospect.count(),
      prisma.clientProfile.count(),
      prisma.prospect.count({
        where: {
          followUpDate: {
            not: null,
            lte: endOfToday,
          },
        },
      }),
      prisma.prospect.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    ]);

  return (
    <section className="page">
      <div className="container">
        <div className="page-header">
          <div className="page-kicker">Admin dashboard</div>
          <h1>Prospect <span className="accent">overview</span></h1>
          <p>Signed in as {session.email}.</p>
        </div>

        <div className="admin-summary">
          <div className="metric-card">
            <strong>{prospectCount}</strong>
            <span>Total prospects</span>
          </div>
          <div className="metric-card">
            <strong>{followUpCount}</strong>
            <span>Follow-ups due</span>
          </div>
          <div className="metric-card">
            <strong>{clientCount}</strong>
            <span>Active clients</span>
          </div>
        </div>

        <div className="inline-actions" style={{ marginTop: "1.5rem" }}>
          <Link href="/admin/prospects" className="button">
            Manage prospect pipeline
          </Link>
          <Link href="/admin/followups" className="button-secondary">
            Follow-up queue
            {followUpCount > 0 ? (
              <span className="badge badge--qualified">{followUpCount}</span>
            ) : null}
          </Link>
          <Link href="/admin/checkins" className="button-secondary">
            Review client check-ins
          </Link>
        </div>

        <div className="admin-panel" style={{ marginTop: "1.5rem" }}>
          <div className="section__eyebrow">Recent leads</div>
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
                {recentProspects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">No leads yet.</td>
                  </tr>
                ) : (
                  recentProspects.map((p) => (
                    <tr key={p.id}>
                      <td>{p.firstName} {p.lastName}</td>
                      <td>{p.email}</td>
                      <td>{p.goalSummary}</td>
                      <td><StatusBadge status={p.status} /></td>
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
      </div>
    </section>
  );
}
