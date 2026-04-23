"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/app/components/Toast";

type GymPhotoItem = {
  id: string;
  filePath: string;
  note: string | null;
  createdAt: string;
};

function formatPhotoDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function GymPhotoClient({
  initialPhotos,
}: {
  initialPhotos: GymPhotoItem[];
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [uploadPending, startUploadTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { showToast } = useToast();

  function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startUploadTransition(async () => {
      try {
        const response = await fetch("/api/gym-photos", {
          method: "POST",
          body: formData,
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error ?? `HTTP ${response.status}`);
        }

        form.reset();
        window.location.reload();
      } catch (error) {
        showToast(`Upload failed: ${(error as Error).message}`, "error");
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this gym photo?")) {
      return;
    }

    const previousPhotos = photos;
    setDeletingId(id);
    setPhotos((current) => current.filter((photo) => photo.id !== id));

    try {
      const response = await fetch(`/api/gym-photos/${id}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error ?? `HTTP ${response.status}`);
      }

      showToast("Gym photo deleted");
    } catch (error) {
      setPhotos(previousPhotos);
      showToast(`Delete failed: ${(error as Error).message}`, "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="stack">
      <div className="card">
        <div className="section__eyebrow">Upload photo</div>
        <form className="form" onSubmit={handleUpload}>
          <div className="field">
            <label htmlFor="photo">Gym photo</label>
            <input
              id="photo"
              name="photo"
              type="file"
              accept="image/*"
              capture="environment"
              required
              disabled={uploadPending}
            />
          </div>

          <div className="field">
            <label htmlFor="note">Note</label>
            <textarea
              id="note"
              name="note"
              placeholder="Optional workout note, exercise hit, or quick context."
              disabled={uploadPending}
            />
          </div>

          <div className="inline-actions">
            <button type="submit" className="button" disabled={uploadPending}>
              {uploadPending ? "Uploading..." : "Upload photo"}
            </button>
          </div>
        </form>
      </div>

      <div className="stack">
        {photos.length === 0 ? (
          <div className="card">
            <div className="section__eyebrow">This week</div>
            <p className="empty-state">No gym photos uploaded this week yet.</p>
          </div>
        ) : (
          photos.map((photo) => (
            <article key={photo.id} className="card">
              <div
                style={{
                  aspectRatio: "4 / 3",
                  overflow: "hidden",
                  borderRadius: "16px",
                  marginBottom: "1rem",
                }}
              >
                <img
                  src={photo.filePath}
                  alt={photo.note ? `Gym photo: ${photo.note}` : "Gym check-in photo"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>
              <div className="stack" style={{ gap: "0.75rem" }}>
                <div>
                  <div className="section__eyebrow">Captured</div>
                  <p>{formatPhotoDateTime(photo.createdAt)}</p>
                </div>
                <div>
                  <div className="section__eyebrow">Note</div>
                  <p>{photo.note || "No note added."}</p>
                </div>
                <div className="inline-actions">
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => handleDelete(photo.id)}
                    disabled={deletingId === photo.id}
                  >
                    {deletingId === photo.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
