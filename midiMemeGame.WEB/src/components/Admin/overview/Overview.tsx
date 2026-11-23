"use client";

import { useMemo, useState, type ComponentProps } from "react";
import MemeCard from "@/components/Shared/MemeCard";
import { useLanguage } from "@/context/LanguageContext";
import { MEME_STATUS } from "@/services/adminService";
import { OverviewMetrics, type OverviewMetric } from "./OverviewMetrics";
import { resolveCurrentStage } from "./overviewStage";
import { useOverviewData } from "@/hooks/admin/useOverviewData";
import { overviewText } from "./overviewText";

export interface CompetitionMemeCounts {
    totalMemes: number;
    pendingApproval: number;
    approved: number;
    rejected: number;
    currentStage: string;
}

export interface CompetitionMeme {
    id: number;
    image: ComponentProps<typeof MemeCard>["image"];
    imageAlt: string;
    caption: string;
    score: number;
}

const TOP_MEMES_LIMIT = 10;

export function Overview() {
    const { lang } = useLanguage();
    const t = overviewText[lang];
    const { memes, schedule, photoUrls, loading } = useOverviewData();
    const [showAllMemes, setShowAllMemes] = useState(false);

    const counts: CompetitionMemeCounts = useMemo(
        () => ({
            totalMemes: memes.length,
            pendingApproval: memes.filter((m) => m.statusId === MEME_STATUS.pending).length,
            approved: memes.filter((m) => m.statusId === MEME_STATUS.approved).length,
            rejected: memes.filter((m) => m.statusId === MEME_STATUS.rejected).length,
            currentStage: loading ? "-" : resolveCurrentStage(schedule, lang),
        }),
        [memes, schedule, loading, lang]
    );

    const sortedMemes: CompetitionMeme[] = useMemo(
        () =>
            [...memes]
                .sort((a, b) => b.score - a.score)
                .map((meme) => ({
                    id: meme.id,
                    image: photoUrls[meme.sourcePhotoId] ?? "",
                    imageAlt: `${meme.caption} (#${meme.sourcePhotoId})`,
                    caption: meme.caption,
                    score: Math.trunc(meme.score),
                })),
        [memes, photoUrls]
    );

    const displayedMemes = showAllMemes
        ? sortedMemes
        : sortedMemes.slice(0, TOP_MEMES_LIMIT);

    const metrics: OverviewMetric[] = [
        { label: t.totalMemes, value: loading ? "-" : counts.totalMemes },
        { label: t.pendingApproval, value: loading ? "-" : counts.pendingApproval },
        { label: t.approved, value: loading ? "-" : counts.approved },
        { label: t.rejected, value: loading ? "-" : counts.rejected },
        { label: t.currentStage, value: counts.currentStage, highlight: true },
    ];

    const sectionTitle = showAllMemes
        ? lang === "lt"
            ? `Visi memai (${sortedMemes.length})`
            : `All memes (${sortedMemes.length})`
        : t.topMemes;

    const toggleLabel = showAllMemes
        ? lang === "lt"
            ? `Rodyti tik top ${TOP_MEMES_LIMIT}`
            : `Show top ${TOP_MEMES_LIMIT}`
        : lang === "lt"
          ? "Žiūrėti visus memus"
          : "View all memes";

    return (
        <div className="space-y-6">
            <OverviewMetrics ariaLabel={t.metricsLabel} metrics={metrics} />

            <section className="space-y-4 rounded-xl border border-white/15 bg-[#0d1013] p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-bold text-white">{sectionTitle}</h2>

                    {sortedMemes.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setShowAllMemes((prev) => !prev)}
                            className="inline-flex min-h-9 cursor-pointer items-center rounded-lg border border-white/15 bg-[#0b0f12] px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:border-midi-blue hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue"
                        >
                            {toggleLabel}
                        </button>
                    )}
                </div>

                {loading && displayedMemes.length === 0 ? (
                    <p className="text-sm text-white/55">{t.loadingMemes}</p>
                ) : displayedMemes.length === 0 ? (
                    <p className="text-sm text-white/55">{t.noMemes}</p>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        {displayedMemes.map((meme) => (
                            <MemeCard
                                key={meme.id}
                                image={meme.image}
                                imageAlt={meme.imageAlt}
                                caption={meme.caption}
                                status={{
                                    label: `${meme.score} ${t.votes}`,
                                    className:
                                        "text-midi-blue font-semibold normal-case tracking-normal tabular-nums",
                                }}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}