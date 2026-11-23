"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { getPhotoBlob } from "@/services/userService";
import { AdminUserError, type AdminPhoto } from "@/services/adminService";
import { errorMessage } from "@/lib/admin/api";
import { useLanguage } from "@/context/LanguageContext";
import { photoCardText } from "./photoCardText";

export default function PhotoCard({
    photo,
    getToken,
    onToggleEnabled,
}: {
    photo: AdminPhoto;
    getToken: () => Promise<string | null>;
    onToggleEnabled: (photoId: number, nextEnabled: boolean) => Promise<void>;
}) {
    const { lang } = useLanguage();
    const t = photoCardText[lang];

    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [confirming, setConfirming] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        let objectUrl: string | null = null;

        async function loadImage() {
            setLoadError(null);
            try {
                const signal = AbortSignal.any([
                    controller.signal,
                    AbortSignal.timeout(20_000),
                ]);
                const token = await getToken();
                signal.throwIfAborted();
                if (!token) throw new AdminUserError(401);

                const blob = await getPhotoBlob(photo.id, token, signal);
                if (controller.signal.aborted) return;

                objectUrl = URL.createObjectURL(blob);
                setImageUrl(objectUrl);
            } catch (cause) {
                if (!controller.signal.aborted) {
                    setLoadError(errorMessage(cause) || t.failedToLoad);
                }
            }
        }

        void loadImage();

        return () => {
            controller.abort();
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [photo.id, getToken, t.failedToLoad]);

    const nextEnabled = !photo.isEnabled;

    async function handleConfirmToggle() {
        if (updating) return;
        setUpdating(true);
        try {
            await onToggleEnabled(photo.id, nextEnabled);
            setConfirming(false);
        } finally {
            setUpdating(false);
        }
    }

    return (
        <article className="flex flex-col overflow-hidden rounded-xl border border-white/15 bg-[#0d1013]">
            <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-neutral-900">
                {loadError ? (
                    <span className="px-3 text-center text-sm text-rose-400">
                        {loadError}
                    </span>
                ) : !imageUrl ? (
                    <span className="text-sm text-white/50">
                        {t.loadingPhoto}
                    </span>
                ) : (
                    <Image
                        src={imageUrl}
                        alt={t.photoAlt}
                        fill
                        unoptimized
                        loading="eager"
                        sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-contain"
                    />
                )}
            </div>

            <div className="flex flex-col gap-3 p-3.5">
                {confirming ? (
                    <div className="space-y-2 rounded-lg border border-white/15 bg-[#0b0f12] p-3">
                        <p className="text-xs text-white/80">
                            {nextEnabled ? t.confirmEnable : t.confirmDisable}
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={updating}
                                onClick={() => void handleConfirmToggle()}
                                className="flex-1 cursor-pointer rounded-md bg-midi-blue px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                            >
                                {updating ? t.saving : t.confirm}
                            </button>
                            <button
                                type="button"
                                disabled={updating}
                                onClick={() => setConfirming(false)}
                                className="flex-1 cursor-pointer rounded-md border border-white/20 bg-transparent px-3 py-1.5 text-xs font-semibold text-white/75 hover:border-white/40 hover:text-white disabled:opacity-50"
                            >
                                {t.cancel}
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setConfirming(true)}
                        className="min-h-10 w-full cursor-pointer rounded-lg border border-white/20 bg-transparent px-3 py-2 text-xs font-semibold text-white/85 transition-colors hover:border-midi-blue hover:text-white"
                    >
                        {photo.isEnabled ? t.disablePhoto : t.enablePhoto}
                    </button>
                )}
            </div>
        </article>
    );
}