"use client";

import { useLanguage } from "@/context/LanguageContext";
import { text } from "@/components/Home/Countdown/CountdownText";
import { getCountdownParts } from "@/utils/eventPhase";

const pad = (n: number) => String(n).padStart(2, "0");

export default function Countdown({ remainingSeconds }: { remainingSeconds: number }) {
  const { lang } = useLanguage();
  const t = text[lang];
  const { days, hours, minutes, seconds } = getCountdownParts(remainingSeconds);

  const items = [
    { value: days, label: t.days },
    { value: hours, label: t.hours },
    { value: minutes, label: t.minutes },
    { value: seconds, label: t.seconds },
  ];

  return (
    <div role="timer" className="mt-4 flex w-full items-start border-t border-white/15 pt-5.5 pb-2 sm:pt-6.25">
      {items.map((item, i) => (
        <div key={item.label} className="contents">
          <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <span className="text-[clamp(36px,11.5vw,64px)] leading-[1.1] font-extrabold tabular-nums sm:text-[clamp(52px,6vw,76px)]">
              {pad(item.value)}
            </span>
            <span className="text-[9px] font-bold tracking-[0.06em] text-[#929da8] uppercase sm:text-[11px] sm:tracking-[0.16em]">
              {item.label}
            </span>
          </div>

          {i < items.length - 1 && (
            <span className="pt-1 text-[26px] leading-none font-bold text-midi-blue sm:pt-2 sm:text-5xl">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
