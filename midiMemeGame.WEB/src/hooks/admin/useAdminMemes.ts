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
    const requestRef = useRef<AbortController | null>(null);

    const [memes, setMemes] = useState<AdminMeme[]>([]);
    const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);
    const [busyMemeId, setBusyMemeId] = useState<number | null>(null);
    const [error, setError] = useState<MemesError>(null);

    useEffect(() => {
        const controller = new AbortController();
        requestRef.current = controller;
        const objectUrls: string[] = [];

        async function fetchMemes() {
            setLoading(true);
            setPhotoUrls({});
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
                    const photoIds = new Set(fetched.map((meme) => meme.sourcePhotoId));
                    for (const id of photoIds) {
                        void getPhotoBlob(id, token, signal).then((blob) => {
                            if (signal.aborted) return;
                            const url = URL.createObjectURL(blob);
                            objectUrls.push(url);
                            setPhotoUrls((prev) => ({ ...prev, [id]: url }));
                        }).catch((error) => {
                            if (!signal.aborted) console.error("Failed to load photo", id, error);
                        });
                    }
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

        return () => {
            controller.abort();
            objectUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [getToken]);

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