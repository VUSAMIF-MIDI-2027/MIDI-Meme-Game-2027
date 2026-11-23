"use client";

import { Check, X } from "lucide-react";
import MemeCard from "@/components/Shared/MemeCard";
import { MEME_STATUS, type AdminMeme, type MemeStatusId } from "@/services/adminService";
import type { memeApprovalText } from "./memeApprovalText";

type MemeApprovalStrings = (typeof memeApprovalText)["en"];

type MemeReviewItemProps = {
    meme: AdminMeme;
    imageSrc: string;
    isBusy: boolean;
    t: MemeApprovalStrings;
    onDecision: (memeId: number, statusId: MemeStatusId) => void;
};

const STATUS_BADGE_STYLES: Record<MemeStatusId, string> = {
    [MEME_STATUS.pending]: "bg-white/10 text-white/80",
    [MEME_STATUS.rejected]: "bg-rose-500/15 text-rose-300",
    [MEME_STATUS.approved]: "bg-emerald-500/15 text-emerald-300",
};

function formatSubmittedDate(isoUtc: string): string {
    if (!isoUtc) return "—";
    const date = new Date(isoUtc);
    if (Number.isNaN(date.getTime())) return isoUtc;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function MemeReviewItem({
    meme,
    imageSrc,
    isBusy,
    t,
    onDecision,
}: MemeReviewItemProps) {
    const statusLabel =
        meme.statusId === MEME_STATUS.approved
            ? t.statusApproved
            : meme.statusId === MEME_STATUS.rejected
              ? t.statusRejected
              : t.statusPending;

    return (
        <article className="flex flex-col rounded-xl border border-white/15 bg-[#0d1013] p-4 sm:p-5">
            <div className="grid flex-1 gap-5 sm:grid-cols-[minmax(0,1fr)_210px] sm:items-stretch">
                <div className="min-w-0">
                    <MemeCard
                        image={imageSrc}
                        imageAlt={`${t.photoFallbackAlt} #${meme.sourcePhotoId}`}
                        caption={meme.caption}
                        layout="stacked"
                    />
                </div>

                <div className="flex flex-col justify-between gap-5">
                    <div>
                        <span
                            className={`inline-block rounded-md px-3 py-1 text-xs font-semibold ${STATUS_BADGE_STYLES[meme.statusId]}`}
                        >
                            {statusLabel}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <dl className="space-y-1 text-sm">
                            <dt className="font-medium text-white/60">{t.submittedLabel}</dt>
                            <dd className="font-bold text-white tabular-nums">
                                {formatSubmittedDate(meme.createdAtUtc)}
                            </dd>
                        </dl>

                        {meme.isInvalidatedBySourcePhoto && (
                            <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-200">
                                {t.invalidatedWarning}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                        <button
                            type="button"
                            disabled={isBusy || meme.statusId === MEME_STATUS.rejected}
                            onClick={() => onDecision(meme.id, MEME_STATUS.rejected)}
                            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-white/25 bg-[#0b0f12] px-3 py-2 text-sm font-semibold text-white transition-colors hover:border-rose-400/50 hover:bg-rose-500/10 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue"
                        >
                            <X className="size-4" aria-hidden="true" />
                            {isBusy && meme.statusId !== MEME_STATUS.approved
                                ? t.rejecting
                                : t.reject}
                        </button>

                        <button
                            type="button"
                            disabled={isBusy || meme.statusId === MEME_STATUS.approved}
                            onClick={() => onDecision(meme.id, MEME_STATUS.approved)}
                            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-midi-blue px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue"
                        >
                            <Check className="size-4" aria-hidden="true" />
                            {isBusy ? t.approving : t.approve}
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}