"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import {
    getGalleryMemes,
    getVoteStatus,
    setMemeVote,
    type GalleryMeme,
    type VoteStatus,
} from "@/services/memeGalleryService";

const REQUEST_TIMEOUT_MS = 20_000;

function shuffle<T>(items: readonly T[]): T[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

type GalleryState =
    | { status: "loading" }
    | { status: "error" }
    | { status: "ready"; memes: GalleryMeme[]; votes: VoteStatus };

export function useGalleryMemes() {
    const { getToken } = useAuth();
    const [state, setState] = useState<GalleryState>({ status: "loading" });
    const [attempt, setAttempt] = useState(0);
    const [pendingIds, setPendingIds] = useState<ReadonlySet<number>>(new Set());
    const [voteFailed, setVoteFailed] = useState(false);

    useEffect(() => {
        const request = new AbortController();
        const signal = AbortSignal.any([request.signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]);

        async function load() {
            try {
                const token = await getToken();
                if (!token) throw new Error("Not signed in.");
                const [memes, votes] = await Promise.all([
                    getGalleryMemes(token, signal),
                    getVoteStatus(token, signal),
                ]);
                // Shuffle once per load so ordering is fair; votes must not reorder cards.
                if (!request.signal.aborted) setState({ status: "ready", memes: shuffle(memes), votes });
            } catch {
                if (!request.signal.aborted) setState({ status: "error" });
            }
        }

        void load();
        return () => request.abort();
    }, [attempt, getToken]);

    const toggleVote = useCallback(async (memeId: number, voted: boolean) => {
        setVoteFailed(false);
        setPendingIds(current => new Set(current).add(memeId));
        try {
            const token = await getToken();
            if (!token) throw new Error("Not signed in.");
            const votes = await setMemeVote(memeId, voted, token, AbortSignal.timeout(REQUEST_TIMEOUT_MS));
            // The server response is the source of truth for remaining votes.
            setState(current => current.status === "ready" ? { ...current, votes } : current);
        } catch {
            setVoteFailed(true);
        } finally {
            setPendingIds(current => {
                const next = new Set(current);
                next.delete(memeId);
                return next;
            });
        }
    }, [getToken]);

    const retry = useCallback(() => {
        setState({ status: "loading" });
        setAttempt(value => value + 1);
    }, []);

    return { state, retry, toggleVote, pendingIds, voteFailed };
}
