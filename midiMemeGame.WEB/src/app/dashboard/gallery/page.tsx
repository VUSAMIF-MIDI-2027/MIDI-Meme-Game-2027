"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/Loading/LoadingScreen";
import { galleryText } from "./galleryText";
import { MemeGallery } from "@/components/Gallery/MemeGallery";
import { GalleryMessage } from "@/components/Gallery/GalleryMessage";
import { VotingNotStarted } from "@/components/Gallery/VotingNotStarted";
import { useLanguage } from "@/context/LanguageContext";
import { useEventPhase } from "@/hooks/useEventPhase";
import { useEventSchedule } from "@/hooks/useEventSchedule";
import type { EventSchedule } from "@/services/eventScheduleService";

function ScheduledGallery({ schedule }: { schedule: EventSchedule }) {
    const router = useRouter();
    const { phase } = useEventPhase(schedule);
    const votingOpen = phase === "voting";

    useEffect(() => {
        if (!votingOpen) router.replace("/");
    }, [votingOpen, router]);

    if (!votingOpen) return null;
    return <MemeGallery />;
}

export default function GalleryPage() {
    const { lang } = useLanguage();
    const t = galleryText[lang];
    const { isLoaded, isSignedIn } = useAuth();
    const router = useRouter();
    const { state: schedule, retry } = useEventSchedule();

    useEffect(() => {
        if (isLoaded && !isSignedIn) router.replace("/login");
    }, [isLoaded, isSignedIn, router]);

    if (!isLoaded || !isSignedIn) return <LoadingScreen />;

    return (
        <div className="flex flex-1 flex-col text-midi-gray">
            <div className="mx-auto w-full max-w-[1260px] px-5 pt-12 pb-16 sm:px-8 sm:pt-16 lg:pt-20 lg:pb-24">
                <header className="mb-10 sm:mb-12">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-midi-white">{t.eyebrow}</p>
                    <h1 className="mt-5 text-[clamp(40px,6vw,72px)] leading-[0.98] font-extrabold tracking-[-0.035em] text-pretty">
                        {t.title}
                    </h1>
                    <p className="mt-6 max-w-[720px] text-base leading-[1.75] text-text-muted sm:text-lg">
                        {t.description}
                    </p>
                </header>
                {schedule.status === "ready" ? (
                    <ScheduledGallery schedule={schedule.schedule} />
                ) : schedule.status === "missing" ? (
                    <VotingNotStarted votingStartsAt={null} now={0} />
                ) : schedule.status === "error" ? (
                    <GalleryMessage title={t.errorTitle} description={t.errorDescription} action={{ label: t.retry, onClick: retry }} />
                ) : (
                    <div role="status" className="py-16 text-center text-text-muted">{t.loading}</div>
                )}
            </div>
        </div>
    );
}
