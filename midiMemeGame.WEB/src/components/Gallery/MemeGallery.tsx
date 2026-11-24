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

        void load();
        return () => {
            controller.abort();
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [photoId]);

    return (
        <div className="relative flex aspect-[3/2] w-full items-center justify-center bg-neutral-900">
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
    const disabled = pending || (!voted && !canVote);
    const label = `${voted ? t.removeVote : !canVote ? t.voteLimit : t.vote}: ${meme.caption}`;
    return (
        <li className={`flex flex-col overflow-hidden rounded-2xl border bg-[#0a0a0a] transition-colors ${voted ? "border-rose-500/60" : "border-white/15"}`}>
            <GalleryImage photoId={meme.sourcePhotoId} caption={meme.caption} t={t} />
            <div className="flex flex-1 flex-col justify-between gap-4 p-4 sm:p-5">
                <div className="min-w-0">
                    <p className="text-base leading-snug font-bold text-midi-gray text-pretty sm:text-lg">{meme.caption}</p>
                    {meme.userName && (
                        <p className="mt-1.5 truncate text-sm text-text-muted">{t.by}: {meme.userName}</p>
                    )}
                </div>
                <button
                    type="button" aria-pressed={voted} aria-label={label} title={label} disabled={disabled} onClick={onToggle}
                    className={`inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center self-start rounded-full border px-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-400 disabled:cursor-not-allowed ${voted ? "border-rose-500/60 bg-rose-500/15" : disabled ? "border-white/10" : "border-white/25 hover:border-rose-400 hover:bg-rose-500/10"}`}
                >
                    <Heart
                        aria-hidden="true"
                        key={voted ? "on" : "off"}
                        className={`size-5 transition-colors ${voted ? "fill-rose-500 text-rose-500 motion-safe:animate-[heartPop_400ms_ease-out]" : disabled ? "text-white/25" : "text-white"} ${pending ? "motion-safe:animate-pulse" : ""}`}
                    />
                </button>
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
    const { state, retry, toggleVote, pendingIds, voteFailed, votePending } = useGalleryMemes();

    if (state.status === "loading") return <Skeleton label={t.loading} />;

    if (state.status === "error") {
        return <GalleryMessage title={t.loadErrorTitle} description={t.errorDescription} action={{ label: t.retry, onClick: retry }} />;
    }

    const { memes, votes } = state;
    const votedCount = votes.votedMemeIds.length;
    const total = votes.remainingVotes + votedCount;
    const canVote = votes.remainingVotes > 0;
    const items = memes.map(meme => ({ ...meme, hasVoted: votes.votedMemeIds.includes(meme.id) }));

    return (
        <>
            <VoteTracker left={votes.remainingVotes} total={total} t={t} />
            {voteFailed && (
                <p role="alert" className="mb-6 rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {t.voteFailed}
                </p>
            )}

            <h2 className="mb-6 text-2xl font-extrabold tracking-tight text-midi-white sm:text-3xl">
                {t.fullRanking} <span className="ml-2 text-sm font-semibold text-text-muted">{t.memeCount(items.length)}</span>
            </h2>
            {items.length === 0 ? (
                <GalleryMessage title={t.emptyTitle} description={t.empty} />
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
        </>
    );
}
