"use client";

import { useEffect, useState } from "react";
import type { EventSchedule } from "@/services/eventScheduleService";
import { getEventPhase, type EventPhase } from "@/utils/eventPhase";

type KnownPhaseResult = {
    phase: EventPhase;
    dateTime: string;
    remainingSeconds: number;
    remainingMilliseconds: number;
    now: number;
};

type UnknownPhaseResult = {
    phase: undefined;
    dateTime: undefined;
    remainingSeconds: number;
    remainingMilliseconds: number;
    now: number;
};

export function useEventPhase(schedule: EventSchedule): KnownPhaseResult;
export function useEventPhase(
    schedule: EventSchedule | undefined,
): KnownPhaseResult | UnknownPhaseResult;
export function useEventPhase(schedule?: EventSchedule) {
    const [now, setNow] = useState(() => Date.now());
    const { phase, dateTime } = schedule
        ? getEventPhase(schedule, now)
        : { phase: undefined, dateTime: undefined };
    const remainingMilliseconds = dateTime
        ? Math.max(0, Date.parse(dateTime) - now)
        : 0;
    const remainingSeconds = Math.ceil(remainingMilliseconds / 1000);

    useEffect(() => {
        function updateClock() {
            setNow(Date.now());
        }

        // Refresh even after the timer has stopped if an administrator updates the schedule.
        const initial = window.setTimeout(updateClock, 0);
        const timer =
            phase === undefined || phase === "ended"
                ? undefined
                : window.setInterval(updateClock, 1000);

        return () => {
            window.clearTimeout(initial);
            window.clearInterval(timer);
        };
    }, [phase, dateTime]);

    return { phase, dateTime, remainingSeconds, remainingMilliseconds, now };
}
