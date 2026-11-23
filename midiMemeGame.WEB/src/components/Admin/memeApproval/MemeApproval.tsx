"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { MEME_STATUS, type MemeStatusId } from "@/services/adminService";
import { MemeFilterTabs, type MemeFilterTab } from "./MemeFilterTabs";
import { MemeReviewItem } from "./MemeReviewItem";
import { memeApprovalText } from "./memeApprovalText";
import { useAdminMemes } from "@/hooks/admin/useAdminMemes";

export function MemeApproval() {
    const { lang } = useLanguage();
    const t = memeApprovalText[lang];

    const [activeFilter, setActiveFilter] = useState<MemeStatusId>(MEME_STATUS.pending);
    const { memes, photoUrls, loading, busyMemeId, error, updateMemeStatus } =
        useAdminMemes({
            loadError: t.loadError,
            actionError: t.actionError,
        });

    const tabs: MemeFilterTab[] = [
        {
            id: MEME_STATUS.pending,
            label: t.pendingTab,
            count: memes.filter((m) => m.statusId === MEME_STATUS.pending).length,
        },
        {
            id: MEME_STATUS.approved,
            label: t.approvedTab,
            count: memes.filter((m) => m.statusId === MEME_STATUS.approved).length,
        },
        {
            id: MEME_STATUS.rejected,
            label: t.rejectedTab,
            count: memes.filter((m) => m.statusId === MEME_STATUS.rejected).length,
        },
    ];

    const emptyMessages: Record<MemeStatusId, string> = {
        [MEME_STATUS.pending]: t.emptyPending,
        [MEME_STATUS.approved]: t.emptyApproved,
        [MEME_STATUS.rejected]: t.emptyRejected,
    };

    const filteredMemes = memes.filter((m) => m.statusId === activeFilter);

    return (
        <div className="space-y-6">
            {error && (
                <div
                    role="alert"
                    className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-300"
                >
                    {error}
                </div>
            )}

            <MemeFilterTabs
                tabs={tabs}
                activeTab={activeFilter}
                ariaLabel={t.pendingTab}
                onSelect={setActiveFilter}
            />

            {loading && memes.length === 0 ? (
                <div className="rounded-xl border border-white/15 bg-[#0d1013] p-6 text-sm text-white/60">
                    {t.loading}
                </div>
            ) : filteredMemes.length === 0 ? (
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