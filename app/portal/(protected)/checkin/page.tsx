import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getClientSession } from "@/lib/client-auth";
import { prisma } from "@/lib/prisma";
import { formatDate, getCurrentWeekStartUtc } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: "Weekly Check-In",
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

export default async function CheckInPage(props: { searchParams: SearchParams }) {
  const user = await getClientSession();

  if (!user) {
    redirect("/portal/login");
  }

  const searchParams = await props.searchParams;
  const weekOf = getCurrentWeekStartUtc();
  const existingCheckIn = await prisma.checkIn.findUnique({
    where: {
      userId_weekOf: {
        userId: user.id,
        weekOf
      }
    }
  });

  return (
    <section className="page">
      <div className="container">
        <div className="page-header">
          <div className="page-kicker">Client portal</div>
          <h1>
            Weekly <span className="accent">check-in</span>
          </h1>
          <p>Week of {formatDate(weekOf)}. Use this to summarize adherence, recovery, and any blockers your coach should see.</p>
        </div>

        {typeof searchParams.success === "string" ? (
          <div className="feedback" style={{ marginBottom: "1rem" }}>
            Check-in submitted successfully.
          </div>
        ) : null}

        {existingCheckIn ? (
          <div className="card">
            <div className="section__eyebrow">Submitted</div>
            <h2>
              Check-in submitted for this <span className="accent">week</span>
            </h2>
            <p>Your responses are locked in for the current week.</p>

            <div className="detail-grid" style={{ marginTop: "1.5rem" }}>
              <div className="detail-item">
                <span className="detail-label">Body weight</span>
                <strong>{renderMetric(existingCheckIn.bodyWeight, " lbs")}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label">Body fat</span>
                <strong>{renderMetric(existingCheckIn.bodyFat, "%")}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label">Energy level</span>
                <strong>{renderMetric(existingCheckIn.energyLevel, "/5")}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label">Sleep quality</span>
                <strong>{renderMetric(existingCheckIn.sleepQuality, "/5")}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label">Plan adherence</span>
                <strong>{renderMetric(existingCheckIn.adherence, "/5")}</strong>
              </div>
              <div className="detail-item">
                <span className="detail-label">Submitted</span>
                <strong>{formatDate(existingCheckIn.createdAt)}</strong>
              </div>
              <div className="detail-item detail-item--full">
                <span className="detail-label">Training notes</span>
                <p>{renderText(existingCheckIn.trainingNotes)}</p>
              </div>
              <div className="detail-item detail-item--full">
                <span className="detail-label">Nutrition notes</span>
                <p>{renderText(existingCheckIn.nutritionNotes)}</p>
              </div>
              <div className="detail-item detail-item--full">
                <span className="detail-label">Wins this week</span>
                <p>{renderText(existingCheckIn.wins)}</p>
              </div>
              <div className="detail-item detail-item--full">
                <span className="detail-label">Struggles or blockers</span>
                <p>{renderText(existingCheckIn.struggles)}</p>
              </div>
              {existingCheckIn.coachNotes?.trim() ? (
                <div className="detail-item detail-item--full">
                  <span className="detail-label">Coach notes</span>
                  <p>{existingCheckIn.coachNotes}</p>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="section__eyebrow">This week</div>
            <form action="/api/checkin" method="post" className="form">
              <div className="field-row">
                <div className="field">
                  <label htmlFor="bodyWeight">Body weight (lbs)</label>
                  <input id="bodyWeight" name="bodyWeight" type="number" min="0" step="0.1" />
                </div>
                <div className="field">
                  <label htmlFor="bodyFat">Body fat % (optional)</label>
                  <input id="bodyFat" name="bodyFat" type="number" min="0" step="0.1" />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="energyLevel">Energy level this week</label>
                  <select id="energyLevel" name="energyLevel" defaultValue="">
                    <option value="">Select a score</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="sleepQuality">Sleep quality this week</label>
                  <select id="sleepQuality" name="sleepQuality" defaultValue="">
                    <option value="">Select a score</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label htmlFor="adherence">Plan adherence this week</label>
                <select id="adherence" name="adherence" defaultValue="">
                  <option value="">Select a score</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="trainingNotes">Training notes — what went well, what was hard</label>
                <textarea id="trainingNotes" name="trainingNotes" />
              </div>

              <div className="field">
                <label htmlFor="nutritionNotes">Nutrition notes</label>
                <textarea id="nutritionNotes" name="nutritionNotes" />
              </div>

              <div className="field">
                <label htmlFor="wins">Wins this week</label>
                <textarea id="wins" name="wins" />
              </div>

              <div className="field">
                <label htmlFor="struggles">Struggles or blockers</label>
                <textarea id="struggles" name="struggles" />
              </div>

              <button type="submit" className="button">
                Submit weekly check-in
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
