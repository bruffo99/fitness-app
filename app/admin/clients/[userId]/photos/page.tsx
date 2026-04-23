import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { getGymPhotoWeekLabel } from "@/lib/gym-photos";
import { prisma } from "@/lib/prisma";
import { formatDateTime, getCurrentWeekStartUtc } from "@/lib/utils";

type PhotoWeekGroup = {
  key: string;
  weekStart: Date;
  photos: {
    id: string;
    filePath: string;
    note: string | null;
    createdAt: Date;
  }[];
};

function getWeekKey(value: Date) {
  return getCurrentWeekStartUtc(value).toISOString();
}

export default async function AdminClientPhotosPage(props: {
  params: Promise<{ userId: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { userId } = await props.params;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      clientProfile: {
        select: {
          requiredSessionsPerWeek: true,
        },
      },
      gymPhotos: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          filePath: true,
          note: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user || user.role !== "CLIENT") {
    redirect("/admin/prospects");
  }

  const clientName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email;
  const groupedPhotos = user.gymPhotos.reduce<PhotoWeekGroup[]>((groups, photo) => {
    const weekStart = getCurrentWeekStartUtc(photo.createdAt);
    const key = getWeekKey(photo.createdAt);
    const existing = groups.find((group) => group.key === key);

    if (existing) {
      existing.photos.push(photo);
      return groups;
    }

    groups.push({
      key,
      weekStart,
      photos: [photo],
    });

    return groups;
  }, []);

  return (
    <section className="page">
      <div className="container" style={{ maxWidth: "1040px" }}>
        <div className="page-header">
          <div className="page-kicker">Client gym photos</div>
          <h1>
            {clientName} <span className="accent">check-ins</span>
          </h1>
          <p>Review uploaded gym proof, weekly volume, and the target number of sessions for this client.</p>
        </div>

        <div className="inline-actions" style={{ marginBottom: "1.5rem" }}>
          <Link href={`/admin/clients/${userId}/documents`} className="button-secondary">
            Back to documents
          </Link>
          <Link href="/admin/prospects" className="button-secondary">
            Back to pipeline
          </Link>
        </div>

        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div className="section__eyebrow">Required sessions</div>
          <form
            action={`/api/admin/clients/${userId}/required-sessions`}
            method="post"
            className="form form--inline"
          >
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="requiredSessionsPerWeek">Sessions per week target</label>
              <input
                id="requiredSessionsPerWeek"
                name="requiredSessionsPerWeek"
                type="number"
                min={1}
                step={1}
                defaultValue={user.clientProfile?.requiredSessionsPerWeek ?? 3}
                required
              />
            </div>
            <button type="submit" className="button form--inline__submit">
              Save target
            </button>
          </form>
        </div>

        <div className="stack">
          {groupedPhotos.length === 0 ? (
            <div className="card">
              <div className="section__eyebrow">Uploads</div>
              <p className="empty-state">No gym photos uploaded yet.</p>
            </div>
          ) : (
            groupedPhotos.map((group) => (
              <section key={group.key} className="card">
                <div className="section__eyebrow">Week of {getGymPhotoWeekLabel(group.weekStart)}</div>
                <h2>
                  {group.photos.length} {group.photos.length === 1 ? "photo" : "photos"}
                </h2>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "1rem",
                    marginTop: "1rem",
                  }}
                >
                  {group.photos.map((photo) => (
                    <article key={photo.id} className="card" style={{ padding: "1rem" }}>
                      <div
                        style={{
                          aspectRatio: "4 / 3",
                          overflow: "hidden",
                          borderRadius: "16px",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <img
                          src={photo.filePath}
                          alt={photo.note ? `Gym photo: ${photo.note}` : "Gym photo"}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      </div>
                      <div className="stack" style={{ gap: "0.5rem" }}>
                        <div>
                          <div className="section__eyebrow">Captured</div>
                          <p>{formatDateTime(photo.createdAt)}</p>
                        </div>
                        <div>
                          <div className="section__eyebrow">Note</div>
                          <p>{photo.note || "No note added."}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
