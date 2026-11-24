"use client";

import { useLanguage } from "@/context/LanguageContext";
import { memeCreationText } from "./memeCreationText";

type StepIndicatorProps = {
  current: number;
  maxReached: number;
  onSelect: (step: number) => void;
};

export default function StepIndicator({
  current,
  maxReached,
  onSelect,
}: StepIndicatorProps) {
  const { lang } = useLanguage();
  const t = memeCreationText[lang];

  return (
    <ol aria-label={t.progressLabel} className="mt-4 grid grid-cols-3 gap-3">
      {t.stepNames.map((name, index) => {
        const step = index + 1;
        const isCurrent = step === current;
        const isPast = step < current;
        const isSelectable = step <= maxReached && !isCurrent;
        const stateClass =
          isCurrent || isPast
            ? "border-midi-blue text-[#70cfff]"
            : isSelectable
              ? "border-white/30 text-white/60"
              : "border-white/15 text-white/35";

        return (
          <li key={name}>
            <button
              type="button"
              disabled={!isSelectable}
              onClick={() => onSelect(step)}
              aria-current={isCurrent ? "step" : undefined}
              className={`w-full border-t-2 pt-2 text-left text-xs font-bold tracking-widest ${stateClass} ${
                isSelectable
                  ? "cursor-pointer hover:text-white focus-visible:outline-2 focus-visible:outline-midi-blue"
                  : "cursor-default"
              }`}
            >
              <span className="block">0{step}</span>
              <span className="mt-0.5 block truncate text-[10px] font-medium normal-case tracking-normal">
                {name}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
