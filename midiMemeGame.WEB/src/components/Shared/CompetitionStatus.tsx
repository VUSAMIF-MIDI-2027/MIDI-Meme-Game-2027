"use client";

import { Clock } from "lucide-react";
import { eventCountdownText } from "@/app/pageText";
import { useLanguage, type Lang } from "@/context/LanguageContext";
import { useEventPhase } from "@/hooks/useEventPhase";
import { useEventSchedule } from "@/hooks/useEventSchedule";
import type { EventSchedule } from "@/services/eventScheduleService";
import { formatEventDateTime, getCountdownParts } from "@/utils/eventPhase";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type StatusLayout = "compact" | "dashboard";

type ScheduleDetailsProps = {
    schedule: EventSchedule;
    lang: Lang;
    layout: StatusLayout;
};

function ScheduleDetails({ schedule, lang, layout }: ScheduleDetailsProps) {
    const { phase, dateTime, remainingSeconds, remainingMilliseconds } = useEventPhase(schedule);
    const copy = eventCountdownText[lang];
    const stage = copy.phases[phase];
    const isLive = phase === "submissions" || phase === "voting";
    const showStartDate = phase === "upcoming" && remainingMilliseconds >= ONE_DAY_MS;
    const showCountdown = phase !== "ended" && !showStartDate;
    const shortDate = formatEventDateTime(dateTime, lang, "month-day");
    const { days, hours, minutes, seconds } = getCountdownParts(remainingSeconds);
    const clock = [hours, minutes, seconds].map(value => String(value).padStart(2, "0")).join(":");

    const countdown = days > 0 ? `${days} ${copy.shortDays} ${clock}` : clock;

    if (layout === "dashboard") {
        const displayDate = (
            <time dateTime={dateTime}>
                {shortDate}
            </time>
        );

        return (
            <>
                <p
                    aria-live="polite"
                    className={isLive
                        ? "flex items-center gap-2.5 text-xl leading-tight font-bold text-[#70cfff] sm:text-2xl"
                        : "text-xs font-semibold uppercase tracking-[0.12em] text-[#70cfff]"}
                >
                    {stage.heading}
                    {isLive && (
                        <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-[#70cfff] motion-safe:animate-pulse" />
                    )}
                </p>
                {showCountdown ? (
                    <p role="timer" className="mt-3 text-3xl leading-tight font-bold tabular-nums text-white">
                        {copy.timeRemaining}{" "}{countdown}
                    </p>
                ) : (
                    <p className="mt-3 text-3xl leading-tight font-bold text-white first-letter:uppercase">
                        {displayDate}
                    </p>
                )}
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                    {stage.dateLabel}
                    {showCountdown && (
                        <>{" "}· {displayDate}</>
                    )}
                    {" "}· {copy.timeZone}
                </p>
            </>
        );
    }

    return (
        <>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Clock aria-hidden="true" className="size-4 shrink-0 text-midi-blue" />
                <p aria-live="polite" className="text-xs font-semibold uppercase tracking-wide text-[#70cfff]">
                    {stage.heading}
                </p>
                {showStartDate && (
                    <time dateTime={dateTime} className="text-2xl leading-none font-bold text-white first-letter:uppercase">
                        {shortDate}
                    </time>
                )}
                {showCountdown && (
                    <p role="timer" className="text-2xl leading-none font-bold tabular-nums text-white">
                        {countdown}
                    </p>
                )}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
                {stage.dateLabel}
                {!showStartDate && (
                    <>
                        {" "}·{" "}
                        <time dateTime={dateTime}>
                            {formatEventDateTime(dateTime, lang)}
                        </time>
                    </>
                )}
                {" "}· {copy.timeZone}
            </p>
        </>
    );
}

type Props = {
    className?: string;
    layout?: StatusLayout;
};

function ScheduleLoading({ label, layout }: { label: string; layout: StatusLayout }) {
    const dashboard = layout === "dashboard";

    return (
        <div role="status" className={dashboard ? undefined : "flex flex-wrap items-center gap-x-3 gap-y-1"}>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                {label}
            </p>
            <p
                aria-hidden="true"
                className={dashboard
                    ? "mt-3 text-3xl leading-tight font-bold tabular-nums text-white/65"
                    : "text-2xl leading-none font-bold tabular-nums text-white/65"}
            >
                --:--:--
            </p>
        </div>
    );
}

export function CompetitionStatus({ className, layout = "compact" }: Props) {
    const { lang } = useLanguage();
    const { state, retry } = useEventSchedule();
    const copy = eventCountdownText[lang];

    return (
        <aside aria-label={copy.schedule} className={className}>
            {state.status === "loading" && (
                <ScheduleLoading label={copy.loading} layout={layout} />
            )}
            {state.status === "ready" && (
                <ScheduleDetails schedule={state.schedule} lang={lang} layout={layout} />
            )}
            {(state.status === "missing" || state.status === "error") && (
                <>
                    <p role={state.status === "error" ? "alert" : "status"} className="text-sm text-text-muted">
                        {copy[state.status]}
                    </p>
                    {state.status === "error" && (
                        <button
                            type="button"
                            onClick={retry}
                            className="pointer-events-auto mt-2 min-h-11 rounded-md px-2 text-sm font-bold text-[#70cfff] underline focus-visible:outline-2 focus-visible:outline-midi-blue"
                        >
                            {copy.retry}
                        </button>
                    )}
                </>
            )}
        </aside>
    );
}
