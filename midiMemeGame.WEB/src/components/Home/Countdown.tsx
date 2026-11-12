// CIA SITAS VIBE CODINTAS FULLY

"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { text } from "@/components/Home/CountdownText";

const TARGET = new Date("2026-11-27T21:00:00+02:00").getTime();

function getTimeLeft() {
  const totalSeconds = Math.floor(Math.max(0, TARGET - Date.now()) / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function Countdown() {
  const { lang } = useLanguage();
  const t = text[lang];

  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft> | null>(null);

  useEffect(() => {
    const initialUpdate = setTimeout(() => {
      setTimeLeft(getTimeLeft());
    }, 0);

    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => {
      clearTimeout(initialUpdate);
      clearInterval(interval);
    };
  }, []);

  const items = [
    { value: timeLeft?.days, label: t.days },
    { value: timeLeft?.hours, label: t.hours },
    { value: timeLeft?.minutes, label: t.minutes },
    { value: timeLeft?.seconds, label: t.seconds },
  ];

  return (
    <div className="mt-4 flex w-full items-start border-y border-white/15 py-5.5 sm:pt-6.25">
      {items.map((item, i) => (
        <div key={item.label} className="contents">
          <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <span className="text-[clamp(36px,11.5vw,64px)] leading-[1.1] font-extrabold tabular-nums sm:text-[clamp(52px,8vw,100px)]">
              {item.value === undefined ? "--" : pad(item.value)}
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
