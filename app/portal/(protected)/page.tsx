import { getClientSession } from "@/lib/client-auth";
import { onboardingStatusLabel } from "@/lib/onboarding";
import { prisma } from "@/lib/prisma";
import { formatDate, getCurrentWeekStartUtc } from "@/lib/utils";
import Link from "next/link";

export default async function PortalDashboardPage() {
  const user = await getClientSession();

  if (!user) {
    return null;
  }

  const profile = await prisma.clientProfile.findUnique({
    where: {
      userId: user.id
    },
    include: {
      targets: {
        where: {
          isActive: true
        },
        orderBy: [
          { targetDate: "asc" },
          { createdAt: "asc" }
        ]
      }
    }
  });

  const welcomeName = user.firstName?.trim() || user.email;
  const onboardingStatus = profile?.onboardingStatus ?? "draft";
  const isActive = onboardingStatus === "active";
  const weekStart = getCurrentWeekStartUtc();
  const gymPhotoCountThisWeek = await prisma.gymPhoto.count({
    where: {
      userId: user.id,
      createdAt: {
        gte: weekStart
      }
    }
  });

  return (
    <section className="page">
      <div className="container">
        <div className="page-header">
          <div className="page-kicker">Client dashboard</div>
          <h1>
            Welcome back, <span className="accent">{welcomeName}</span>
          </h1>
          <p>Your portal will keep your coaching details, milestones, and upcoming workflow in one place.</p>
        </div>

        {!profile ? (
          <div className="card">
            <div className="section__eyebrow">Profile status</div>
            <p>Your coach is setting up your profile. Check back soon.</p>
          </div>
        ) : isActive ? (
          <div className="dashboard-grid">
            <div className="card">
              <div className="section__eyebrow">Profile</div>
              <div className="stack">
                <div>
                  <p className="muted">Onboarding status</p>
                  <strong>{onboardingStatusLabel(profile.onboardingStatus)}</strong>
                </div>
                <div>
                  <p className="muted">Training history</p>
                  <p>{profile.trainingHistory || "No training history added yet."}</p>
                </div>
                <div>
                  <p className="muted">Nutrition notes</p>
                  <p>{profile.nutritionNotes || "No nutrition notes added yet."}</p>
                </div>
                <div>
                  <p className="muted">Injury notes</p>
                  <p>{profile.injuryNotes || "No injury notes added yet."}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="section__eyebrow">Active targets</div>
              {profile.targets.length === 0 ? (
                <p className="empty-state">No active targets have been assigned yet.</p>
              ) : (
                <div className="stack">
                  {profile.targets.map((target) => (
                    <div key={target.id} className="stat">
                      <strong>{target.label}</strong>
                      <span>{target.type}</span>
                      <p className="muted">
                        {target.targetValue ? `Target: ${target.targetValue}` : "Target value coming soon."}
                      </p>
                      <p className="muted">
                        {target.targetDate ? `Target date: ${formatDate(target.targetDate)}` : "No target date set."}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : onboardingStatus === "intake_sent" ? (
          <div className="card">
            <div className="section__eyebrow">Action required</div>
            <h2>Complete your onboarding intake</h2>
            <p>Your coach is waiting on your intake before your account can be activated.</p>
            <div className="inline-actions" style={{ marginTop: "1rem" }}>
              <Link href="/portal/onboarding" className="button">
                Complete your onboarding intake →
              </Link>
            </div>
          </div>
        ) : onboardingStatus === "intake_complete" ? (
          <div className="card">
            <div className="section__eyebrow">Submitted</div>
            <p>Onboarding submitted — your coach will review and activate your account soon.</p>
          </div>
        ) : (
          <div className="card">
            <div className="section__eyebrow">Profile status</div>
            <p>Your coach is setting up your profile. Check back soon.</p>
          </div>
        )}

        {isActive ? (
          <div className="grid-2" style={{ marginTop: "1.5rem" }}>
            <div className="card">
              <div className="section__eyebrow">Weekly check-in</div>
              <h2>Weekly Check-in <span className="accent">ready</span></h2>
              <p>Your weekly reflection, progress review, and coach feedback flow is live in the portal.</p>
              <Link href="/portal/checkin" className="button" style={{ marginTop: "1rem" }}>
                Submit this week check-in →
              </Link>
            </div>
            <div className="card">
              <div className="section__eyebrow">Your plan</div>
              <h2>Your Plan <span className="accent">ready</span></h2>
              <p>Training structure, nutrition direction, and implementation details are now available in your portal.</p>
              <Link href="/portal/plan" className="button" style={{ marginTop: "1rem" }}>
                View your program
              </Link>
            </div>
            <div className="card">
              <div className="section__eyebrow">Gym check-ins</div>
              <h2>Gym Check-ins <span className="accent">live</span></h2>
              <p>
                {gymPhotoCountThisWeek} {gymPhotoCountThisWeek === 1 ? "photo" : "photos"} uploaded this week.
              </p>
              <Link href="/portal/gym" className="button" style={{ marginTop: "1rem" }}>
                Upload gym photo
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
