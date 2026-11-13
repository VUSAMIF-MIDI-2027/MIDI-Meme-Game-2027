"use client";

import { Moon } from "@/components/Home/Moon";
import { useLanguage } from "@/context/LanguageContext";
import { text } from "@/app/pageText";
import HomeIntro from "@/components/Home/HomeIntro";
import EventCountdown from "@/components/Home/EventCountdown";
import ParticipationSteps from "@/components/Home/ParticipationSteps";

// HOME SCREENE KOL KAS VIBE CODED MOCK CONTENTAS, LAUKIAM KOMOS DIZAINO ATNAUJINTO

export default function Home() {
  const { lang } = useLanguage();
  const t = text[lang];

  return (
    <div className="relative isolate flex flex-1 flex-col justify-center overflow-hidden bg-page-background px-5 py-10 text-white sm:px-6 sm:py-16">
      <Moon />
      <HomeIntro />
      <EventCountdown />
      <ParticipationSteps />  

    </div>
  );
}

