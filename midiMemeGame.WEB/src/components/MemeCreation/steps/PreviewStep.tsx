"use client";

import { useState } from "react";
import { useAuth } from "@clerk/react";
import { Pencil } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import MemeCard from "@/components/Shared/MemeCard";
import {
  MEME_ERROR_ACCESS_DENIED,
  MEME_ERROR_LIMIT_REACHED,
  MEME_ERROR_PHOTO_DISABLED,
  MEME_ERROR_SUBMISSIONS_CLOSED,
  MEME_ERROR_SUBMISSIONS_NOT_OPEN,
  MemeServiceError,
  submitMeme,
} from "@/services/memeService";
import { memeCreationText } from "../memeCreationText";

type SubmitError =
  | "submit"
  | "auth"
  | "closed"
  | "photoDisabled"
  | "denied"
  | "limit";

function mapSubmitError(error: unknown): SubmitError {
  const code = error instanceof MemeServiceError ? error.code : undefined;
  switch (code) {
    case MEME_ERROR_SUBMISSIONS_NOT_OPEN:
    case MEME_ERROR_SUBMISSIONS_CLOSED:
      return "closed";
    case MEME_ERROR_PHOTO_DISABLED:
      return "photoDisabled";
    case MEME_ERROR_ACCESS_DENIED:
      return "denied";
    case MEME_ERROR_LIMIT_REACHED:
      return "limit";
    default:
      return "submit";
  }
}

type PreviewStepProps = {
  photoId: number;
  photoUrl: string;
  photoAlt: string;
  caption: string;
  onEdit: () => void;
  onChangePhoto: () => void;
  onSubmitted: () => void;
};

export default function PreviewStep({
  photoId,
  photoUrl,
  photoAlt,
  caption,
  onEdit,
  onChangePhoto,
  onSubmitted,
}: PreviewStepProps) {
  const { getToken } = useAuth();
  const { lang } = useLanguage();
  const t = memeCreationText[lang];
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<SubmitError | null>(null);

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
    } catch (error) {
      setError(mapSubmitError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-white">{t.previewTitle}</h2>
      <div className="mx-auto mt-4 w-full max-w-xl">
        <MemeCard image={photoUrl} imageAlt={photoAlt} caption={caption} />
      </div>
      {error && (
        <p role="alert" className="mt-4 text-center text-sm text-rose-400">
          {error === "auth" && t.authError}
          {error === "closed" && t.submitErrorClosed}
          {error === "photoDisabled" && t.submitErrorPhotoDisabled}
          {error === "denied" && t.submitErrorDenied}
          {error === "limit" && t.submitErrorLimit}
          {error === "submit" && t.submitError}
        </p>
      )}
      <div className="mx-auto mt-6 flex w-full max-w-xl flex-col gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          aria-busy={submitting}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-midi-blue px-6 py-3 font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? t.submitting : t.submit}
        </button>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onEdit}
            disabled={submitting}
            className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Pencil aria-hidden="true" className="size-4" />
            {t.edit}
          </button>
          <button
            type="button"
            onClick={onChangePhoto}
            disabled={submitting}
            className="inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t.changePhoto}
          </button>
        </div>
      </div>
    </div>
  );
}
