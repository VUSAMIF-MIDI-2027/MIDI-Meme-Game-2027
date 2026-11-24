"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/services/ApiError";
import {
    EVENT_SCHEDULE_NOT_FOUND,
    RESULTS_NOT_AVAILABLE,
    RESULTS_NOT_PUBLISHED,
    getResults,
    type ResultMeme,
    type Winner,
} from "@/services/resultsService";

const REQUEST_TIMEOUT_MS = 20_000;
export const GALLERY_PAGE_SIZE = 9;

type ResultsState =
    | { status: "loading" | "ongoing" | "unpublished" | "error" }
    | { status: "ready"; winners: Winner[]; others: ResultMeme[] };

function failureState(error: unknown): ResultsState {
    if (error instanceof ApiError) {
        if (error.code === RESULTS_NOT_AVAILABLE || error.code === EVENT_SCHEDULE_NOT_FOUND) {
            return { status: "ongoing" };
        }
        if (error.code === RESULTS_NOT_PUBLISHED) return { status: "unpublished" };
    }
    return { status: "error" };
}

export function useResults() {
    const [state, setState] = useState<ResultsState>({ status: "loading" });
    const [visibleCount, setVisibleCount] = useState(GALLERY_PAGE_SIZE);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const request = new AbortController();
        const signal = AbortSignal.any([request.signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]);

        async function load() {
            try {
                const { winners, others } = await getResults(signal);
                if (request.signal.aborted) return;

                setState(winners.length ? { status: "ready", winners, others } : { status: "unpublished" });
            } catch (error) {
                if (!request.signal.aborted) setState(failureState(error));
            }
        }

        void load();
        return () => request.abort();
    }, [attempt]);

    // While the results are not out yet, check again when the person returns to the tab.
    const waiting = state.status === "ongoing" || state.status === "unpublished";
    useEffect(() => {
        if (!waiting) return;

        function refreshWhenVisible() {
            if (document.visibilityState === "visible") setAttempt(value => value + 1);
        }

        window.addEventListener("focus", refreshWhenVisible);
        document.addEventListener("visibilitychange", refreshWhenVisible);
        return () => {
            window.removeEventListener("focus", refreshWhenVisible);
            document.removeEventListener("visibilitychange", refreshWhenVisible);
        };
    }, [waiting]);

    function retry() {
        setState({ status: "loading" });
        setAttempt(value => value + 1);
    }

    function loadMore() {
        setVisibleCount(count => count + GALLERY_PAGE_SIZE);
    }

    const others = state.status === "ready" ? state.others : [];

    return {
        state,
        winners: state.status === "ready" ? state.winners : [],
        visibleOthers: others.slice(0, visibleCount),
        hasMore: others.length > visibleCount,
        loadMore,
        retry,
    };
}
