import Link from "next/link";
import type { Metadata } from "next";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Breadcrumb } from "@/app/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Check-In Detail",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true, nocache: true }
  }
};

function renderMetric(value: number | null | undefined, suffix = "") {
  return value == null ? "Not provided" : `${value}${suffix}`;
}

function renderText(value: string | null | undefined) {
  return value?.trim() || "No response provided.";
}

function getNextWeekStart(value: Date) {
  const nextWeek = new Date(value);
  nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);
  return nextWeek;
}

export default async function AdminCheckInDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { id } = await props.params;
  const checkIn = await prisma.checkIn.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true
        }
      }
    }
  });

  if (!checkIn) {
    redirect("/admin/checkins");
  }

  const gymPhotos = await prisma.gymPhoto.findMany({
    where: {
      userId: checkIn.userId,
      createdAt: {
        gte: checkIn.weekOf,
        lt: getNextWeekStart(checkIn.weekOf),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      note: true,
      createdAt: true,
    },
  });

  return (
    <section className="page">
      <div className="container">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin" },
            { label: "Check-ins", href: "/admin/checkins" },
            { label: checkIn.user.email },
          ]}
        />
        <div className="page-header">
          <div className="page-kicker">Admin check-in</div>
          <h1>
            Client <span className="accent">check-in</span>
          </h1>
          <p>{checkIn.user.email} · Week of {formatDate(checkIn.weekOf)}</p>
        </div>

        <div className="admin-panel" style={{ marginBottom: "1.5rem" }}>
          <div className="section__eyebrow">Submission details</div>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">User email</span>
              <strong>{checkIn.user.email}</strong>
            </div>
            <div className="detail-item">
              <span className="detail-label">Week of</span>
              <strong>{formatDate(checkIn.weekOf)}</strong>
            </div>
            <div className="detail-item">
              <span className="detail-label">Body weight</span>
              <strong>{renderMetric(checkIn.bodyWeight, " lbs")}</strong>
            </div>
            <div className="detail-item">
              <span className="detail-label">Body fat</span>
              <strong>{renderMetric(checkIn.bodyFat, "%")}</strong>
            </div>
            <div className="detail-item">
              <span className="detail-label">Energy level</span>
              <strong>{renderMetric(checkIn.energyLevel, "/5")}</strong>
            </div>
            <div className="detail-item">
              <span className="detail-label">Sleep quality</span>
              <strong>{renderMetric(checkIn.sleepQuality, "/5")}</strong>
            </div>
            <div className="detail-item">
              <span className="detail-label">Plan adherence</span>
              <strong>{renderMetric(checkIn.adherence, "/5")}</strong>
            </div>
            <div className="detail-item">
              <span className="detail-label">Submitted</span>
              <strong>{formatDateTime(checkIn.createdAt)}</strong>
            </div>
            <div className="detail-item detail-item--full">
              <span className="detail-label">Training notes</span>
              <p>{renderText(checkIn.trainingNotes)}</p>
            </div>
            <div className="detail-item detail-item--full">
              <span className="detail-label">Nutrition notes</span>
              <p>{renderText(checkIn.nutritionNotes)}</p>
            </div>
            <div className="detail-item detail-item--full">
              <span className="detail-label">Wins this week</span>
              <p>{renderText(checkIn.wins)}</p>
            </div>
            <div className="detail-item detail-item--full">
              <span className="detail-label">Struggles or blockers</span>
              <p>{renderText(checkIn.struggles)}</p>
            </div>
            <div className="detail-item">
              <span className="detail-label">Created</span>
              <strong>{formatDateTime(checkIn.createdAt)}</strong>
            </div>
            <div className="detail-item">
              <span className="detail-label">Updated</span>
              <strong>{formatDateTime(checkIn.updatedAt)}</strong>
            </div>
          </div>
        </div>

        <div className="admin-panel" style={{ marginBottom: "1.5rem" }}>
          <div className="checkin-proof-header">
            <div>
              <div className="section__eyebrow">Gym proof for this week</div>
              <p className="muted">
                {gymPhotos.length} {gymPhotos.length === 1 ? "photo" : "photos"} uploaded for week of {formatDate(checkIn.weekOf)}.
              </p>
            </div>
            <Link
              href={`/admin/clients/${checkIn.user.id}/photos` as Route}
              className="button-secondary"
            >
              View full photo history
            </Link>
          </div>

          {gymPhotos.length === 0 ? (
            <p className="empty-state">No gym photos were uploaded for this check-in week.</p>
          ) : (
            <div className="checkin-proof-grid">
              {gymPhotos.map((photo) => (
                <a
                  key={photo.id}
                  href={`/api/gym-photos/file/${photo.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="checkin-proof-card"
                >
                  <span className="checkin-proof-card__image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/gym-photos/file/${photo.id}`}
                      alt={photo.note ? `Gym proof: ${photo.note}` : "Gym proof photo"}
                    />
                  </span>
                  <span className="checkin-proof-card__meta">
                    <strong>{formatDateTime(photo.createdAt)}</strong>
                    <span>{photo.note || "No note added."}</span>
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="admin-panel">
          <div className="section__eyebrow">Coach feedback</div>
          <form action={`/api/admin/checkins/${checkIn.id}`} method="post" className="form">
            <div className="field">
              <label htmlFor="coachNotes">Coach notes</label>
              <textarea id="coachNotes" name="coachNotes" defaultValue={checkIn.coachNotes ?? ""} />
            </div>
            <button type="submit" className="button">
              Save coach notes
            </button>
          </form>
        </div>

        <div className="inline-actions" style={{ marginTop: "1.5rem" }}>
          <Link href="/admin/checkins" className="button-secondary">
            Back to check-ins
          </Link>
        </div>
      </div>
    </section>
  );
}
