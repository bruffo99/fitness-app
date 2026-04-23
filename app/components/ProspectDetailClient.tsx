"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState, useTransition } from "react";
import { StatusBadge } from "@/app/components/StatusBadge";
import { useToast } from "@/app/components/Toast";
import { onboardingStatusLabel } from "@/lib/onboarding";
import {
  formatDate,
  formatDateTime,
  statusLabel,
  type ProspectStatusValue,
} from "@/lib/utils";

const ALL_STATUSES: ProspectStatusValue[] = [
  "NEW_LEAD",
  "CONTACTED",
  "QUALIFIED",
  "CLIENT_ACTIVE",
  "INACTIVE",
  "ARCHIVED",
];

type ProspectNote = {
  id: string;
  body: string;
  createdAt: string;
};

export type ProspectDetailDTO = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  goalSummary: string;
  goalType: string | null;
  fitnessLevel: string | null;
  timeline: string | null;
  injuries: string | null;
  preferredContact: string | null;
  referralSource: string | null;
  message: string | null;
  followUpDate: string | null;
  status: ProspectStatusValue;
  createdAt: string;
  clientUserId: string | null;
  onboardingStatus: string | null;
  onboardingStatusLabel: string;
  documentsHref: string | null;
  photosHref: string | null;
  notes: ProspectNote[];
};

const GOAL_TYPE_LABELS: Record<string, string> = {
  fat_loss: "Fat loss",
  muscle_gain: "Muscle gain",
  body_recomp: "Body recomposition",
  performance: "Athletic performance",
  general_health: "General health & fitness",
};

const FITNESS_LEVEL_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const TIMELINE_LABELS: Record<string, string> = {
  asap: "As soon as possible",
  "1_3_months": "Within 1–3 months",
  "3_6_months": "3–6 months out",
  "6_plus_months": "Just exploring for now",
};

const REFERRAL_LABELS: Record<string, string> = {
  referral: "Friend or family referral",
  instagram: "Instagram",
  facebook: "Facebook",
  google: "Google search",
  youtube: "YouTube",
  podcast: "Podcast",
  other: "Other",
};

