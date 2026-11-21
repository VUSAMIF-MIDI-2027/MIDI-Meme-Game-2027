"use client";

import { useEffect, useRef, useState } from "react";
import { ImageUp, Loader2, Upload } from "lucide-react";
import { useAuth } from "@clerk/react";
import { errorMessage, UPLOAD_LIMITS } from "@/lib/admin/api";
import { useLanguage } from "@/context/LanguageContext";
import { photosText } from "./photosText";
import {
    getAdminPhotos,
    AdminUserError,
    uploadAdminPhoto,
    patchAdminPhoto,
    type AdminPhoto,
} from "@/services/adminService";
import PhotoCard from "./PhotoCard";

type NoticeState = { type: "success" | "error"; text: string } | null;

const PHOTOS_STORAGE_KEY = "admin_photos";

function readStoredPhotos(): AdminPhoto[] {
    try {
        const raw = localStorage.getItem(PHOTOS_STORAGE_KEY);
        if (!raw) return [];
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
            (item): item is AdminPhoto =>
                typeof item === "object" &&
                item !== null &&
                typeof (item as AdminPhoto).id === "number" &&
                typeof (item as AdminPhoto).isEnabled === "boolean"
        );
    } catch {
        return [];
    }
}

function writeStoredPhotos(photos: AdminPhoto[]): void {
    localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(photos));
}

export function Photos() {
    const { getToken } = useAuth();
    const { lang } = useLanguage();
    const t = photosText[lang];
    const request = useRef<AbortController | null>(null);
    const input = useRef<HTMLInputElement>(null);

    const [photos, setPhotos] = useState<AdminPhoto[]>(() => readStoredPhotos());
    const [loading, setLoading] = useState<boolean>(true);

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [progress, setProgress] = useState<number | null>(null);
    const [notice, setNotice] = useState<NoticeState>(null);

    const uploading = progress !== null;

    useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    useEffect(() => {
        const controller = new AbortController();
        request.current = controller;

        async function loadPhotos() {
            setLoading(true);
            try {
                const signal = AbortSignal.any([
                    controller.signal,
                    AbortSignal.timeout(20_000),
                ]);
                const token = await getToken();
                signal.throwIfAborted();
                if (!token) throw new AdminUserError(401);

                const fetched = await getAdminPhotos(token, signal);
                if (!controller.signal.aborted) {
                    writeStoredPhotos(fetched);
                    setPhotos(fetched);
                }
            } catch (cause) {
                if (!controller.signal.aborted) {
                    console.error("Failed to load photos:", cause);
                }
            } finally {
                if (request.current === controller) {
                    request.current = null;
                }
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        void loadPhotos();

        return () => {
            controller.abort();
        };
    }, [getToken]);

    function pick(f: File | null) {
        setNotice(null);
        if (f && !UPLOAD_LIMITS.types.includes(f.type)) {
            setNotice({ type: "error", text: t.badType });
            f = null;
        } else if (f && f.size > UPLOAD_LIMITS.maxBytes) {
            setNotice({ type: "error", text: t.tooBig });
            f = null;
        }
        if (!f && input.current) {
            input.current.value = "";
        }
        setFile(f);
    }

    async function upload() {
        if (!file || uploading) return;

        const controller = new AbortController();
        request.current = controller;
        setProgress(0);
        setNotice(null);

        try {
            const signal = AbortSignal.any([
                controller.signal,
                AbortSignal.timeout(60_000),
            ]);
            const token = await getToken();
            signal.throwIfAborted();
            if (!token) throw new AdminUserError(401);

            const created = await uploadAdminPhoto(
                file,
                token,
                (pct) => {
                    if (!controller.signal.aborted) setProgress(pct);
                },
                signal
            );

            if (!controller.signal.aborted) {
                const newPhoto: AdminPhoto = {
                    id: created.id,
                    isEnabled: created.isEnabled ?? true,
                };
                setPhotos((prev) => {
                    const next = prev.some((p) => p.id === newPhoto.id)
                        ? prev.map((p) => (p.id === newPhoto.id ? newPhoto : p))
                        : [newPhoto, ...prev];
                    writeStoredPhotos(next);
                    return next;
                });
                setNotice({ type: "success", text: t.uploadSuccess });
                pick(null);
            }
        } catch (cause) {
            if (!controller.signal.aborted) {
                setNotice({ type: "error", text: errorMessage(cause) });
            }
        } finally {
            if (request.current === controller) {
                request.current = null;
            }
            if (!controller.signal.aborted) {
                setProgress(null);
            }
        }
    }

    async function handleToggleEnabled(photoId: number, nextEnabled: boolean) {
        setNotice(null);
        try {
            const signal = AbortSignal.timeout(20_000);
            const token = await getToken();
            signal.throwIfAborted();
            if (!token) throw new AdminUserError(401);

            const updated = await patchAdminPhoto(photoId, nextEnabled, token, signal);

            setPhotos((prev) => {
                const next = prev.map((item) =>
                    item.id === photoId
                        ? { ...item, isEnabled: updated.isEnabled }
                        : item
                );
                writeStoredPhotos(next);
                return next;
            });
        } catch (cause) {
            setNotice({ type: "error", text: errorMessage(cause) });
            throw cause;
        }
    }

    const enabledPhotos = photos.filter((p) => p.isEnabled);
    const disabledPhotos = photos.filter((p) => !p.isEnabled);

    return (
        <div className="space-y-8">
            <section className="grid gap-6 rounded-xl border-2 border-dashed border-white/20 bg-[#0d1013] p-5 sm:grid-cols-[200px_minmax(0,1fr)] sm:p-6">
                <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-white/5 text-white/40">
                    {preview ? (
                        <img
                            src={preview}
                            alt={t.previewAlt}
                            className="size-full object-contain"
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
                        ref={input}
                        type="file"
                        accept={UPLOAD_LIMITS.types.join(",")}
                        disabled={uploading}
                        onChange={(e) => pick(e.target.files?.[0] ?? null)}
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
                        onClick={upload}
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

                    {notice && (
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

            {loading && photos.length === 0 ? (
                <p className="text-white/55">{t.loadingPhotos}</p>
            ) : photos.length === 0 ? (
                <p className="text-white/55">{t.emptyAll}</p>
            ) : (
                <div className="space-y-8">
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">{t.enabledHeading}</h2>
                            <span className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                                {enabledPhotos.length}
                            </span>
                        </div>

                        {enabledPhotos.length === 0 ? (
                            <p className="text-sm text-white/55">{t.noEnabledPhotos}</p>
                        ) : (
                            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                {enabledPhotos.map((photo) => (
                                    <li
                                        key={photo.id}
                                        className="overflow-hidden rounded-xl border border-white/10 bg-[#11161a]"
                                    >
                                        <PhotoCard
                                            photo={photo}
                                            getToken={getToken}
                                            onToggleEnabled={handleToggleEnabled}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">{t.disabledHeading}</h2>
                            <span className="rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
                                {disabledPhotos.length}
                            </span>
                        </div>

                        {disabledPhotos.length === 0 ? (
                            <p className="text-sm text-white/55">{t.noDisabledPhotos}</p>
                        ) : (
                            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                {disabledPhotos.map((photo) => (
                                    <li
                                        key={photo.id}
                                        className="overflow-hidden rounded-xl border border-white/10 bg-[#11161a]"
                                    >
                                        <PhotoCard
                                            photo={photo}
                                            getToken={getToken}
                                            onToggleEnabled={handleToggleEnabled}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}