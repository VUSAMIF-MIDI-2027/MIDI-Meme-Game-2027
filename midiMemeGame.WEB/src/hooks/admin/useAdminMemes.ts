import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import { ApiError } from "@/services/ApiError";
import { getPhotoBlob } from "@/services/userService";
import {
    getAdminMemes,
    patchAdminMemeStatus,
    type AdminMeme,
    type MemeStatusId,
} from "@/services/adminService";

type MemesError = { cause: unknown; scope: "memeList" | "review" } | null;

export function useAdminMemes() {
    const { getToken } = useAuth();
    const refreshRef = useRef<(() => void) | null>(null);
    const moderating = useRef(false);
    const mutationVersion = useRef(0);
    const [refreshing, setRefreshing] = useState(false);

    const [memes, setMemes] = useState<AdminMeme[]>([]);
    const [revision, setRevision] = useState(0);
    const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);
    const [busyMemeId, setBusyMemeId] = useState<number | null>(null);
    const [error, setError] = useState<MemesError>(null);

    useEffect(() => {
        const controller = new AbortController();
        const objectUrls = new Map<number, string>();
        let fetching = false;

        async function fetchMemes() {
            if (fetching || moderating.current) return;
            fetching = true;
            const version = mutationVersion.current;
            setRefreshing(true);
            setError(previous => previous?.scope === "review" ? previous : null);
            try {
                const signal = AbortSignal.any([
                    controller.signal,
                    AbortSignal.timeout(20_000),
                ]);
                const token = await getToken();
                signal.throwIfAborted();
                if (!token) throw ApiError.unauthorized();

                const fetched = await getAdminMemes(token, signal, { includeDeleted: true });
                if (!controller.signal.aborted && version === mutationVersion.current) {
                    setMemes(fetched);
                    const photoIds = new Set(fetched.map((meme) => meme.sourcePhotoId));
                    for (const [id, url] of objectUrls) {
                        if (!photoIds.has(id)) {
                            URL.revokeObjectURL(url);
                            objectUrls.delete(id);
                        }
                    }
                    setPhotoUrls(Object.fromEntries(objectUrls));
                    await Promise.all(Array.from(photoIds, async (id) => {
                        if (objectUrls.has(id)) return;
                        try {
                            const blob = await getPhotoBlob(id, token, signal);
                            if (signal.aborted) return;
                            const url = URL.createObjectURL(blob);
                            objectUrls.set(id, url);
                            const preview = new Image();
                            preview.src = url;
                            await preview.decode();
                            if (controller.signal.aborted) return;
                            setPhotoUrls((prev) => ({ ...prev, [id]: url }));
                        } catch (error) {
                            const failedUrl = objectUrls.get(id);
                            if (failedUrl) URL.revokeObjectURL(failedUrl);
                            objectUrls.delete(id);
                            if (!signal.aborted) console.error("Failed to load photo", id, error);
                        }
                    }));
                }
            } catch (cause) {
                if (!controller.signal.aborted) {
                    setError({ cause, scope: "memeList" });
                }
            } finally {
                fetching = false;
                if (!controller.signal.aborted) {
                    setRefreshing(false);
                    setLoading(false);
                }
            }
        }

        refreshRef.current = fetchMemes;
        void fetchMemes();
        function refreshVisible() {
            if (document.visibilityState === "visible") void fetchMemes();
        }
        const timer = window.setInterval(refreshVisible, 60_000);
        document.addEventListener("visibilitychange", refreshVisible);

        return () => {
            refreshRef.current = null;
            window.clearInterval(timer);
            document.removeEventListener("visibilitychange", refreshVisible);
            controller.abort();
            objectUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [getToken, revision]);

    const updateMemeStatus = useCallback(
        async (memeId: number, nextStatusId: MemeStatusId) => {
            const meme = memes.find(item => item.id === memeId);
            if (!meme || meme.isDeleted || moderating.current) return;
            moderating.current = true;
            mutationVersion.current++;
            setBusyMemeId(memeId);
            setError(null);

            try {
                const signal = AbortSignal.timeout(20_000);
                const token = await getToken();
                signal.throwIfAborted();
                if (!token) throw ApiError.unauthorized();

                const updated = await patchAdminMemeStatus(memeId, nextStatusId, meme.updatedAtUtc, token, signal);

                setMemes((prev) =>
                    prev.map((item) =>
                        item.id === memeId
                            ? {
                                  ...item,
                                  statusId: updated.statusId,
                                  updatedAtUtc: updated.updatedAtUtc,
                              }
                            : item
                    )
                );
            } catch (cause) {
                setError({ cause, scope: "review" });
                if (cause instanceof ApiError && cause.status === 409)
                    setRevision(previous => previous + 1);
            } finally {
                moderating.current = false;
                setBusyMemeId(null);
            }
        },
        [getToken, memes]
    );

    return {
        memes,
        photoUrls,
        loading,
        busyMemeId,
        refreshing,
        refresh: () => refreshRef.current?.(),
        error,
        updateMemeStatus,
    };
}