"use client";

import Countdown from "@/components/Home/Countdown";
import logoMidiFullWhite from "#/public/logos/MIDI-Logotipas-pilnas-baltas.png"
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { text } from "@/app/pageText";

// HOME SCREENE KOL KAS VIBE CODED MOCK CONTENTAS, LAUKIAM KOMOS DIZAINO ATNAUJINTO

export default function Home() {
  const { lang } = useLanguage();
  const t = text[lang];

  const steps = [
    { number: "01", title: t.step1 },
    { number: "02", title: t.step2 },
    { number: "03", title: t.step3 },
  ];

  return (
    <div className="flex flex-1 flex-col items-center bg-midi-black text-midi-white">
      <section className="flex w-full max-w-4xl flex-col items-center gap-6 px-6 pt-16 text-center">
        <Image
          src={logoMidiFullWhite}
          alt="Matematikų ir informatikų dienos"
          height={70}
          priority
          className="h-auto w-[200px]"
        />

        <p className="text-xs font-semibold uppercase tracking-[0.2em]">
          {t.miniTitle}
        </p>

        <h1 className="text-5xl font-bold leading-tight sm:text-7xl">
          {t.titleWhite}
          <br />
          <span className="text-midi-blue">{t.titleBlue}</span>
        </h1>

        <p className="max-w-xl text-midi-gray/70">
          {t.description}
        </p>
      </section>

      <section className="mt-12 flex w-full max-w-4xl flex-col items-center gap-4 px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-midi-blue">
          {t.startsSoon}
        </p>

        <Countdown />

        <p className="font-semibold">{t.dateTime}</p>
        <p className="text-xs text-midi-gray/60">
          {t.registrationNotice}
        </p>
      </section>

      <section className="mt-16 grid w-full max-w-5xl grid-cols-1 gap-px px-6 pb-16 sm:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.number}
            className="flex items-center gap-3 border-l border-midi-charcoal px-6 py-8"
          >
            <span className="text-xs font-semibold text-midi-blue">
              {step.number}
            </span>
            <h2 className="text-xl font-semibold">{step.title}</h2>
          </div>
        ))}
      </section>
    </div>
  );
}
