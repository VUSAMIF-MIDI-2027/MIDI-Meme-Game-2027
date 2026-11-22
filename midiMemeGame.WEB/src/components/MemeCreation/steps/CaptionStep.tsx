"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import MemeCard from "@/components/Shared/MemeCard";
import {
  CAPTION_MAX_CHARS,
  CAPTION_MAX_WORDS,
  memeCreationText,
} from "../memeCreationText";

type CaptionStepProps = {
  photoUrl: string;
  photoAlt: string;
  caption: string;
  onCaptionChange: (value: string) => void;
  onPreview: () => void;
};

export default function CaptionStep({
  photoUrl,
  photoAlt,
  caption,
  onCaptionChange,
  onPreview,
}: CaptionStepProps) {
  const { lang } = useLanguage();
  const t = memeCreationText[lang];
  const [touched, setTouched] = useState(false);

  const trimmed = caption.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const wordsOver = words > CAPTION_MAX_WORDS;
  const charsOver = trimmed.length > CAPTION_MAX_CHARS;
  const isValid = trimmed.length > 0 && !wordsOver && !charsOver;
  const counterClass = (over: boolean) =>
    over ? "text-rose-400" : "text-white/60";

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
              value={caption}
              onChange={(event) => onCaptionChange(event.target.value)}
              onBlur={() => setTouched(true)}
              placeholder={t.captionPlaceholder}
              rows={4}
              className="mt-2 w-full resize-y rounded-lg border border-white/15 bg-[#0b0f12] px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 focus-visible:outline-2 focus-visible:outline-midi-blue"
            />
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm tabular-nums">
              <span className={counterClass(wordsOver)}>
                {t.wordsLabel}: {words}/{CAPTION_MAX_WORDS}
              </span>
              <span className={counterClass(charsOver)}>
                {t.charsLabel}: {trimmed.length}/{CAPTION_MAX_CHARS}
              </span>
              <span className="text-white/60">{t.captionLimits}</span>
            </div>
            {touched && trimmed.length === 0 && (
              <p role="alert" className="mt-2 text-sm text-rose-400">
                {t.captionRequired}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onPreview}
            disabled={!isValid}
            className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-lg bg-midi-blue px-6 py-3 font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {t.previewButton}
          </button>
        </div>
      </div>
    </div>
  );
}
