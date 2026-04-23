import { redirect } from "next/navigation";
import { GymPhotoClient } from "@/app/portal/(protected)/gym/GymPhotoClient";
import { getClientSession } from "@/lib/client-auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWeekStartUtc } from "@/lib/utils";

export default async function PortalGymPage() {
  const user = await getClientSession();

  if (!user) {
    redirect("/portal/login");
  }

  const weekStart = getCurrentWeekStartUtc();
  const photos = await prisma.gymPhoto.findMany({
    where: {
      userId: user.id,
      createdAt: {
        gte: weekStart,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      filePath: true,
      note: true,
      createdAt: true,
    },
  });

  return (
    <section className="page">
      <div className="container" style={{ maxWidth: "920px" }}>
        <div className="page-header">
          <div className="page-kicker">Gym check-ins</div>
          <h1>
            Upload gym <span className="accent">proof</span>
          </h1>
          <p>
            Share your gym check-ins from your phone. Photos uploaded since Monday midnight UTC count toward this week.
          </p>
        </div>

        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div className="section__eyebrow">This week</div>
          <h2>
            {photos.length} {photos.length === 1 ? "photo" : "photos"} this week
          </h2>
        </div>

        <GymPhotoClient
          initialPhotos={photos.map((photo) => ({
            ...photo,
            filePath: `/api/gym-photos/file/${photo.id}`,
            createdAt: photo.createdAt.toISOString(),
          }))}
        />
      </div>
    </section>
  );
}
