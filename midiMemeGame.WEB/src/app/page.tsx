"use client";

import Image from "next/image";
import logo from "#/public/logos/MIDI-Logotipas-pilnas-baltas.png";
import Countdown from "@/components/Home/Countdown";
import { Moon } from "@/components/Home/Moon";
import { useLanguage } from "@/context/LanguageContext";
import { text } from "@/app/pageText";

// HOME SCREENE KOL KAS VIBE CODED MOCK CONTENTAS, LAUKIAM KOMOS DIZAINO ATNAUJINTO

export default function Home() {
  const { lang } = useLanguage();
  const t = text[lang];
  const steps = [t.step1, t.step2, t.step3];

  return (
    <div className="relative isolate overflow-hidden bg-[#050607] text-white px-5 pt-7.5 pb-10.5 sm:px-6 sm:pt-8.5 sm:pb-16">
      <Moon />
      <Image
        src={logo}
        alt="Matematikų ir informatikų dienos"
        priority
        sizes="(max-width: 640px) 160px, 210px"
        className="relative z-10 mx-auto mb-10 h-auto w-40 sm:mb-11 sm:w-52.5"
      />
      <section
        className="relative z-10 mx-auto w-full max-w-230 text-center"
        aria-labelledby="hero-title"
      >
        <p className="text-[11px] font-extrabold tracking-widest uppercase sm:text-sm sm:tracking-[0.12em]">
          {t.miniTitle}
        </p>
        <h1
          id="hero-title"
          className="mt-6 text-[clamp(42px,11.6vw,68px)] leading-[1.08] font-extrabold tracking-[-0.035em] [&>span]:block sm:mt-5 sm:text-[clamp(52px,7.5vw,104px)] sm:leading-[1.02]"
        >
          <span>{t.titleWhite}</span>
          <span className="text-midi-blue">{t.titleBlue}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-187.5 text-base leading-[1.65] text-pretty text-[#afb4ba] sm:mt-6.5 sm:text-lg sm:leading-[1.7]">
          {t.description}
        </p>
      </section>

      <section
        className="relative z-10 mx-auto mt-8.5 w-full max-w-242.5 text-center sm:mt-10"
        aria-labelledby="countdown-heading"
      >
        <h2
          id="countdown-heading"
          className="text-[11px] font-extrabold tracking-widest uppercase sm:text-sm sm:tracking-[0.12em]"
        >
          {t.startsSoon}
        </h2>
        <Countdown />
        <p className="mt-5.75 flex flex-wrap items-center justify-center gap-1.25 text-base font-bold sm:gap-1.75 sm:text-[19px]">
          <svg
            className="mr-1 size-5.5 shrink-0 text-midi-blue"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 6v6l4 2" />
          </svg>
          <time dateTime="2026-11-27T21:00:00+02:00">{t.dateTime}</time>
        </p>
        <p className="mx-auto mt-3 max-w-75 text-[15px] font-semibold text-midi-blue sm:mt-2 sm:max-w-none sm:text-[17px]">
          {t.registrationNotice}
        </p>
      </section>

      <ol className="relative z-10 mx-auto mt-7.5 grid w-full max-w-242.5 grid-cols-1 sm:mt-13.75 sm:grid-cols-3">
        {steps.map((step, index) => (
          <li
            key={step}
            className="flex items-center gap-3.5 px-2 py-4 text-lg not-first:border-t not-first:border-white/10 sm:justify-center sm:px-3 sm:py-5 sm:text-[19px] sm:not-first:border-t-0 sm:not-first:border-l"
          >
            <span className="text-[13px] font-bold tracking-widest text-midi-blue">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
