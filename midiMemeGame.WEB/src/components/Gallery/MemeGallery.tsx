"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAuth } from "@clerk/react";
import { Heart } from "lucide-react";
import { galleryText } from "@/app/dashboard/gallery/galleryText";
import { GalleryMessage } from "@/components/Gallery/GalleryMessage";
import { useLanguage } from "@/context/LanguageContext";
import { useGalleryMemes } from "@/hooks/useGalleryMemes";
import type { GalleryMeme } from "@/services/memeGalleryService";
import { getPhotoBlob } from "@/services/userService";

const SKELETON_COUNT = 6;
const LOAD_AHEAD_MARGIN = "320px 0px";

function VoteTracker({ left, total, t }: { left: number; total: number; t: (typeof galleryText)["en"] }) {
    return (
        <div className="sticky top-3 z-20 mb-10 flex items-center justify-between gap-4 rounded-2xl border border-midi-blue/50 bg-[#0a0a0a]/90 px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md">
            <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#70cfff]">{t.yourVotes}</p>
                <p role="status" aria-live="polite" className="mt-1 truncate text-sm font-semibold text-white sm:text-base">
                    {left === 0 ? t.allVotesUsed : t.votesLeft(left)}
                </p>
            </div>
            <div className="flex items-center gap-2.5" aria-hidden="true">
                {Array.from({ length: total }, (_, i) => (
                    <Heart
                        key={i}
                        className={`size-8 transition-all duration-300 sm:size-9 ${i < left ? "fill-rose-500 text-rose-500" : "text-white/25"}`}
                    />
                ))}
            </div>
            <span className="sr-only">{left}/{total}</span>
        </div>
    );
}

type Strings = (typeof galleryText)["en"];

function GalleryImage({ photoId, caption, t }: { photoId: number; caption: string; t: Strings }) {
    const { getToken } = useAuth();
    const getTokenRef = useRef(getToken);
    useEffect(() => { getTokenRef.current = getToken; });
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [failed, setFailed] = useState(false);
    const imageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const controller = new AbortController();
        let objectUrl: string | null = null;

        async function load() {
            try {
                const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(20_000)]);
                const token = await getTokenRef.current();
                signal.throwIfAborted();
                if (!token) throw new Error("Not signed in.");
                const blob = await getPhotoBlob(photoId, token, signal);
                if (controller.signal.aborted) return;
                objectUrl = URL.createObjectURL(blob);
                setImageUrl(objectUrl);
            } catch (cause) {
                if (!controller.signal.aborted) {
                    console.error(`Failed to load photo ${photoId}:`, cause);
                    setFailed(true);
                }
            }
        }

        const image = imageRef.current;
        let observer: IntersectionObserver | undefined;
        if (image && typeof IntersectionObserver !== "undefined") {
            observer = new IntersectionObserver(entries => {
                if (entries.some(entry => entry.isIntersecting) && !controller.signal.aborted) {
                    observer?.disconnect();
                    void load();
                }
            }, { rootMargin: LOAD_AHEAD_MARGIN });
            observer.observe(image);
        } else {
            void load();
        }

        return () => {
            observer?.disconnect();
            controller.abort();
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [photoId]);

    return (
        <div ref={imageRef} className="relative flex aspect-[3/2] w-full items-center justify-center bg-neutral-900">
            {imageUrl ? (
                <Image src={imageUrl} alt={caption} fill unoptimized sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
            ) : failed ? (
                <span className="px-4 text-center text-sm text-rose-400">{t.photoFailed}</span>
            ) : (
                <span className="text-sm text-white/50 motion-safe:animate-pulse">{t.loadingPhoto}</span>
            )}
        </div>
    );
}

function GalleryCard({ meme, canVote, pending, onToggle, t }: { meme: GalleryMeme; canVote: boolean; pending: boolean; onToggle: () => void; t: Strings }) {
    const voted = meme.hasVoted;
    const ownMemeBlocked = meme.isOwnMeme && !voted;
    const disabled = pending || (!voted && (!canVote || meme.isOwnMeme));
    const action = ownMemeBlocked ? t.ownMemeVote : voted ? t.removeVote : !canVote ? t.voteLimit : t.vote;
    const label = `${action}: ${meme.caption}`;
    const frameStyle = meme.isOwnMeme ? "border-[#70cfff]" : voted ? "border-rose-500 ring-2 ring-rose-500" : "border-white/15";
    return (
        <li className="flex min-w-0 flex-col gap-1">
            <figure className={`flex flex-1 flex-col overflow-hidden rounded-2xl border bg-[#0a0a0a] transition-colors ${frameStyle}`}>
                <div className="relative">
                    <GalleryImage photoId={meme.sourcePhotoId} caption={meme.caption} t={t} />
                    {meme.isOwnMeme && (
                        <span className="absolute top-3 left-3 rounded-lg bg-[#70cfff] px-3 py-1.5 text-sm font-extrabold text-black shadow-md">
                            {t.ownMeme}
                        </span>
                    )}
                </div>
                <figcaption className="grid min-h-20 flex-1 place-items-center bg-white px-5 py-4 text-center text-lg leading-snug font-semibold wrap-anywhere text-black">
                    {meme.caption}
                </figcaption>
            </figure>
            <div className="flex items-center justify-center gap-2 px-3">
                <button
                    type="button" aria-pressed={voted} aria-label={label} title={label} disabled={disabled} onClick={onToggle}
                    className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md text-white transition-colors enabled:hover:text-rose-400 focus-visible:outline-2 focus-visible:outline-rose-400 disabled:cursor-not-allowed disabled:text-white/25"
                >
                    <Heart
                        aria-hidden="true"
                        key={voted ? "on" : "off"}
                        className={`size-6 ${voted ? "fill-rose-500 text-rose-500 motion-safe:animate-[heartPop_400ms_ease-out]" : ""} ${pending ? "motion-safe:animate-pulse" : ""}`}
                    />
                </button>
                {(meme.userName || ownMemeBlocked) && (
                    <div className="min-w-0 text-sm leading-snug text-text-muted">
                        {meme.userName && <p className="truncate">{t.by}: {meme.userName}</p>}
                        {ownMemeBlocked && <p>{t.ownMemeVote}</p>}
                    </div>
                )}
            </div>
        </li>
    );
}

