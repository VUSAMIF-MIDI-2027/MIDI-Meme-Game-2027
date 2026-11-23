"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import { UPLOAD_LIMITS } from "@/lib/admin/api";
import { ApiError } from "@/services/ApiError";
import {
    readStoredPhotos,
    syncAdminPhotosToStorage,
    writeStoredPhotos,
} from "@/lib/admin/photoStorage";
import { useLanguage } from "@/context/LanguageContext";
import {
    uploadAdminPhoto,
    patchAdminPhoto,
    type AdminPhoto,
} from "@/services/adminService";
import { PhotoGridSection } from "./PhotoGridSection";
import { PhotoUploadSection, type NoticeState } from "./PhotoUploadSection";
import { photosText } from "./photosText";

export function Photos() {
    const { getToken } = useAuth();
    const { lang } = useLanguage();
    const t = photosText[lang];

    const requestRef = useRef<AbortController | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const previewUrlRef = useRef<string | null>(null);

    const [photos, setPhotos] = useState<AdminPhoto[]>(() => readStoredPhotos());
    const [loading, setLoading] = useState(true);
    const [selection, setSelection] = useState<{ file: File; preview: string } | null>(null);
    const [progress, setProgress] = useState<number | null>(null);
    const [notice, setNotice] = useState<NoticeState>(null);

    const uploading = progress !== null;

    useEffect(() => {
        return () => {
            if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
        };
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        requestRef.current = controller;

        async function loadPhotos() {
            setLoading(true);
            try {
                const signal = AbortSignal.any([
                    controller.signal,
                    AbortSignal.timeout(20_000),
                ]);
                const token = await getToken();
                signal.throwIfAborted();
                if (!token) throw ApiError.unauthorized();

                const fetched = await syncAdminPhotosToStorage(token, signal);
                if (!controller.signal.aborted) {
                    setPhotos(fetched);
                }
            } catch (cause) {
                if (!controller.signal.aborted) {
                    setNotice({ type: "apiError", error: cause, scope: "photoList" });
                }
            } finally {
                if (requestRef.current === controller) {
                    requestRef.current = null;
                }
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        void loadPhotos();

        return () => controller.abort();
    }, [getToken]);

    function handlePick(nextFile: File | null) {
        setNotice(null);

        let validated: File | null = nextFile;
        if (validated && !UPLOAD_LIMITS.types.includes(validated.type)) {
            setNotice({ type: "error", text: t.badType });
            validated = null;
        } else if (validated && validated.size > UPLOAD_LIMITS.maxBytes) {
            setNotice({ type: "error", text: t.tooBig });
            validated = null;
        }

        if (!validated && inputRef.current) {
            inputRef.current.value = "";
        }
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
        }

        const nextSelection = validated
            ? { file: validated, preview: URL.createObjectURL(validated) }
            : null;
        previewUrlRef.current = nextSelection?.preview ?? null;
        setSelection(nextSelection);
    }

    async function handleUpload() {
        if (!selection?.file || uploading) return;

        const controller = new AbortController();
        requestRef.current = controller;
        setProgress(0);
        setNotice(null);

        try {
            const signal = AbortSignal.any([
                controller.signal,
                AbortSignal.timeout(60_000),
            ]);
            const token = await getToken();
            signal.throwIfAborted();
            if (!token) throw ApiError.unauthorized();

            const created = await uploadAdminPhoto(
                selection.file,
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
                handlePick(null);
            }
        } catch (cause) {
            if (!controller.signal.aborted) {
                setNotice({ type: "apiError", error: cause, scope: "upload" });
            }
        } finally {
            if (requestRef.current === controller) {
                requestRef.current = null;
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
            if (!token) throw ApiError.unauthorized();

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
            setNotice({ type: "apiError", error: cause, scope: "photo" });
            throw cause;
        }
    }

    const enabledPhotos = photos.filter((p) => p.isEnabled);
    const disabledPhotos = photos.filter((p) => !p.isEnabled);

    return (
        <div className="space-y-8">
            <PhotoUploadSection
                t={t}
                inputRef={inputRef}
                file={selection?.file ?? null}
                preview={selection?.preview ?? null}
                progress={progress}
                notice={notice}
                onPick={handlePick}
                onUpload={() => void handleUpload()}
            />

            {loading && photos.length === 0 ? (
                <p className="text-white/55">{t.loadingPhotos}</p>
            ) : photos.length === 0 ? (
                <p className="text-white/55">{t.emptyAll}</p>
            ) : (
                <div className="space-y-8">
                    <PhotoGridSection
                        heading={t.enabledHeading}
                        emptyText={t.noEnabledPhotos}
                        photos={enabledPhotos}
                        variant="enabled"
                        getToken={getToken}
                        onToggleEnabled={handleToggleEnabled}
                    />

                    <PhotoGridSection
                        heading={t.disabledHeading}
                        emptyText={t.noDisabledPhotos}
                        photos={disabledPhotos}
                        variant="disabled"
                        getToken={getToken}
                        onToggleEnabled={handleToggleEnabled}
                    />
                </div>
            )}
        </div>
    );
}