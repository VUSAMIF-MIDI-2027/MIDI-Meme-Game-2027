// CIA SITAS VIBE CODINTAS FULLY

"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { text } from "@/components/Home/CountdownText";

const TARGET = new Date("2026-11-27T19:30:00+02:00").getTime();

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
    setTimeLeft(getTimeLeft());
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const items = [
    { value: timeLeft?.days, label: t.days },
    { value: timeLeft?.hours, label: t.hours },
    { value: timeLeft?.minutes, label: t.minutes },
    { value: timeLeft?.seconds, label: t.seconds },
  ];

  return (
    <div className="flex w-full items-start justify-between border-y border-midi-charcoal py-8">
      {items.map((item, i) => (
        <div key={item.label} className="contents">
          <div className="flex flex-1 flex-col items-center gap-2">
            <span className="text-5xl font-bold tabular-nums sm:text-7xl">
              {item.value === undefined ? "--" : pad(item.value)}
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-midi-gray/60">
              {item.label}
            </span>
          </div>

          {i < items.length - 1 && (
            <span className="text-5xl font-bold text-midi-blue sm:text-7xl">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
