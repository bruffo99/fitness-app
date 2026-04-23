import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin Check-Ins",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true, nocache: true }
  }
};

function renderValue(value: number | null, suffix = "") {
  return value == null ? "—" : `${value}${suffix}`;
}

export default async function AdminCheckInsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const checkIns = await prisma.checkIn.findMany({
    include: {
      user: {
        select: {
          email: true
        }
      }
    },
    orderBy: [
      { weekOf: "desc" },
      { createdAt: "desc" }
    ]
  });

  return (
    <section className="page">
      <div className="container">
        <div className="page-header">
          <div className="page-kicker">Admin check-ins</div>
          <h1>
            Weekly <span className="accent">check-ins</span>
          </h1>
          <p>Review client submissions and add coach feedback.</p>
        </div>

        <div className="admin-panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User email</th>
                  <th>Week of</th>
                  <th>Body weight</th>
                  <th>Adherence</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {checkIns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">No check-ins submitted yet.</td>
                  </tr>
                ) : (
                  checkIns.map((checkIn) => (
                    <tr key={checkIn.id}>
                      <td>{checkIn.user.email}</td>
                      <td>{formatDate(checkIn.weekOf)}</td>
                      <td>{renderValue(checkIn.bodyWeight, " lbs")}</td>
                      <td>{renderValue(checkIn.adherence, "/5")}</td>
                      <td>{formatDateTime(checkIn.createdAt)}</td>
                      <td>
                        <Link href={`/admin/checkins/${checkIn.id}`} className="table-action">
                          Review
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
          <Link href="/admin" className="button-secondary">
            Back to dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
