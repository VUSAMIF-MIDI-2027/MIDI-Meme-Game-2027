"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import {
    getGalleryMemes,
    getVoteStatus,
    setMemeVote,
    type GalleryMeme,
    type VoteStatus,
} from "@/services/memeGalleryService";

const REQUEST_TIMEOUT_MS = 20_000;


type GalleryState =
    | { status: "loading" }
    | { status: "error" }
    | {
        status: "ready";
        memes: GalleryMeme[];
        votes: VoteStatus;
        nextAfterId: number | null;
        moreStatus: "idle" | "loading" | "error";
    };

type VotedGalleryState =
    | { status: "loading" | "error" }
    | { status: "ready"; memes: GalleryMeme[] };

export function useGalleryMemes() {
    const { getToken } = useAuth();
    const [state, setState] = useState<GalleryState>({ status: "loading" });
    const [attempt, setAttempt] = useState(0);
    const [showVoted, setShowVoted] = useState(false);
    const [votedState, setVotedState] = useState<VotedGalleryState>({ status: "loading" });
    const [votedAttempt, setVotedAttempt] = useState(0);
    const [pendingIds, setPendingIds] = useState<ReadonlySet<number>>(new Set());
    const [voteFailed, setVoteFailed] = useState(false);
    const [votePending, setVotePending] = useState(false);
    const voteInFlight = useRef(false);
    const pageRequest = useRef<AbortController | null>(null);
    const nextAfterId = state.status === "ready" ? state.nextAfterId : null;
    const needsVotedPage = showVoted && state.status === "ready"
        && state.votes.votedMemeIds.some(id => !state.memes.some(meme => meme.id === id));

    useEffect(() => {
        if (!needsVotedPage) return;

        const request = new AbortController();
        const signal = AbortSignal.any([request.signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]);

        async function loadVotedMemes() {
            try {
                const token = await getToken();
                signal.throwIfAborted();
                if (!token) throw new Error("Not signed in.");
                const page = await getGalleryMemes(token, signal, 0, true);
                if (!request.signal.aborted) setVotedState({ status: "ready", memes: page.items });
            } catch {
                if (!request.signal.aborted) setVotedState({ status: "error" });
            }
        }

        void loadVotedMemes();
        return () => request.abort();
    }, [getToken, needsVotedPage, votedAttempt]);

    useEffect(() => {
        const request = new AbortController();
        const signal = AbortSignal.any([request.signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]);

        async function load() {
            try {
                const token = await getToken();
                if (!token) throw new Error("Not signed in.");
                const [page, votes] = await Promise.all([
                    getGalleryMemes(token, signal),
                    getVoteStatus(token, signal),
                ]);
                if (!request.signal.aborted) {
                    setState({
                        status: "ready",
                        memes: page.items,
                        votes,
                        nextAfterId: page.nextAfterId,
                        moreStatus: "idle",
                    });
                }
            } catch {
                if (!request.signal.aborted) setState({ status: "error" });
            }
        }

        void load();
        return () => {
            request.abort();
            pageRequest.current?.abort();
            pageRequest.current = null;
        };
    }, [attempt, getToken]);

    const loadMore = useCallback(async () => {
        if (nextAfterId === null || pageRequest.current) return;
        const request = new AbortController();
        pageRequest.current = request;
        const signal = AbortSignal.any([request.signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]);

        setState(current => current.status === "ready" && current.nextAfterId === nextAfterId
            ? { ...current, moreStatus: "loading" }
            : current);
        try {
            const token = await getToken();
            signal.throwIfAborted();
            if (!token) throw new Error("Not signed in.");
            const page = await getGalleryMemes(token, signal, nextAfterId);
            if (request.signal.aborted) return;

            setState(current => current.status === "ready" && current.nextAfterId === nextAfterId
                ? {
                    ...current,
                    memes: [...current.memes, ...page.items],
                    nextAfterId: page.nextAfterId,
                    moreStatus: "idle",
                }
                : current);
        } catch {
            if (!request.signal.aborted) {
                setState(current => current.status === "ready" && current.nextAfterId === nextAfterId
                    ? { ...current, moreStatus: "error" }
                    : current);
            }
        } finally {
            if (pageRequest.current === request) pageRequest.current = null;
        }
    }, [getToken, nextAfterId]);

    const toggleVote = useCallback(async (memeId: number, voted: boolean) => {
        if (voteInFlight.current) return;
        voteInFlight.current = true;
        setVoteFailed(false);
        setVotePending(true);
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
            voteInFlight.current = false;
            setVotePending(false);
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

    function selectVotedFilter(voted: boolean) {
        if (showVoted === voted) return;
        setShowVoted(voted);
        setVotedState({ status: "loading" });
    }

    function retryVoted() {
        setVotedState({ status: "loading" });
        setVotedAttempt(value => value + 1);
    }

    return {
        state, retry, loadMore, toggleVote, pendingIds, voteFailed, votePending,
        showVoted, selectVotedFilter, votedState: needsVotedPage ? votedState : null, retryVoted,
    };
}
