import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import { ApiError } from "@/services/ApiError";
import {
    readStoredPhotos,
    resolvePhotoUrlById,
    syncAdminPhotosToStorage,
} from "@/lib/admin/photoStorage";
import {
    getAdminMemes,
    patchAdminMemeStatus,
    type AdminMeme,
    type MemeStatusId,
} from "@/services/adminService";

type MemesError = { cause: unknown; scope: "memeList" | "review" } | null;

export function useAdminMemes() {
    const { getToken } = useAuth();
    const requestRef = useRef<AbortController | null>(null);
    const photoUrlsRef = useRef<Record<number, string>>({});

    const [memes, setMemes] = useState<AdminMeme[]>([]);
    const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);
    const [busyMemeId, setBusyMemeId] = useState<number | null>(null);
    const [error, setError] = useState<MemesError>(null);

    const hydratePhotoUrls = useCallback(
        async (items: AdminMeme[], signal: AbortSignal) => {
            const uniqueIds = Array.from(
                new Set(items.map((m) => m.sourcePhotoId).filter((id) => id > 0))
            );
            if (uniqueIds.length === 0) return;

            const storedIds = new Set(readStoredPhotos().map((p) => p.id));
            if (uniqueIds.some((id) => !storedIds.has(id))) {
                try {
                    const token = await getToken();
                    if (!signal.aborted && token) {
                        await syncAdminPhotosToStorage(token, signal);
                    }
                } catch {
                    // Fall back to individual lookups below
                }
            }

            const entries = await Promise.all(
                uniqueIds.map(async (photoId) => {
                    const cached = photoUrlsRef.current[photoId];
                    if (cached) return [photoId, cached] as const;
                    const resolved = await resolvePhotoUrlById(photoId, getToken, signal);
                    return [photoId, resolved] as const;
                })
            );

            if (signal.aborted) return;

            setPhotoUrls((prev) => {
                const next = { ...prev };
                for (const [photoId, url] of entries) {
                    if (url) next[photoId] = url;
                }
                photoUrlsRef.current = next;
                return next;
            });
        },
        [getToken]
    );

    useEffect(() => {
        const controller = new AbortController();
        requestRef.current = controller;

        async function fetchMemes() {
            setLoading(true);
            setError(null);
            try {
                const signal = AbortSignal.any([
                    controller.signal,
                    AbortSignal.timeout(20_000),
                ]);
                const token = await getToken();
                signal.throwIfAborted();
                if (!token) throw ApiError.unauthorized();

                const fetched = await getAdminMemes(token, signal);
                if (!controller.signal.aborted) {
                    setMemes(fetched);
                    void hydratePhotoUrls(fetched, signal);
                }
            } catch (cause) {
                if (!controller.signal.aborted) {
                    setError({ cause, scope: "memeList" });
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

        void fetchMemes();

        return () => controller.abort();
    }, [getToken, hydratePhotoUrls]);

    const updateMemeStatus = useCallback(
        async (memeId: number, nextStatusId: MemeStatusId) => {
            if (busyMemeId !== null) return;
            setBusyMemeId(memeId);
            setError(null);

            try {
                const signal = AbortSignal.timeout(20_000);
                const token = await getToken();
                signal.throwIfAborted();
                if (!token) throw ApiError.unauthorized();

                const updated = await patchAdminMemeStatus(memeId, nextStatusId, token, signal);

                setMemes((prev) =>
                    prev.map((item) =>
                        item.id === memeId
                            ? {
                                  ...item,
                                  statusId: updated.statusId ?? nextStatusId,
                                  updatedAtUtc: updated.updatedAtUtc || new Date().toISOString(),
                              }
                            : item
                    )
                );
            } catch (cause) {
                setError({ cause, scope: "review" });
            } finally {
                setBusyMemeId(null);
            }
        },
        [busyMemeId, getToken]
    );

    return {
        memes,
        photoUrls,
        loading,
        busyMemeId,
        error,
        updateMemeStatus,
    };
}