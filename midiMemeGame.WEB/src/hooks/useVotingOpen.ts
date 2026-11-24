"use client";

import { useEffect, useState } from "react";
import { useEventSchedule } from "@/hooks/useEventSchedule";
import { getEventPhase } from "@/utils/eventPhase";

// True only while voting is open.
export function useVotingOpen() {
    const { state } = useEventSchedule();
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    if (state.status !== "ready") return false;
    const { phase } = getEventPhase(state.schedule, now);
    return phase === "voting";
}
