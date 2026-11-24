"use client";

import { Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { memeCreationText } from "../memeCreationText";

type ConfirmationStepProps = {
  onCreateAnother: () => void;
  onViewMemes: () => void;
  canCreateAnother?: boolean;
};

export default function ConfirmationStep({
  onCreateAnother,
  onViewMemes,
  canCreateAnother = true,
}: ConfirmationStepProps) {
  const { lang } = useLanguage();
  const t = memeCreationText[lang];

  return (
    <div className="flex flex-col items-center py-2 text-center sm:py-4">
      <span className="rounded-full bg-midi-blue p-3 text-white">
        <Check aria-hidden="true" className="size-6" />
      </span>
      <h2 className="mt-4 text-lg font-bold text-white">{t.confirmTitle}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-white/75">
        {t.confirmBody}
      </p>
      <div className="mt-5 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        {canCreateAnother && (
          <button
            type="button"
            onClick={onCreateAnother}
            className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-midi-blue px-6 py-3 font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue"
          >
            {t.createAnother}
          </button>
        )}
        <button
          type="button"
          onClick={onViewMemes}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue"
        >
          {t.myMemes}
        </button>
      </div>
    </div>
  );
}
