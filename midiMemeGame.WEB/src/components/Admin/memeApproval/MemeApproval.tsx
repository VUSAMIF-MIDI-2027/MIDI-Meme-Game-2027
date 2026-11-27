"use client";

import { LoadingScreen } from "@/components/Loading/LoadingScreen";

import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { MEME_STATUS } from "@/services/adminService";
import { MemeFilterTabs, type MemeFilter, type MemeFilterTab } from "./MemeFilterTabs";
import { MemeReviewItem } from "./MemeReviewItem";
import { memeApprovalText } from "./memeApprovalText";
import { useAdminMemes } from "@/hooks/admin/useAdminMemes";
import { ErrorNotice } from "@/components/ErrorNotice";

export function MemeApproval() {
    const { lang } = useLanguage();
    const t = memeApprovalText[lang];

    const [activeFilter, setActiveFilter] = useState<MemeFilter>(MEME_STATUS.pending);
    const { memes, photoUrls, loading, busyMemeId, refreshing, refresh, error, updateMemeStatus } = useAdminMemes();

    const activeMemes = memes.filter((meme) => !meme.isDeleted);
    const deletedMemes = memes.filter((meme) => meme.isDeleted);

    const tabs: MemeFilterTab[] = [
        {
            id: MEME_STATUS.pending,
            label: t.pendingTab,
            count: activeMemes.filter((m) => m.statusId === MEME_STATUS.pending).length,
        },
        {
            id: MEME_STATUS.approved,
            label: t.approvedTab,
            count: activeMemes.filter((m) => m.statusId === MEME_STATUS.approved).length,
        },
        {
            id: MEME_STATUS.rejected,
            label: t.rejectedTab,
            count: activeMemes.filter((m) => m.statusId === MEME_STATUS.rejected).length,
        },
        {
            id: "deleted",
            label: t.deletedTab,
            count: deletedMemes.length,
        },
    ];

    const emptyMessages: Record<MemeFilter, string> = {
        [MEME_STATUS.pending]: t.emptyPending,
        [MEME_STATUS.approved]: t.emptyApproved,
        [MEME_STATUS.rejected]: t.emptyRejected,
        deleted: t.emptyDeleted,
    };

    const filteredMemes = activeFilter === "deleted"
        ? deletedMemes
        : activeMemes.filter((meme) => meme.statusId === activeFilter);

    if (loading) return <LoadingScreen overlay="section" />;

    return (
        <div className="space-y-6">
            <ErrorNotice error={error?.cause} scope={error?.scope} />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <MemeFilterTabs
                    tabs={tabs}
                    activeTab={activeFilter}
                    ariaLabel={t.pendingTab}
                    onSelect={setActiveFilter}
                />
                <button
                    type="button"
                    onClick={refresh}
                    disabled={refreshing || busyMemeId !== null}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold hover:bg-white/10 disabled:opacity-50"
                >
                    <RefreshCw aria-hidden="true" className={refreshing ? "size-4 animate-spin" : "size-4"} />
                    {lang === "lt" ? "Atnaujinti" : "Refresh"}
                </button>
            </div>

            {filteredMemes.length === 0 ? (
                <div className="rounded-xl border border-white/15 bg-[#0d1013] p-6 text-sm text-white/60">
                    {emptyMessages[activeFilter]}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    {filteredMemes.map((meme) => (
                        <MemeReviewItem
                            key={meme.id}
                            meme={meme}
                            imageSrc={photoUrls[meme.sourcePhotoId] ?? ""}
                            isBusy={busyMemeId === meme.id}
                            t={t}
                            onDecision={(id, statusId) => void updateMemeStatus(id, statusId)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default MemeApproval;