function Skeleton({ label }: { label: string }) {
    return (
        <div role="status" aria-live="polite">
            <span className="sr-only">{label}</span>
            <div aria-hidden="true" className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {Array.from({ length: SKELETON_COUNT }, (_, i) => (
                    <div key={i} className="h-72 rounded-2xl border border-white/15 bg-white/5 motion-safe:animate-pulse" />
                ))}
            </div>
        </div>
    );
}

export function MemeGallery() {
    const { lang } = useLanguage();
    const t = galleryText[lang];
    const {
        state, retry, loadMore, toggleVote, pendingIds, voteFailed, votePending,
        showVoted, selectVotedFilter, votedState, retryVoted,
    } = useGalleryMemes();
    const moreButtonRef = useRef<HTMLButtonElement>(null);
    const canAutoLoad = !showVoted && state.status === "ready" && state.nextAfterId !== null && state.moreStatus === "idle";

    useEffect(() => {
        const button = moreButtonRef.current;
        if (!canAutoLoad || !button || typeof IntersectionObserver === "undefined") return;

        const observer = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) {
                observer.disconnect();
                void loadMore();
            }
        }, { rootMargin: LOAD_AHEAD_MARGIN });
        observer.observe(button);
        return () => observer.disconnect();
    }, [canAutoLoad, loadMore]);

    if (state.status === "loading") return <Skeleton label={t.loading} />;

    if (state.status === "error") {
        return <GalleryMessage title={t.loadErrorTitle} description={t.errorDescription} action={{ label: t.retry, onClick: retry }} />;
    }

    const { memes, votes, nextAfterId, moreStatus } = state;
    const hasMore = !showVoted && nextAfterId !== null;
    const votedCount = votes.votedMemeIds.length;
    const total = votes.remainingVotes + votedCount;
    const canVote = votes.remainingVotes > 0;
    const activeMemes = votedState?.status === "ready" ? votedState.memes : memes;
    const items = activeMemes
        .map(meme => ({ ...meme, hasVoted: votes.votedMemeIds.includes(meme.id) }))
        .filter(meme => !showVoted || meme.hasVoted);

    return (
        <>
            <VoteTracker left={votes.remainingVotes} total={total} t={t} />
            {voteFailed && (
                <p role="alert" className="mb-6 rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {t.voteFailed}
                </p>
            )}

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-extrabold tracking-tight text-midi-white sm:text-3xl">
                    {showVoted ? t.votedMemes : t.fullRanking}{" "}
                    {!votedState || votedState.status === "ready" ? (
                        <span className="ml-2 text-sm font-semibold text-text-muted">
                            {hasMore ? t.loadedCount(items.length) : t.memeCount(items.length)}
                        </span>
                    ) : null}
                </h2>
                <div role="group" aria-label={t.galleryFilter} className="inline-flex gap-1 rounded-xl bg-white/5 p-1">
                    {[false, true].map(voted => (
                        <button
                            key={String(voted)}
                            type="button"
                            aria-pressed={showVoted === voted}
                            onClick={() => selectVotedFilter(voted)}
                            className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue ${showVoted === voted ? "bg-midi-blue text-white" : "text-white/75 hover:bg-white/10 hover:text-white"}`}
                        >
                            {voted ? <Heart aria-hidden="true" className="size-4" /> : null}
                            {voted ? t.votedMemes : t.fullRanking}
                        </button>
                    ))}
                </div>
            </div>
            {votedState?.status === "loading" ? (
                <p role="status" className="py-8 text-center text-text-muted">{t.loading}</p>
            ) : votedState?.status === "error" ? (
                <GalleryMessage title={t.loadErrorTitle} description={t.errorDescription} action={{ label: t.retry, onClick: retryVoted }} />
            ) : items.length === 0 ? (
                showVoted
                    ? <p role="status" className="rounded-2xl border border-white/15 px-6 py-10 text-center text-text-muted">{t.noVotedMemes}</p>
                    : <GalleryMessage title={t.emptyTitle} description={t.empty} />
            ) : (
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                    {items.map(meme => (
                        <GalleryCard
                            key={meme.id}
                            meme={meme}
                            canVote={canVote}
                            pending={votePending || pendingIds.has(meme.id)}
                            onToggle={() => void toggleVote(meme.id, !meme.hasVoted)}
                            t={t}
                        />
                    ))}
                </ul>
            )}

            {hasMore && (
                <div className="mt-8 flex flex-col items-center gap-3">
                    {moreStatus === "error" && (
                        <p role="alert" className="text-sm text-rose-200">{t.loadMoreError}</p>
                    )}
                    <button
                        ref={moreButtonRef}
                        type="button"
                        disabled={moreStatus === "loading"}
                        onClick={() => void loadMore()}
                        className="min-h-11 rounded-lg border border-midi-blue/60 px-5 py-2 text-sm font-bold text-white hover:bg-midi-blue/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue disabled:cursor-wait"
                    >
                        {moreStatus === "loading" ? t.loading : moreStatus === "error" ? t.retry : t.showMore}
                    </button>
                    <span role="status" className="sr-only">{moreStatus === "loading" ? t.loading : ""}</span>
                </div>
            )}
        </>
    );
}
