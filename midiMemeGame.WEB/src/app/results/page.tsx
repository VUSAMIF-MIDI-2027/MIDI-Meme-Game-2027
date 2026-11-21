"use client";

import { ArrowDown } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import stars from "../account/account.module.css";
import styles from "./results.module.css";
import { text } from "./pageText";
import { EmptyWinnerCard } from "@/components/Results/EmptyWinnerCard";
import { FlyingCat } from "@/components/FlyingCat";
import { GalleryCard } from "@/components/Results/GalleryCard";
import { WinnerCard } from "@/components/Results/WinnerCard";
import { useLanguage } from "@/context/LanguageContext";
import { useResults } from "@/hooks/useResults";

const buttonClass = "inline-flex min-h-11 items-center justify-center gap-3 rounded border border-white/20 px-5 py-3 font-semibold transition-colors hover:border-midi-blue hover:text-[#70cfff] focus-visible:outline-2 focus-visible:outline-midi-blue disabled:cursor-wait disabled:opacity-60";

export default function ResultsPage() {
    const { lang } = useLanguage();
    const t = text[lang];
    const { results, gallery, loadingMore, loadMoreFailed, loadMore, retry } = useResults();

    const winners = useMemo(() => results.status === "ready" ? results.winners : [], [results]);

    // Winners never repeat in the gallery, even if the API still returns them.
    const otherMemes = useMemo(() => {
        const winnerIds = new Set(winners.map(winner => winner.id).filter(Boolean));
        const winnerImages = new Set(winners.map(winner => `${winner.imageUrl}|${winner.caption}`));
        return gallery.items.filter(meme =>
            !(meme.id && winnerIds.has(meme.id)) && !winnerImages.has(`${meme.imageUrl}|${meme.caption}`));
    }, [winners, gallery.items]);

    const published = results.status === "ready";
    const memeAlt = (caption: string) => caption ? `${t.memeAlt}: ${caption}` : t.memeAlt;

    return (
        <div className="flex-1 text-white">
            <div className={stars.page}>
                <FlyingCat startSide="left" bounceOnContact />
                <div className={`${styles.content} mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-20`}>
                    <header className="grid items-center gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:gap-8">
                        <div>
                            <p className="text-xs font-semibold tracking-widest text-[#70cfff]">{t.eyebrow}</p>
                            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-6xl">{t.title}</h1>
                            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">{t.intro}</p>
                        </div>
                        <Image
                            src="/cats/diocat.svg"
                            width={250}
                            height={250}
                            alt=""
                            loading="eager"
                            className="pointer-events-none w-full max-w-40 justify-self-center select-none [image-rendering:pixelated] md:max-w-56"
                        />
                    </header>

                    <section id="winners" aria-labelledby="winners-title" className="mt-12 scroll-mt-24 sm:mt-16">
                        <div className="mb-7 sm:mb-9">
                            <p className="text-xs font-bold uppercase tracking-[0.12em] text-midi-white">{t.winnersEyebrow}</p>
                            <h2 id="winners-title" className="mt-5 text-4xl font-bold leading-tight text-midi-gray sm:text-5xl">{t.winnersTitle}</h2>
                        </div>

                        {results.status === "loading" && (
                            <div role="status" aria-label={t.loading} className="grid gap-6 md:grid-cols-3">
                                {[1, 2, 3].map(item => <div key={item} className="aspect-[4/5] animate-pulse rounded-xl bg-white/5 motion-reduce:animate-none" />)}
                            </div>
                        )}
                        {published && (
                            <div className="grid gap-6 md:grid-cols-3 md:items-start">
                                {winners.map(winner => (
                                    <WinnerCard
                                        key={winner.place}
                                        winner={winner}
                                        placeLabel={t.places[winner.place - 1]}
                                        imageAlt={memeAlt(winner.caption)}
                                        fallbackLabel={t.imageUnavailable}
                                    />
                                ))}
                            </div>
                        )}
                        {(results.status === "unpublished" || results.status === "error") && (
                            <div role="status" aria-label={t.emptyPodium} className="grid gap-6 md:grid-cols-3 md:items-start">
                                {([1, 2, 3] as const).map(place => (
                                    <EmptyWinnerCard key={place} place={place} placeLabel={t.places[place - 1]} />
                                ))}
                            </div>
                        )}
                        {results.status === "error" && (
                            <div role="alert" className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2">
                                <p className="text-sm text-text-muted">{t.error}</p>
                                <button type="button" onClick={retry} className={buttonClass}>{t.retry}</button>
                            </div>
                        )}
                    </section>

                    {results.status !== "loading" && (
                        <section aria-labelledby="gallery-title" className="mt-14 border-t border-white/15 pt-12 sm:mt-18 sm:pt-16">
                            <div className="mb-7 sm:mb-9">
                                <p className="text-xs font-bold uppercase tracking-[0.12em] text-midi-white">{t.galleryEyebrow}</p>
                                <h2 id="gallery-title" className="mt-5 text-4xl font-bold leading-tight text-midi-gray sm:text-5xl">{t.galleryTitle}</h2>
                            </div>

                            {published && gallery.status === "error" && (
                                <div role="alert">
                                    <p className="text-base text-text-muted">{t.galleryError}</p>
                                    <button type="button" onClick={retry} className={`${buttonClass} mt-4`}>{t.retry}</button>
                                </div>
                            )}
                            {(gallery.status === "ready" || !published) && otherMemes.length === 0 && !gallery.hasMore && (
                                <div role="status" className="rounded-xl border border-white/15 px-6 py-12 text-center">
                                    <h3 className="text-xl font-bold uppercase tracking-wide text-white">{t.galleryEmptyTitle}</h3>
                                    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-text-muted">{t.galleryEmpty}</p>
                                </div>
                            )}
                            {otherMemes.length > 0 && (
                                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {otherMemes.map(meme => (
                                        <li key={meme.id || `${meme.imageUrl}|${meme.caption}`} className="flex min-w-0">
                                            <div className="flex w-full">
                                                <GalleryCard meme={meme} imageAlt={memeAlt(meme.caption)} fallbackLabel={t.imageUnavailable} />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {gallery.status === "ready" && gallery.hasMore && (
                                <div className="mt-10 flex flex-col items-center gap-3">
                                    <button type="button" onClick={() => void loadMore()} disabled={loadingMore} aria-busy={loadingMore} className={buttonClass}>
                                        {loadingMore ? t.loadingMore : t.loadMore}
                                        <ArrowDown aria-hidden="true" className="size-4" />
                                    </button>
                                    {loadMoreFailed && <p role="alert" className="text-sm text-amber-200">{t.loadMoreError}</p>}
                                </div>
                            )}
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
