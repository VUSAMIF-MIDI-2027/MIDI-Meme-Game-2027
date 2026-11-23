"use client";

import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { eventCountdownText } from "@/app/pageText";
import type { Lang } from "@/context/LanguageContext";
import { useEventPhase } from "@/hooks/useEventPhase";
import type { EventSchedule } from "@/services/eventScheduleService";
import { formatEventDateTime } from "@/utils/eventPhase";
import Countdown from "./Countdown";
import { SleepingCat } from "./SleepingCat";
import catStyles from "./SleepingCat.module.css";

type Props = {
    schedule: EventSchedule;
    lang: Lang;
};

export function EventPhaseSummary({ schedule, lang }: Props) {
    const { phase, dateTime, remainingSeconds } = useEventPhase(schedule);
    const ended = phase === "ended";
    const isLive = phase === "submissions" || phase === "voting";
    const copy = eventCountdownText[lang];
    const stage = copy.phases[phase];

    return (
        <>
            <h2
                id="countdown-heading"
                aria-live="polite"
                className={isLive
                    ? "relative z-20 flex items-center justify-center gap-2.5 px-8 text-xl leading-tight font-extrabold tracking-tight text-[#70cfff] sm:px-0 sm:text-3xl"
                    : "text-[11px] font-extrabold tracking-widest uppercase sm:text-sm sm:tracking-[0.12em]"}
            >
                {stage.heading}
                {isLive && (
                    <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-[#70cfff] motion-safe:animate-pulse" />
                )}
            </h2>

            {!ended && (
                <div className="relative flow-root">
                    <SleepingCat className={catStyles.perched} />
                    <Countdown remainingSeconds={remainingSeconds} />
                </div>
            )}

            <p className="mt-5.75 flex flex-col items-center gap-1.5 text-base font-bold sm:flex-row sm:flex-wrap sm:justify-center sm:gap-1.75 sm:text-[19px]">
                <span className="inline-flex items-center gap-1.5">
                    <Clock aria-hidden="true" className="size-5 shrink-0 text-midi-blue" />
                    {stage.dateLabel}
                </span>
                <span aria-hidden="true" className="hidden sm:inline">·</span>
                <span>
                    <time dateTime={dateTime}>{formatEventDateTime(dateTime, lang)}</time>
                    {" "}· {copy.timeZone}
                </span>
            </p>
            <p className="mx-auto mt-3 max-w-75 text-[15px] font-semibold text-midi-blue sm:mt-2 sm:max-w-none sm:text-[17px]">
                {stage.description}
            </p>

            {stage.action && (
                <div className="mt-6 flex justify-center">
                    <Link
                        href="/login"
                        className="pointer-events-auto cta-main-btn inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-lg bg-midi-blue px-8 py-3 text-base font-bold text-white transition-colors duration-150 hover:bg-midi-blue/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-midi-blue sm:w-auto"
                    >
                        {stage.action}
                        <ArrowUpRight size={20} className="shrink-0" aria-hidden="true" />
                    </Link>
                </div>
            )}
        </>
    );
}
