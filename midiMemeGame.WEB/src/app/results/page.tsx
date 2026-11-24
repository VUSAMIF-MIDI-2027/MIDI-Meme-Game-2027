"use client";

import { useEffect, useRef } from "react";
import { ArrowDown } from "lucide-react";
import Image from "next/image";
import midiLogo from "#/public/logos/MIDI-Logotipas-pilnas-baltas.png";
import dioCatStyles from "@/components/Shared/DioCat.module.css";
import stars from "../account/account.module.css";
import styles from "./results.module.css";
import { text } from "./pageText";
import { FlyingCat } from "@/components/FlyingCat";
import { GalleryCard } from "@/components/Results/GalleryCard";
import { WinnerCard } from "@/components/Results/WinnerCard";
import { useLanguage } from "@/context/LanguageContext";
import { useResults } from "@/hooks/useResults";

const BUTTON_CLASS = "inline-flex min-h-11 items-center justify-center gap-3 rounded border border-white/20 px-5 py-3 font-semibold transition-colors hover:border-midi-blue hover:text-[#70cfff] focus-visible:outline-2 focus-visible:outline-midi-blue";

export default function ResultsPage() {
    const { lang } = useLanguage();
    const t = text[lang];
    const { state, winners, visibleOthers, hasMore, moreStatus, loadMore, retry } = useResults();
    const moreButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const button = moreButtonRef.current;
        if (!button || !hasMore || moreStatus !== "idle" || typeof IntersectionObserver === "undefined") return;

        const observer = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) {
                observer.disconnect();
                void loadMore();
            }
        }, { rootMargin: "320px 0px" });
        observer.observe(button);
        return () => observer.disconnect();
    }, [hasMore, loadMore, moreStatus]);

    const publishedEmpty = state.status === "ready" && winners.length === 0 && visibleOthers.length === 0;
    const showResults = state.status === "ready" && !publishedEmpty;
    const noticeTitle = state.status === "ongoing" ? t.ongoingTitle
        : state.status === "unpublished" ? t.unpublishedTitle
        : publishedEmpty ? t.publishedEmpty : null;
    const noticeDescription = state.status === "ongoing" ? t.ongoing
        : state.status === "unpublished" ? t.unpublished : null;
    const memeAlt = (caption: string) => caption ? `${t.memeAlt}: ${caption}` : t.memeAlt;

    return (
        <div className="flex-1 text-white">
            <div className={stars.page}>
                <FlyingCat startSide="left" bounceOnContact />
                <div className={`${styles.content} mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-20`}>
                    <header className="text-center">
                        <div className="mx-auto max-w-xl">
                            <Image
                                src={midiLogo}
                                alt="Matematikų ir informatikų dienos"
                                loading="eager"
                                sizes="(min-width: 768px) 192px, (min-width: 640px) 176px, 144px"
                                className="pointer-events-none mx-auto mb-6 h-auto w-36 select-none sm:mb-8 sm:w-44 md:w-48"
                            />
                            <p className="text-xs font-semibold tracking-widest text-[#70cfff]">{t.eyebrow}</p>
                            <h1 className="mt-4 text-[clamp(2.25rem,7vw,5.25rem)] leading-[1.04] font-extrabold tracking-tight">
                                <span className="block">{t.title}</span>{" "}
                                <span className="block text-midi-blue">{t.titleAccent}</span>
                            </h1>
                            {showResults && (
                                <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-pretty text-white/80 sm:text-lg">{t.intro}</p>
                            )}
                        </div>
                    </header>

                    {noticeTitle && (
                        <section role="status" aria-labelledby="results-status-title" className="mt-12 rounded-xl border border-white/15 px-6 py-14 text-center sm:mt-16">
                            <h2 id="results-status-title" className="text-2xl font-bold text-midi-gray sm:text-3xl">{noticeTitle}</h2>
                            {noticeDescription && (
                                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-text-muted">{noticeDescription}</p>
                            )}
                        </section>
                    )}

                    {state.status === "loading" && (
                        <div role="status" aria-label={t.loading} className="mt-12 grid gap-6 sm:mt-16 md:grid-cols-3">
                            {[1, 2, 3].map(item => <div key={item} className="aspect-[4/5] animate-pulse rounded-xl bg-white/5 motion-reduce:animate-none" />)}
                        </div>
                    )}

                    {state.status === "error" && (
                        <div role="alert" className="mt-12 sm:mt-16">
                            <p className="text-base text-text-muted">{t.error}</p>
                            <button type="button" onClick={retry} className={`${BUTTON_CLASS} mt-4`}>{t.retry}</button>
                        </div>
                    )}

                    {showResults && (
                        <>
                            <section id="winners" aria-labelledby="winners-title" className="mt-16 scroll-mt-24 sm:mt-20 lg:mt-24">
                                <div className="mb-9 flex items-end justify-between gap-3 sm:mb-12">
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-midi-white">{t.winnersEyebrow}</p>
                                        <h2 id="winners-title" className="mt-5 text-4xl font-bold leading-tight text-midi-gray sm:text-5xl">{t.winnersTitle}</h2>
                                    </div>
                                    <span aria-hidden="true" className={dioCatStyles.cat + " " + styles.dioCat} />
                                </div>

                                <div className="grid grid-cols-2 items-start gap-3 sm:gap-4 md:grid-cols-3 md:gap-6">
                                    {winners.map(winner => (
                                        <WinnerCard
                                            key={winner.id}
                                            winner={winner}
                                            placeLabel={t.places[winner.place - 1]}
                                            imageAlt={memeAlt(winner.caption)}
                                            fallbackLabel={t.imageUnavailable}
                                            scoreLabel={t.points(winner.score)}
                                        />
                                    ))}
                                </div>
                            </section>

                            <section aria-labelledby="gallery-title" className="mt-14 border-t border-white/15 pt-12 sm:mt-18 sm:pt-16">
                                <div className="mb-7 sm:mb-9">
                                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-midi-white">{t.galleryEyebrow}</p>
                                    <h2 id="gallery-title" className="mt-5 text-4xl font-bold leading-tight text-midi-gray sm:text-5xl">{t.galleryTitle}</h2>
                                </div>

                                {visibleOthers.length === 0 ? (
                                    <p className="rounded-xl border border-white/15 px-6 py-12 text-center text-text-muted">{t.galleryEmpty}</p>
                                ) : (
                                    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {visibleOthers.map(meme => (
                                            <li key={meme.id} className="min-w-0">
                                                <GalleryCard
                                                    meme={meme}
                                                    imageAlt={memeAlt(meme.caption)}
                                                    fallbackLabel={t.imageUnavailable}
                                                    scoreLabel={t.points(meme.score)}
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {hasMore && (
                                    <div className="mt-10 flex flex-col items-center gap-3">
                                        {moreStatus === "error" && <p role="alert" className="text-sm text-rose-200">{t.loadMoreError}</p>}
                                        <button
                                            ref={moreButtonRef}
                                            type="button"
                                            onClick={() => void loadMore()}
                                            disabled={moreStatus === "loading"}
                                            className={BUTTON_CLASS + " disabled:cursor-wait"}
                                        >
                                            {moreStatus === "loading" ? t.loadingMore : moreStatus === "error" ? t.retry : t.loadMore}
                                            {moreStatus === "idle" && <ArrowDown aria-hidden="true" className="size-4" />}
                                        </button>
                                        <span role="status" className="sr-only">{moreStatus === "loading" ? t.loadingMore : ""}</span>
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
