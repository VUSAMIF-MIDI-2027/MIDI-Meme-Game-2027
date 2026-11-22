"use client";

import { useState } from "react";
import { useAuth } from "@clerk/react";
import { Pencil } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import MemeCard from "@/components/Shared/MemeCard";
import { submitMeme } from "@/services/memeService";
import { memeCreationText } from "../memeCreationText";

type PreviewStepProps = {
  photoId: number;
  photoUrl: string;
  photoAlt: string;
  caption: string;
  onEdit: () => void;
  onSubmitted: () => void;
};

export default function PreviewStep({
  photoId,
  photoUrl,
  photoAlt,
  caption,
  onEdit,
  onSubmitted,
}: PreviewStepProps) {
  const { getToken } = useAuth();
  const { lang } = useLanguage();
  const t = memeCreationText[lang];
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<"submit" | "auth" | null>(null);

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        setError("auth");
        return;
      }
      await submitMeme(photoId, caption, token);
      onSubmitted();
    } catch {
      setError("submit");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-white">{t.previewTitle}</h2>
      <div className="mx-auto mt-4 w-3/5">
        <MemeCard image={photoUrl} imageAlt={photoAlt} caption={caption} />
      </div>
      {error && (
        <p role="alert" className="mt-4 text-center text-sm text-rose-400">
          {error === "auth" ? t.authError : t.submitError}
        </p>
      )}
      <div className="mx-auto mt-6 flex w-3/5 flex-col gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          aria-busy={submitting}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-midi-blue px-6 py-3 font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? t.submitting : t.submit}
        </button>
        <button
          type="button"
          onClick={onEdit}
          disabled={submitting}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Pencil aria-hidden="true" className="size-4" />
          {t.edit}
        </button>
      </div>
    </div>
  );
}
