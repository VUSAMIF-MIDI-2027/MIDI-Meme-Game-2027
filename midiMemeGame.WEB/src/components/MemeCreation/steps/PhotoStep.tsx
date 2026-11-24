"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { PhotoPool } from "../MemeCreationFlow";
import { memeCreationText } from "../memeCreationText";

type PhotoStepProps = {
  photos: PhotoPool;
  authError: boolean;
  selectedId: number | null;
  onSelect: (id: number) => void;
  onRetry: () => void;
};

export default function PhotoStep({
  photos,
  authError,
  selectedId,
  onSelect,
  onRetry,
}: PhotoStepProps) {
  const { lang } = useLanguage();
  const t = memeCreationText[lang];

  return (
    <div>
      <h2 className="text-lg font-bold text-white">{t.photoTitle}</h2>
      <p className="mt-1 text-sm leading-relaxed text-white/60">
        {t.photoHint}
      </p>

      {photos.status === "loading" || photos.status === "idle" ? (
        <div role="status" className="mt-4">
          <p className="sr-only">{t.photoLoading}</p>
          <div
            aria-hidden="true"
            className="grid grid-cols-1 gap-3 sm:grid-cols-3"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="aspect-[4/3] animate-pulse rounded-lg bg-white/10"
              />
            ))}
          </div>
        </div>
      ) : photos.status === "error" ? (
        <div className="mt-4 rounded-lg border border-white/15 bg-[#0b0f12] p-6 text-center">
          <p role="alert" className="text-sm text-rose-400">
            {authError ? t.authError : t.photoError}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue"
          >
            {t.retry}
          </button>
        </div>
      ) : Object.keys(photos.urls).length === 0 ? (
        <div className="mt-4 rounded-lg border border-white/15 bg-[#0b0f12] p-6 text-center">
          <p className="text-sm text-white/60">{t.photoEmpty}</p>
        </div>
      ) : (
        <div
          className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3"
          role="group"
          aria-label={t.photoTitle}
        >
          {Object.entries(photos.urls).map(([key, url]) => {
            const id = Number(key);
            const isSelected = selectedId === id;
            return (
              <button
                key={id}
                type="button"
                aria-label={t.photoAlt(id)}
                aria-pressed={isSelected}
                onClick={() => onSelect(id)}
                className={`relative aspect-[4/3] cursor-pointer overflow-hidden rounded-lg border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue ${
                  isSelected
                    ? "border-midi-blue"
                    : "border-white/15 hover:border-white/40"
                }`}
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  loading="eager"
                  sizes="(min-width: 640px) 390px, 90vw"
                  className="object-cover"
                />
                {isSelected && (
                  <span className="absolute right-1.5 bottom-1.5 rounded-full bg-midi-blue p-1 text-white">
                    <Check aria-hidden="true" className="size-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
