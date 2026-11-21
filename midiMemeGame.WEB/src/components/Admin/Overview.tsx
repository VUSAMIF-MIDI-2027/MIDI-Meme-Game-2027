"use client";

import { useState, type ComponentProps } from "react";
import MemeCard from "@/components/Shared/MemeCard";
import { useLanguage } from "@/context/LanguageContext";
import { overviewText } from "./overviewText";

export interface CompetitionMemeCounts {
    totalMemes: number;
    pendingApproval: number;
    approved: number;
    rejected: number;
    currentStage: string;
}

export interface CompetitionMeme {
    id: string;
    image: ComponentProps<typeof MemeCard>["image"];
    imageAlt: string;
    caption: string;
    author: string;
    votes: number;
}

export function Overview({
    onReview,
}: {
    onReview?: () => void;
}) {
    // const { getToken } = useAuth();
    const { lang } = useLanguage();
    const t = overviewText[lang];
    // const request = useRef<AbortController | null>(null);

    const [counts] = useState<CompetitionMemeCounts>({
        totalMemes: 0,
        pendingApproval: 0,
        approved: 0,
        rejected: 0,
        currentStage: "-",
    });
    const [topMemes] = useState<CompetitionMeme[]>([]);
    const [loading] = useState<boolean>(false);

    // useEffect(() => {
    //     const controller = new AbortController();
    //     request.current = controller;
    //
    //     async function loadOverview() {
    //         setLoading(true);
    //         try {
    //             const signal = AbortSignal.any([
    //                 controller.signal,
    //                 AbortSignal.timeout(20_000),
    //             ]);
    //             const token = await getToken();
    //             signal.throwIfAborted();
    //             if (!token) throw new Error("401 ADD LATER");
    //
    //             const [nextCounts, nextMemes] = await Promise.all([
    //                 getMemeCounts(token, signal),
    //                 getTopMemes(token, signal),
    //             ]);
    //
    //             if (!controller.signal.aborted) {
    //                 setCounts(nextCounts);
    //                 setTopMemes(nextMemes);
    //             }
    //         } catch (cause) {
    //             if (!controller.signal.aborted) {
    //                 console.error("Failed to load competition overview:", cause);
    //             }
    //         } finally {
    //             if (request.current === controller) {
    //                 request.current = null;
    //             }
    //             if (!controller.signal.aborted) {
    //                 setLoading(false);
    //             }
    //         }
    //     }
    //
    //     void loadOverview();
    //
    //     return () => {
    //         controller.abort();
    //     };
    // }, [getToken]);

    const metrics: { label: string; value: string | number; highlight?: boolean }[] = [
        { label: t.totalMemes, value: "-" },
        { label: t.pendingApproval, value: "-" },
        { label: t.approved, value: "-" },
        { label: t.rejected, value: "-" },
        { label: t.currentStage, value: "-", highlight: true },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {t.title}
                </h1>
                <button
                    type="button"
                    onClick={onReview}
                    className="inline-flex min-h-10 w-fit cursor-pointer items-center justify-center rounded-lg bg-midi-blue px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue"
                >
                    {t.reviewPending}
                </button>
            </div>

            <section
                aria-label={t.metricsLabel}
                className="grid grid-cols-2 divide-y divide-white/15 overflow-hidden rounded-xl border border-white/15 bg-[#0d1013] sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:grid-cols-5"
            >
                {metrics.map((metric) => (
                    <div
                        key={metric.label}
                        className={`flex items-baseline justify-between gap-4 px-4 py-3.5 ${
                            metric.highlight
                                ? "col-span-2 bg-white/[0.06] sm:col-span-1"
                                : "bg-[#0d1013]"
                        }`}
                    >
                        <span className="text-xs font-medium text-white/60">
                            {metric.label}
                        </span>
                        <span
                            className={`text-right tabular-nums ${
                                metric.highlight
                                    ? "text-sm font-bold text-white"
                                    : "text-xl font-bold text-white"
                            }`}
                        >
                            {metric.value}
                        </span>
                    </div>
                ))}
            </section>

            <section className="space-y-4 rounded-xl border border-white/15 bg-[#0d1013] p-5 sm:p-6">
                <h2 className="text-lg font-bold text-white">{t.topMemes}</h2>

                {loading && topMemes.length === 0 ? (
                    <p className="text-sm text-white/55">{t.loadingMemes}</p>
                ) : topMemes.length === 0 ? (
                    <p className="text-sm text-white/55">{t.noMemes}</p>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        {topMemes.map((meme) => (
                            <MemeCard
                                key={meme.id}
                                image={meme.image}
                                imageAlt={meme.imageAlt}
                                caption={meme.caption}
                                metaLabel={meme.author}
                                status={{
                                    label: `${meme.votes} ${t.votes}`,
                                    className:
                                        "text-midi-blue font-semibold normal-case tracking-normal",
                                }}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}