export function ProspectDetailClient({ initial }: { initial: ProspectDetailDTO }) {
  const [prospect, setProspect] = useState<ProspectDetailDTO>(initial);
  const [statusDraft, setStatusDraft] = useState<ProspectStatusValue>(initial.status);
  const [noteDraft, setNoteDraft] = useState("");
  const [followUpDraft, setFollowUpDraft] = useState(
    initial.followUpDate ? initial.followUpDate.split("T")[0] : ""
  );
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();

  useEffect(() => {
    setFollowUpDraft(prospect.followUpDate ? prospect.followUpDate.split("T")[0] : "");
  }, [prospect.followUpDate]);

  async function postAction(body: unknown) {
    const res = await fetch(`/api/admin/prospects/${prospect.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? `HTTP ${res.status}`);
    }
    return res.json();
  }

  function handleStatusUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (statusDraft === prospect.status) {
      showToast("Status unchanged", "info");
      return;
    }
    const previous = prospect;
    // Optimistic update
    setProspect({ ...prospect, status: statusDraft });
    startTransition(async () => {
      try {
        const data = await postAction({ action: "update_status", status: statusDraft });
        if (data.prospect) setProspect(serializeProspect(data.prospect));
        showToast(`Status updated to ${statusLabel(statusDraft)}`);
      } catch (err) {
        setProspect(previous);
        setStatusDraft(previous.status);
        showToast(`Failed to update status: ${(err as Error).message}`, "error");
      }
    });
  }

  function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = noteDraft.trim();
    if (!trimmed) return;

    const previous = prospect;
    const tempId = `temp-${Math.random().toString(36).slice(2)}`;
    setProspect({
      ...prospect,
      notes: [
        { id: tempId, body: trimmed, createdAt: new Date().toISOString() },
        ...prospect.notes,
      ],
    });
    setNoteDraft("");

    startTransition(async () => {
      try {
        const data = await postAction({ action: "add_note", note: trimmed });
        if (data.note) {
          setProspect((p) => ({
            ...p,
            notes: [
              { id: data.note.id, body: data.note.body, createdAt: data.note.createdAt },
              ...p.notes.filter((n) => n.id !== tempId),
            ],
          }));
        }
        showToast("Note added");
      } catch (err) {
        setProspect(previous);
        setNoteDraft(trimmed);
        showToast(`Failed to add note: ${(err as Error).message}`, "error");
      }
    });
  }

  function handleDeleteNote(noteId: string) {
    const previous = prospect;
    setProspect({ ...prospect, notes: prospect.notes.filter((n) => n.id !== noteId) });
    startTransition(async () => {
      try {
        await postAction({ action: "delete_note", noteId });
        showToast("Note deleted");
      } catch (err) {
        setProspect(previous);
        showToast(`Failed to delete note: ${(err as Error).message}`, "error");
      }
    });
  }

  async function handleConvert() {
    if (!confirm(`Convert ${prospect.firstName} ${prospect.lastName} to a client?`)) return;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/prospects/${prospect.id}/convert`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
        if (data.prospect) {
          setProspect(serializeProspect(data.prospect));
          setStatusDraft("CLIENT_ACTIVE");
        }
        showToast(`${prospect.firstName} converted to client`);
      } catch (err) {
        const message = (err as Error).message;
        showToast(
          message === "already_converted"
            ? "This prospect is already an active client."
            : `Failed to convert: ${message}`,
          "error"
        );
      }
    });
  }

  return (
    <section className="page">
      <div className="container" style={{ maxWidth: "920px" }}>
        <div className="page-header">
          <div className="page-kicker">Prospect detail</div>
          <h1>
            {prospect.firstName} {prospect.lastName}
          </h1>
          <div className="page-meta">
            <StatusBadge status={prospect.status} />
          </div>
        </div>

        {/* Lead info */}
        <div className="admin-panel" style={{ marginBottom: "1.25rem" }}>
          <div className="section__eyebrow">Lead info</div>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Email</span>
              <span>{prospect.email}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Phone</span>
              <span>{prospect.phone ?? "—"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Goal type</span>
              <span>{prospect.goalType ? (GOAL_TYPE_LABELS[prospect.goalType] ?? prospect.goalType) : "—"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Fitness level</span>
              <span>{prospect.fitnessLevel ? (FITNESS_LEVEL_LABELS[prospect.fitnessLevel] ?? prospect.fitnessLevel) : "—"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Timeline</span>
              <span>{prospect.timeline ? (TIMELINE_LABELS[prospect.timeline] ?? prospect.timeline) : "—"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Preferred contact</span>
              <span>{prospect.preferredContact ?? "—"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Heard about us via</span>
              <span>{prospect.referralSource ? (REFERRAL_LABELS[prospect.referralSource] ?? prospect.referralSource) : "—"}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Submitted</span>
              <span>{formatDate(new Date(prospect.createdAt))}</span>
            </div>
            <div className="detail-item detail-item--full">
              <span className="detail-label">Primary goal</span>
              <span>{prospect.goalSummary}</span>
            </div>
            {prospect.injuries && (
              <div className="detail-item detail-item--full">
                <span className="detail-label">Injuries / limitations</span>
                <span style={{ whiteSpace: "pre-wrap" }}>{prospect.injuries}</span>
              </div>
            )}
            {prospect.message && (
              <div className="detail-item detail-item--full">
                <span className="detail-label">Message</span>
                <span style={{ whiteSpace: "pre-wrap" }}>{prospect.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="admin-panel" style={{ marginBottom: "1.25rem" }}>
          <div className="section__eyebrow">Status</div>
          <form onSubmit={handleStatusUpdate} className="form form--inline">
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="status">Pipeline status</label>
              <select
                id="status"
                name="status"
                value={statusDraft}
                onChange={(e) => setStatusDraft(e.target.value as ProspectStatusValue)}
                disabled={pending}
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel(s)}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="button form--inline__submit"
              disabled={pending || statusDraft === prospect.status}
            >
              {pending ? "Saving…" : "Update status"}
            </button>
          </form>
        </div>

        {/* Follow-up date */}
        <div className="admin-panel" style={{ marginBottom: "1.25rem" }}>
          <div className="section__eyebrow">Set follow-up date</div>
          <form
            action={`/api/admin/prospects/${prospect.id}/followup`}
            method="post"
            className="form form--inline"
          >
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="followUpDate">
                {prospect.followUpDate
                  ? `Set for ${formatDate(new Date(prospect.followUpDate))}`
                  : "No follow-up date set"}
              </label>
              <input
                id="followUpDate"
                name="date"
                type="date"
                value={followUpDraft}
                onChange={(e) => setFollowUpDraft(e.target.value)}
                disabled={pending}
              />
            </div>
            <button
              type="submit"
              className="button form--inline__submit"
              disabled={pending || !followUpDraft}
            >
              Set date
            </button>
          </form>
          {prospect.followUpDate ? (
            <form
              action={`/api/admin/prospects/${prospect.id}/followup`}
              method="post"
              className="inline-actions"
            >
              <input type="hidden" name="date" value="" />
              <button type="submit" className="button-secondary">
                Clear
              </button>
            </form>
          ) : null}
        </div>

        {/* Notes */}
        <div className="admin-panel" style={{ marginBottom: "1.25rem" }}>
          <div className="section__eyebrow">Coach notes</div>
          <form onSubmit={handleAddNote} className="form">
            <div className="field">
              <label htmlFor="note">Add note</label>
              <textarea
                id="note"
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Follow-up reminders, observations, next steps…"
                disabled={pending}
              />
            </div>
            <div className="inline-actions">
              <button
                type="submit"
                className="button"
                disabled={pending || !noteDraft.trim()}
              >
                {pending ? "Saving…" : "Save note"}
              </button>
            </div>
          </form>
          <div className="note-history">
            {prospect.notes.length === 0 ? (
              <p className="muted note-history__empty">No saved notes yet.</p>
            ) : (
              <div className="note-history__list">
                {prospect.notes.map((note) => (
                  <article key={note.id} className="note-history__item">
                    <div className="note-history__header">
                      <time
                        className="note-history__timestamp"
                        dateTime={note.createdAt}
                      >
                        {formatDateTime(new Date(note.createdAt))}
                      </time>
                      <button
                        type="button"
                        className="button-secondary note-history__delete"
                        onClick={() => handleDeleteNote(note.id)}
                        disabled={pending}
                      >
                        Delete
                      </button>
                    </div>
                    <p className="note-history__body">{note.body}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Convert */}
        {prospect.status !== "CLIENT_ACTIVE" && (
          <div className="admin-panel" style={{ marginBottom: "1.25rem" }}>
            <div className="section__eyebrow">Convert to client</div>
            <p className="muted">
              Creates or updates the account for {prospect.email}, builds the client
              profile, adds the current goal as a starter target, and marks this lead
              as active.
            </p>
            <button
              type="button"
              onClick={handleConvert}
              className="button"
              disabled={pending}
            >
              {pending ? "Converting…" : "Convert to client"}
            </button>
          </div>
        )}

        {prospect.status === "CLIENT_ACTIVE" && (
          <div className="admin-panel" style={{ marginBottom: "1.25rem" }}>
            <div className="section__eyebrow">Onboarding</div>
            <div className="stack">
              <div>
                <p className="muted">Current status</p>
                <strong>{prospect.onboardingStatusLabel}</strong>
              </div>

              {prospect.clientUserId ? (
                <div className="inline-actions">
                  <form
                    action={`/api/admin/onboarding/${prospect.clientUserId}/send`}
                    method="post"
                  >
                    <button
                      type="submit"
                      className="button"
                      disabled={pending || prospect.onboardingStatus === "active"}
                    >
                      Send Onboarding Intake
                    </button>
                  </form>

                  {prospect.onboardingStatus === "intake_complete" ? (
                    <form
                      action={`/api/admin/onboarding/${prospect.clientUserId}/activate`}
                      method="post"
                    >
                      <button type="submit" className="button-secondary" disabled={pending}>
                        Activate Client
                      </button>
                    </form>
                  ) : null}

                  {prospect.documentsHref ? (
                    <Link href={prospect.documentsHref as Route} className="button-secondary">
                      Manage client documents
                    </Link>
                  ) : null}

                  {prospect.photosHref ? (
                    <Link href={prospect.photosHref as Route} className="button-secondary">
                      Gym photos
                    </Link>
                  ) : null}
                </div>
              ) : (
                <p className="muted">
                  Client account not found for this email yet.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="inline-actions">
          <Link href="/admin/prospects" className="button-secondary">
            Back to pipeline
          </Link>
        </div>
      </div>
    </section>
  );
}

function serializeProspect(p: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  goalSummary: string;
  goalType?: string | null;
  fitnessLevel?: string | null;
  timeline?: string | null;
  injuries?: string | null;
  preferredContact: string | null;
  referralSource?: string | null;
  message: string | null;
  followUpDate?: string | Date | null;
  status: ProspectStatusValue;
  createdAt: string | Date;
  clientUserId?: string | null;
  onboardingStatus?: string | null;
  onboardingStatusLabel?: string | null;
  documentsHref?: string | null;
  photosHref?: string | null;
  notes: { id: string; body: string; createdAt: string | Date }[];
}): ProspectDetailDTO {
  return {
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    email: p.email,
    phone: p.phone,
    goalSummary: p.goalSummary,
    goalType: p.goalType ?? null,
    fitnessLevel: p.fitnessLevel ?? null,
    timeline: p.timeline ?? null,
    injuries: p.injuries ?? null,
    preferredContact: p.preferredContact,
    referralSource: p.referralSource ?? null,
    message: p.message,
    followUpDate: p.followUpDate
      ? typeof p.followUpDate === "string" ? p.followUpDate : p.followUpDate.toISOString()
      : null,
    status: p.status,
    createdAt: typeof p.createdAt === "string" ? p.createdAt : p.createdAt.toISOString(),
    clientUserId: p.clientUserId ?? null,
    onboardingStatus: p.onboardingStatus ?? null,
    onboardingStatusLabel: p.onboardingStatusLabel ?? onboardingStatusLabel(p.onboardingStatus),
    documentsHref: p.documentsHref ?? null,
    photosHref: p.photosHref ?? null,
    notes: p.notes.map((n) => ({
      id: n.id,
      body: n.body,
      createdAt: typeof n.createdAt === "string" ? n.createdAt : n.createdAt.toISOString(),
    })),
  };
}
