import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getClientSession } from "@/lib/client-auth";
import { canAccessOnboardingForm } from "@/lib/onboarding";
import { prisma } from "@/lib/prisma";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: "Onboarding",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true, nocache: true }
  }
};

export default async function OnboardingPage(props: { searchParams: SearchParams }) {
  const user = await getClientSession();

  if (!user) {
    redirect("/portal/login");
  }

  const searchParams = await props.searchParams;
  const profile = await prisma.clientProfile.findUnique({
    where: { userId: user.id },
  });

  const onboardingStatus = profile?.onboardingStatus ?? "draft";

  return (
    <section className="page">
      <div className="container" style={{ maxWidth: "920px" }}>
        <div className="page-header">
          <div className="page-kicker">Client portal</div>
          <h1>
            Onboarding <span className="accent">intake</span>
          </h1>
          <p>Complete your intake so your coach can review your background and build your plan around what matters right now.</p>
        </div>

        {typeof searchParams.complete === "string" ? (
          <div className="feedback" style={{ marginBottom: "1rem" }}>
            Onboarding intake submitted successfully.
          </div>
        ) : null}

        {onboardingStatus === "active" ? (
          <div className="card">
            <div className="section__eyebrow">Complete</div>
            <h2>You are all set!</h2>
            <p>Your coach will be in touch.</p>
            <div className="inline-actions" style={{ marginTop: "1rem" }}>
              <Link href="/portal" className="button">
                Back to dashboard
              </Link>
            </div>
          </div>
        ) : !canAccessOnboardingForm(onboardingStatus) ? (
          <div className="card">
            <div className="section__eyebrow">Status</div>
            <p>Your onboarding link is not ready yet. Check back soon.</p>
          </div>
        ) : (
          <div className="card">
            <div className="section__eyebrow">Client intake</div>
            <form action="/api/onboarding" method="post" className="form">
              <div className="field">
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  defaultValue={profile?.fullName ?? ""}
                />
              </div>

              <div className="field">
                <label htmlFor="trainingHistory">
                  Training background — how long have you been training, what have you tried?
                </label>
                <textarea
                  id="trainingHistory"
                  name="trainingHistory"
                  defaultValue={profile?.trainingHistory ?? ""}
                />
              </div>

              <div className="field">
                <label htmlFor="nutritionNotes">
                  Current nutrition approach — what does your diet look like right now?
                </label>
                <textarea
                  id="nutritionNotes"
                  name="nutritionNotes"
                  defaultValue={profile?.nutritionNotes ?? ""}
                />
              </div>

              <div className="field">
                <label htmlFor="injuryNotes">
                  Injuries or limitations — anything Ruffo needs to know before programming?
                </label>
                <textarea
                  id="injuryNotes"
                  name="injuryNotes"
                  defaultValue={profile?.injuryNotes ?? ""}
                />
              </div>

              <div className="field">
                <label htmlFor="primaryGoal">
                  Primary goal — what does success look like in 90 days?
                </label>
                <textarea id="primaryGoal" name="primaryGoal" />
              </div>

              <div className="field">
                <label htmlFor="motivation">
                  Why now — what made you commit to this?
                </label>
                <textarea id="motivation" name="motivation" />
              </div>

              <button type="submit" className="button">
                {onboardingStatus === "intake_complete" ? "Update onboarding intake" : "Submit onboarding intake"}
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
