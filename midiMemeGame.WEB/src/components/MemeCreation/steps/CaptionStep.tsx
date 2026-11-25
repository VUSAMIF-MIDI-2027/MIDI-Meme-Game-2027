"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import MemeCard from "@/components/Shared/MemeCard";
import {
  CAPTION_MAX_CHARS,
  isCaptionValid,
  memeCreationText,
} from "../memeCreationText";

type CaptionStepProps = {
  photoUrl: string;
  photoAlt: string;
  caption: string;
  onCaptionChange: (value: string) => void;
  onPreview: () => void;
  onBack: () => void;
};

export default function CaptionStep({
  photoUrl,
  photoAlt,
  caption,
  onCaptionChange,
  onPreview,
  onBack,
}: CaptionStepProps) {
  const { lang } = useLanguage();
  const t = memeCreationText[lang];
  const [touched, setTouched] = useState(false);

  const trimmed = caption.trim();
  const charsOver = trimmed.length > CAPTION_MAX_CHARS;
  const isValid = isCaptionValid(caption);

  return (
    <div>
      <h2 className="text-lg font-bold text-white">{t.captionTitle}</h2>
      <div className="mt-4 grid items-stretch gap-6 sm:grid-cols-2">
        <MemeCard
          image={photoUrl}
          imageAlt={photoAlt}
          caption={trimmed || t.captionPlaceholderCard}
        />
        <div className="flex flex-col justify-between gap-4">
          <div>
            <label
              htmlFor="meme-caption"
              className="block text-sm font-semibold text-white"
            >
              {t.captionLabel}
            </label>
            <textarea
              id="meme-caption"
              aria-describedby="meme-caption-count"
              value={caption}
              onChange={(event) => onCaptionChange(event.target.value)}
              onBlur={() => setTouched(true)}
              placeholder={t.captionPlaceholder}
              rows={4}
              className="mt-2 w-full resize-y rounded-lg border border-white/15 bg-[#0b0f12] px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 focus-visible:outline-2 focus-visible:outline-midi-blue"
            />
            <p id="meme-caption-count" className={`mt-2 text-sm tabular-nums ${charsOver ? "text-rose-400" : "text-white/60"}`}>
              {t.captionCount(trimmed.length)}
            </p>
            {touched && trimmed.length === 0 && (
              <p role="alert" className="mt-2 text-sm text-rose-400">
                {t.captionRequired}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onPreview}
              disabled={!isValid}
              className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-lg bg-midi-blue px-6 py-3 font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {t.previewButton}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue sm:w-auto"
            >
              {t.changePhoto}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
