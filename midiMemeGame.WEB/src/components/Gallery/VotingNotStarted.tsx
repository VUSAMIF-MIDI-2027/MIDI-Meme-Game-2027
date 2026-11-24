"use client";

import { eventCountdownText } from "@/app/pageText";
import { galleryText } from "@/app/dashboard/gallery/galleryText";
import { SleepingCat } from "@/components/Home/Countdown/SleepingCat";
import { useLanguage } from "@/context/LanguageContext";
import { formatEventDateTime, getCountdownParts } from "@/utils/eventPhase";

type VotingNotStartedProps = {
    votingStartsAt: string | null;
    now: number;
};

export function VotingNotStarted({ votingStartsAt, now }: VotingNotStartedProps) {
    const { lang } = useLanguage();
    const t = galleryText[lang];
    const shared = eventCountdownText[lang];

    const remainingSeconds = votingStartsAt
        ? Math.max(0, Math.ceil((Date.parse(votingStartsAt) - now) / 1000))
        : 0;
    const { days, hours, minutes, seconds } = getCountdownParts(remainingSeconds);
    const clock = [hours, minutes, seconds].map(value => String(value).padStart(2, "0")).join(":");

    return (
        <div className="flex flex-col items-center rounded-2xl border border-white/15 bg-[#0a0a0a] px-6 py-12 text-center sm:py-16">
            <SleepingCat className="-mb-2" />
            <h2 className="mt-4 text-3xl leading-tight font-bold text-midi-gray sm:text-4xl">
                {t.notStartedTitle}
            </h2>
            <p className="mt-3 max-w-md text-base leading-relaxed text-text-muted">
                {votingStartsAt ? t.notStartedScheduled : t.notStartedUnscheduled}
            </p>
            {votingStartsAt && (
                <div className="mt-8 border-t border-midi-blue/60 pt-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#70cfff]">
                        {t.opensIn}
                    </p>
                    <p role="timer" className="mt-3 text-3xl leading-tight font-bold tabular-nums text-white">
                        {days > 0 ? `${days} ${shared.shortDays} ${clock}` : clock}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-text-muted">
                        {t.opensAt} ·{" "}
                        <time dateTime={votingStartsAt}>{formatEventDateTime(votingStartsAt, lang)}</time>
                        {" "}· {shared.timeZone}
                    </p>
                </div>
            )}
        </div>
    );
}
