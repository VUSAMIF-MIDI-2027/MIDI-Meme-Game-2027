"use client";

import { ArrowDown } from "lucide-react";
import Image from "next/image";
import stars from "../account/account.module.css";
import styles from "./results.module.css";
import { text } from "./pageText";
import { FlyingCat } from "@/components/FlyingCat";
import { EmptyWinnerCard } from "@/components/Results/EmptyWinnerCard";
import { GalleryCard } from "@/components/Results/GalleryCard";
import { WinnerCard } from "@/components/Results/WinnerCard";
import { useLanguage } from "@/context/LanguageContext";
import { useResults } from "@/hooks/useResults";

const BUTTON_CLASS = "inline-flex min-h-11 items-center justify-center gap-3 rounded border border-white/20 px-5 py-3 font-semibold transition-colors hover:border-midi-blue hover:text-[#70cfff] focus-visible:outline-2 focus-visible:outline-midi-blue";

export default function ResultsPage() {
    const { lang } = useLanguage();
    const t = text[lang];
    const { state, winners, visibleOthers, hasMore, loadMore, retry } = useResults();

    const showResults = state.status === "ready" || state.status === "unpublished";
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

                    {state.status === "ongoing" && (
                        <section role="status" aria-labelledby="ongoing-title" className="mt-12 rounded-xl border border-white/15 px-6 py-14 text-center sm:mt-16">
                            <h2 id="ongoing-title" className="text-2xl font-bold text-midi-gray sm:text-3xl">{t.ongoingTitle}</h2>
                            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-text-muted">{t.ongoing}</p>
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
                            <section id="winners" aria-labelledby="winners-title" className="mt-12 scroll-mt-24 sm:mt-16">
                                <div className="mb-7 sm:mb-9">
                                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-midi-white">{t.winnersEyebrow}</p>
                                    <h2 id="winners-title" className="mt-5 text-4xl font-bold leading-tight text-midi-gray sm:text-5xl">{t.winnersTitle}</h2>
                                </div>

                                {state.status === "ready" ? (
                                    <div className="grid gap-6 md:grid-cols-3 md:items-start">
                                        {winners.map(winner => (
                                            <WinnerCard
                                                key={winner.id}
                                                winner={winner}
                                                placeLabel={t.places[winner.place - 1]}
                                                imageAlt={memeAlt(winner.caption)}
                                                fallbackLabel={t.imageUnavailable}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div role="status" aria-label={t.emptyPodium} className="grid gap-6 md:grid-cols-3 md:items-start">
                                        {([1, 2, 3] as const).map(place => (
                                            <EmptyWinnerCard key={place} place={place} placeLabel={t.places[place - 1]} />
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section aria-labelledby="gallery-title" className="mt-14 border-t border-white/15 pt-12 sm:mt-18 sm:pt-16">
                                <div className="mb-7 sm:mb-9">
                                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-midi-white">{t.galleryEyebrow}</p>
                                    <h2 id="gallery-title" className="mt-5 text-4xl font-bold leading-tight text-midi-gray sm:text-5xl">{t.galleryTitle}</h2>
                                </div>

                                {visibleOthers.length === 0 ? (
                                    <div role="status" className="rounded-xl border border-white/15 px-6 py-12 text-center">
                                        <h3 className="text-xl font-bold uppercase tracking-wide text-white">{t.galleryEmptyTitle}</h3>
                                        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-text-muted">{t.galleryEmpty}</p>
                                    </div>
                                ) : (
                                    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {visibleOthers.map(meme => (
                                            <li key={meme.id} className="min-w-0">
                                                <GalleryCard meme={meme} imageAlt={memeAlt(meme.caption)} fallbackLabel={t.imageUnavailable} />
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {hasMore && (
                                    <div className="mt-10 flex justify-center">
                                        <button type="button" onClick={loadMore} className={BUTTON_CLASS}>
                                            {t.loadMore}
                                            <ArrowDown aria-hidden="true" className="size-4" />
                                        </button>
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
