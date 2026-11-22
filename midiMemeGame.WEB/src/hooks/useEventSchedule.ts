"use client";

import { useEffect, useState } from "react";
import { getEventSchedule, type EventSchedule } from "@/services/eventScheduleService";

const REQUEST_TIMEOUT_MS = 20_000;

type ScheduleState =
    | { status: "loading" | "missing" | "error" }
    | { status: "ready"; schedule: EventSchedule };

export function useEventSchedule() {
    const [state, setState] = useState<ScheduleState>({ status: "loading" });
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let activeRequest: AbortController | null = null;

        async function refresh() {
            if (activeRequest) return;

            const request = new AbortController();
            activeRequest = request;
            const signal = AbortSignal.any([
                request.signal,
                AbortSignal.timeout(REQUEST_TIMEOUT_MS),
            ]);

            try {
                const schedule = await getEventSchedule(signal);
                if (request.signal.aborted) return;

                setState(schedule ? { status: "ready", schedule } : { status: "missing" });
            } catch {
                if (!request.signal.aborted) setState({ status: "error" });
            } finally {
                activeRequest = null;
            }
        }

        function refreshWhenVisible() {
            if (document.visibilityState === "visible") void refresh();
        }

        void refresh();
        window.addEventListener("focus", refreshWhenVisible);
        document.addEventListener("visibilitychange", refreshWhenVisible);
        return () => {
            activeRequest?.abort();
            window.removeEventListener("focus", refreshWhenVisible);
            document.removeEventListener("visibilitychange", refreshWhenVisible);
        };
    }, [attempt]);

    function retry() {
        setState({ status: "loading" });
        setAttempt(value => value + 1);
    }

    return { state, retry };
}
