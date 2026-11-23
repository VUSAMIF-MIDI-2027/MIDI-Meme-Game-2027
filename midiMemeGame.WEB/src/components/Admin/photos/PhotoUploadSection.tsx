"use client";

import type { RefObject } from "react";
import Image from "next/image";
import { ImageUp, Loader2, Upload } from "lucide-react";
import { UPLOAD_LIMITS } from "@/lib/admin/api";
import { ErrorNotice, type ErrorScope } from "@/components/ErrorNotice";
import type { photosText } from "./photosText";

type PhotosStrings = (typeof photosText)["en"];

export type NoticeState =
    | { type: "success" | "error"; text: string } // local messages (upload success, file validation)
    | { type: "apiError"; error: unknown; scope: ErrorScope }
    | null;

type PhotoUploadSectionProps = {
    t: PhotosStrings;
    inputRef: RefObject<HTMLInputElement | null>;
    file: File | null;
    preview: string | null;
    progress: number | null;
    notice: NoticeState;
    onPick: (file: File | null) => void;
    onUpload: () => void;
};

export function PhotoUploadSection({
    t,
    inputRef,
    file,
    preview,
    progress,
    notice,
    onPick,
    onUpload,
}: PhotoUploadSectionProps) {
    const uploading = progress !== null;

    return (
        <section className="grid gap-6 rounded-xl border-2 border-dashed border-white/20 bg-[#0d1013] p-5 sm:grid-cols-[200px_minmax(0,1fr)] sm:p-6">
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-white/5 text-white/40">
                {preview ? (
                    <Image
                        src={preview}
                        alt={t.previewAlt}
                        fill
                        unoptimized
                        loading="eager"
                        sizes="(min-width: 640px) 200px, 100vw"
                        className="object-contain"
                    />
                ) : (
                    <ImageUp className="size-8" aria-hidden="true" />
                )}
            </div>

            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold">{t.uploadTitle}</h2>
                    <p className="mt-1 text-sm text-white/55">
                        {t.formats(
                            UPLOAD_LIMITS.labels,
                            UPLOAD_LIMITS.maxBytes / 1024 / 1024
                        )}
                    </p>
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept={UPLOAD_LIMITS.types.join(",")}
                    disabled={uploading}
                    onChange={(e) => onPick(e.target.files?.[0] ?? null)}
                    aria-label={t.chooseLabel}
                    className="block w-full rounded-lg border border-white/15 bg-[#0b0f12] p-2 text-sm text-white/70 file:mr-4 file:min-h-10 file:cursor-pointer file:rounded-md file:border-0 file:bg-white/15 file:px-4 file:font-semibold file:text-white"
                />

                {uploading && (
                    <div
                        role="progressbar"
                        aria-valuenow={progress ?? 0}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={t.uploading}
                        className="h-2 overflow-hidden rounded-full bg-white/10"
                    >
                        <div
                            className="h-full bg-midi-blue transition-[width]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                <button
                    type="button"
                    onClick={onUpload}
                    disabled={!file || uploading}
                    aria-busy={uploading}
                    className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-midi-blue px-5 text-sm font-semibold text-white transition-colors hover:bg-midi-blue/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {uploading ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                        <Upload className="size-4" aria-hidden="true" />
                    )}
                    {uploading ? `${t.uploading} ${progress}%` : t.uploadButton}
                </button>

                {notice?.type === "apiError" ? (
                    <ErrorNotice error={notice.error} scope={notice.scope} />
                ) : notice && (
                    <p
                        role={notice.type === "success" ? "status" : "alert"}
                        className={`rounded-lg border px-4 py-3 text-sm ${
                            notice.type === "success"
                                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                                : "border-red-400/30 bg-red-400/10 text-red-200"
                        }`}
                    >
                        {notice.text}
                    </p>
                )}
            </div>
        </section>
    );
}