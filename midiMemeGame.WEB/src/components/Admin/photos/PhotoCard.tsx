"use client";

import { useState, useEffect } from "react";
import { getPhotoBlob } from "@/services/userService";
import { type AdminPhoto } from "@/services/adminService";
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
    const [failed, setFailed] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        let objectUrl: string | null = null;

        async function loadImage() {
            setFailed(false);
            try {
                const signal = AbortSignal.any([
                    controller.signal,
                    AbortSignal.timeout(20_000),
                ]);
                const token = await getToken();
                signal.throwIfAborted();
                if (!token) throw new Error("401 ADD LATER");

                const blob = await getPhotoBlob(photo.id, token, signal);
                if (controller.signal.aborted) return;

                objectUrl = URL.createObjectURL(blob);
                setImageUrl(objectUrl);
            } catch (cause) {
                if (!controller.signal.aborted) {
                    console.error(`Failed to load photo ${photo.id}:`, cause);
                    setFailed(true);
                }
            }
        }

        void loadImage();

        return () => {
            controller.abort();
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [photo.id, getToken]);

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
            <div className="flex aspect-video w-full items-center justify-center overflow-hidden bg-neutral-900">
                {failed ? (
                    <span className="text-sm text-rose-400">
                        {t.failedToLoad}
                    </span>
                ) : !imageUrl ? (
                    <span className="text-sm text-white/50">
                        {t.loadingPhoto}
                    </span>
                ) : (
                    <img
                        src={imageUrl}
                        alt={t.photoAlt}
                        className="h-full w-full object-contain"
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
                                onClick={handleConfirmToggle}
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