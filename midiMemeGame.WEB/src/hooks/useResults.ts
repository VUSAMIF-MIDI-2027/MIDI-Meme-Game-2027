"use client";

import { useEffect, useRef, useState } from "react";
import {
    getResultMemes,
    getResults,
    type ResultMeme,
    type Winner,
} from "@/services/resultsService";

const REQUEST_TIMEOUT_MS = 20_000;
export const GALLERY_PAGE_SIZE = 9;

type ResultsState =
    | { status: "loading" | "unpublished" | "error" }
    | { status: "ready"; winners: Winner[] };

type GalleryState = {
    status: "loading" | "ready" | "error";
    items: ResultMeme[];
    page: number;
    hasMore: boolean;
};

const initialGallery: GalleryState = { status: "loading", items: [], page: 0, hasMore: false };

const timeoutSignal = (signal?: AbortSignal) =>
    AbortSignal.any([...(signal ? [signal] : []), AbortSignal.timeout(REQUEST_TIMEOUT_MS)]);

export function useResults() {
    const [results, setResults] = useState<ResultsState>({ status: "loading" });
    const [gallery, setGallery] = useState<GalleryState>(initialGallery);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadMoreFailed, setLoadMoreFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const loadingMoreRef = useRef(false);

    useEffect(() => {
        const request = new AbortController();

        async function load() {
            const signal = timeoutSignal(request.signal);
            const [winners, firstPage] = await Promise.allSettled([
                getResults(signal),
                getResultMemes(1, GALLERY_PAGE_SIZE, signal),
            ]);
            if (request.signal.aborted) return;

            if (winners.status === "rejected") {
                setResults({ status: "error" });
            } else if (!winners.value?.length) {
                setResults({ status: "unpublished" });
            } else {
                setResults({ status: "ready", winners: winners.value });
            }

            setGallery(firstPage.status === "fulfilled"
                ? { status: "ready", items: firstPage.value.items, page: 1, hasMore: firstPage.value.hasMore }
                : { ...initialGallery, status: "error" });
        }

        void load();
        return () => request.abort();
    }, [attempt]);

    async function loadMore() {
        if (loadingMoreRef.current || !gallery.hasMore) return;

        loadingMoreRef.current = true;
        setLoadingMore(true);
        setLoadMoreFailed(false);

        try {
            const next = await getResultMemes(gallery.page + 1, GALLERY_PAGE_SIZE, timeoutSignal());
            setGallery(current => {
                const known = new Set(current.items.map(meme => meme.id));
                return {
                    status: "ready",
                    items: [...current.items, ...next.items.filter(meme => !known.has(meme.id))],
                    page: next.page,
                    hasMore: next.hasMore,
                };
            });
        } catch {
            setLoadMoreFailed(true);
        } finally {
            loadingMoreRef.current = false;
            setLoadingMore(false);
        }
    }

    function retry() {
        setResults({ status: "loading" });
        setGallery(initialGallery);
        setLoadMoreFailed(false);
        setAttempt(value => value + 1);
    }

    return { results, gallery, loadingMore, loadMoreFailed, loadMore, retry };
}
