"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

type ResultsState =
    | { status: "loading" | "ongoing" | "unpublished" | "error" }
    | {
        status: "ready";
        winners: Winner[];
        others: ResultMeme[];
        nextAfterPlace: number | null;
        publicationVersion: string;
        moreStatus: "idle" | "loading" | "error";
    };

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
    const [attempt, setAttempt] = useState(0);
    const pageRequest = useRef<AbortController | null>(null);
    const nextAfterPlace = state.status === "ready" ? state.nextAfterPlace : null;
    const publicationVersion = state.status === "ready" ? state.publicationVersion : null;

    useEffect(() => {
        const request = new AbortController();
        const signal = AbortSignal.any([request.signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]);

        async function load() {
            try {
                const page = await getResults(signal);
                if (request.signal.aborted) return;

                setState({ status: "ready", ...page, moreStatus: "idle" });
            } catch (error) {
                if (!request.signal.aborted) setState(failureState(error));
            }
        }

        void load();
        return () => {
            request.abort();
            pageRequest.current?.abort();
            pageRequest.current = null;
        };
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

    const retry = useCallback(() => {
        setState({ status: "loading" });
        setAttempt(value => value + 1);
    }, []);

    const loadMore = useCallback(async () => {
        if (nextAfterPlace === null || pageRequest.current) return;
        const request = new AbortController();
        pageRequest.current = request;
        const signal = AbortSignal.any([request.signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]);

        setState(current => current.status === "ready" ? { ...current, moreStatus: "loading" } : current);
        try {
            const page = await getResults(signal, nextAfterPlace);
            if (request.signal.aborted) return;
            if (page.publicationVersion !== publicationVersion) {
                retry();
                return;
            }

            setState(current => current.status === "ready" && current.nextAfterPlace === nextAfterPlace
                ? { ...current, others: [...current.others, ...page.others], nextAfterPlace: page.nextAfterPlace, moreStatus: "idle" }
                : current);
        } catch (error) {
            if (request.signal.aborted) return;
            const failure = failureState(error);
            setState(current => failure.status === "error" && current.status === "ready"
                ? { ...current, moreStatus: "error" }
                : failure);
        } finally {
            if (pageRequest.current === request) pageRequest.current = null;
        }
    }, [nextAfterPlace, publicationVersion, retry]);

    return {
        state,
        winners: state.status === "ready" ? state.winners : [],
        visibleOthers: state.status === "ready" ? state.others : [],
        hasMore: nextAfterPlace !== null,
        moreStatus: state.status === "ready" ? state.moreStatus : "idle",
        loadMore,
        retry,
    };
}
