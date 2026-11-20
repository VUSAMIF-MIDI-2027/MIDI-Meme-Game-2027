"use client";

import { useEffect, useState } from "react";
import type { EventSchedule } from "@/services/eventScheduleService";
import { getEventPhase } from "@/utils/eventPhase";

export function useEventPhase(schedule: EventSchedule) {
    const [now, setNow] = useState(() => Date.now());
    const { phase, dateTime } = getEventPhase(schedule, now);
    const remainingMilliseconds = Math.max(0, Date.parse(dateTime) - now);
    const remainingSeconds = Math.ceil(remainingMilliseconds / 1000);

    useEffect(() => {
        function updateClock() {
            setNow(Date.now());
        }

        // Refresh even after the timer has stopped if an administrator updates the schedule.
        const initial = window.setTimeout(updateClock, 0);
        const timer = phase === "ended" ? undefined : window.setInterval(updateClock, 1000);

        return () => {
            window.clearTimeout(initial);
            window.clearInterval(timer);
        };
    }, [phase, dateTime]);

    return { phase, dateTime, remainingSeconds, remainingMilliseconds };
}
