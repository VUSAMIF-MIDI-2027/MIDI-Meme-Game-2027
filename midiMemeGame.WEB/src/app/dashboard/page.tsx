"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { LoadingScreen } from "@/components/Loading/LoadingScreen";
import YourMemes from "@/components/Home/Your-Memes/YourMemes";
import { useLanguage } from "@/context/LanguageContext";
import { dashboardText } from "./pageText";
import styles from "./dashboard.module.css";
import Link from "next/link";

// Keep the date consistent with the existing public countdown.
const COMPETITION_START = new Date("2026-11-27T21:00:00+02:00");

export default function DashboardPage() {
    const { isLoaded, isSignedIn } = useAuth();
    const { isLoaded: isUserLoaded, user } = useUser();
    const { lang } = useLanguage();
    const router = useRouter();
    const [now, setNow] = useState<number | null>(null);
    const t = dashboardText[lang];

    useEffect(() => {
        if (isLoaded && !isSignedIn) router.replace("/login");
    }, [isLoaded, isSignedIn, router]);

    useEffect(() => {
        const initialUpdate = window.setTimeout(() => setNow(Date.now()), 0);
        const interval = window.setInterval(() => setNow(Date.now()), 60_000);
        return () => {
            window.clearTimeout(initialUpdate);
            window.clearInterval(interval);
        };
    }, []);

    if (!isLoaded || !isSignedIn || !isUserLoaded) return <LoadingScreen />;

    const name = user?.firstName?.trim() || user?.username?.trim();
    const competitionOpen = now !== null && now >= COMPETITION_START.getTime();
    const date = new Intl.DateTimeFormat(lang === "lt" ? "lt-LT" : "en-GB", {
        month: "long",
        day: "numeric",
        timeZone: "Europe/Vilnius",
    }).format(COMPETITION_START);
    const time = new Intl.DateTimeFormat("lt-LT", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Vilnius",
    }).format(COMPETITION_START);

    return (
        <div className={`${styles.page} flex flex-1 flex-col text-midi-gray`}>
            <div className="mx-auto w-full max-w-[1260px] px-5 pt-12 pb-16 sm:px-8 sm:pt-16 lg:pt-20 lg:pb-24">
                <section
                    aria-labelledby="participant-title"
                    className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)] lg:gap-16"
                >
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-midi-white">
                            {name ? `${t.greeting}, ${name}` : `${t.greeting}!`}
                        </p>
                        <h1
                            id="participant-title"
                            className="mt-5 max-w-[760px] text-[clamp(42px,6vw,88px)] leading-[0.98] font-extrabold tracking-[-0.035em] text-pretty"
                        >
                            {t.title}
                        </h1>
                        <p className="mt-6 max-w-[720px] text-base leading-[1.75] text-text-muted sm:text-lg">
                            {t.description}
                        </p>
                        {/* The creation flow is being implemented separately. */}
                        <button
                            type="button"
                            disabled
                            aria-describedby="creation-notice"
                            className="mt-8 inline-flex min-h-13 cursor-not-allowed items-center gap-3 rounded-xl bg-midi-blue px-6 py-3 text-base font-bold text-white opacity-40"
                        >
                            {t.createMeme}
                            <ArrowRight aria-hidden="true" className="size-5" />
                        </button>
                        <p id="creation-notice" className="mt-3 text-sm text-text-muted">
                            {t.creationNotice}
                        </p>
                    </div>

                    <div>
                        <div className={styles.catScene} aria-hidden="true">
                            <span className={styles.dioCat} />
                        </div>
                        <aside className="relative border-t border-midi-blue/60 pt-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#70cfff]">
                            {competitionOpen ? t.competitionLive : t.competitionUpcoming}
                        </p>
                        <p className="mt-3 text-3xl leading-tight font-bold text-white">
                            <time dateTime={COMPETITION_START.toISOString()}>
                                <span className="inline-block first-letter:uppercase">{date}</span>
                                <span> · {t.startsAt} </span>
                                <span>{time}</span>
                            </time>
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-text-muted">
                            {competitionOpen ? t.liveDescription : t.upcomingDescription}
                        </p>
                        </aside>
                    </div>
                </section>

                <YourMemes />
                <Link href="/rules" className="mt-6 inline-flex min-h-11 items-center text-sm text-white/80 underline underline-offset-4 hover:text-white">
                    {lang === "lt" ? "Konkurso taisyklės" : "Competition rules"}
                </Link>
            </div>
        </div>
    );
}


