"use client";

import { useEffect } from "react";
import { LoadingScreen } from "@/components/Loading/LoadingScreen";
import { useAuth } from "@clerk/react";
import { useRouter } from "next/navigation";
import { ArrowDown } from "lucide-react";
import { Moon } from "@/components/Home/Hero/Moon";
import HomeIntro from "@/components/Home/Hero/HomeIntro";
import EventCountdown from "@/components/Home/Countdown/EventCountdown";
import Tutorial from "@/components/Home/Tutorial/Tutorial";
import { tutorialText } from "@/components/Home/Tutorial/tutorialText";
import { useLanguage } from "@/context/LanguageContext";
import YourMemes from "@/components/Home/Your-Memes/YourMemes";

export default function Home() {
  const { lang } = useLanguage();
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) router.replace("/dashboard");
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || isSignedIn) return <LoadingScreen />;

  return (
    <div className="flex flex-1 flex-col bg-black text-white">
      <div className="relative isolate flex min-h-[calc(100svh-4.25rem)] flex-col justify-center overflow-hidden px-5 py-10 sm:px-6 lg:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse at 72% 48%, rgba(0, 117, 181, 0.16), transparent 58%)",
          }}
        />
        <Moon />
        <HomeIntro />
        <EventCountdown />

        <a
          href="#tutorial"
          className="relative z-10 mx-auto mt-4 flex w-fit flex-col items-center gap-2 rounded-md p-2 text-xs font-bold uppercase tracking-widest text-text-muted transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-midi-blue"
        >
          {tutorialText[lang].eyebrow}
          <ArrowDown aria-hidden="true" className="size-5 text-midi-blue" />
        </a>
      </div>
      <Tutorial />
      <YourMemes />
    </div>
  );
}
