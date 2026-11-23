import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import {
    readStoredPhotos,
    resolvePhotoUrlById,
    syncAdminPhotosToStorage,
} from "@/lib/admin/photoStorage";
import { AdminUserError, getAdminMemes, type AdminMeme } from "@/services/adminService";
import { apiBaseUrl } from "@/services/apiBaseUrl";
import { getEventSchedule, type EventSchedule } from "@/services/eventScheduleService";

export function useOverviewData() {
    const { getToken } = useAuth();
    const requestRef = useRef<AbortController | null>(null);
    const photoUrlsRef = useRef<Record<number, string>>({});

    const [memes, setMemes] = useState<AdminMeme[]>([]);
    const [schedule, setSchedule] = useState<EventSchedule | null>(null);
    const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);

    const resolveSinglePhotoUrl = useCallback(
        async (
            photoId: number,
            storedIds: Set<number>,
            signal: AbortSignal
        ): Promise<string> => {
            if (signal.aborted) return "";

            const existing = photoUrlsRef.current[photoId];
            if (existing) return existing;

            const directFileUrl = `${apiBaseUrl}/api/photos/${photoId}/file`;
            if (storedIds.has(photoId)) return directFileUrl;

            // Fall back to resolving individually below
            try {
                const resolved = await resolvePhotoUrlById(photoId, getToken, signal);
                return resolved ?? directFileUrl;
            } catch {
                return directFileUrl;
            }
        },
        [getToken]
    );

    const hydratePhotoUrls = useCallback(
        async (items: AdminMeme[], signal: AbortSignal) => {
            const uniquePhotoIds = Array.from(
                new Set(items.map((m) => m.sourcePhotoId).filter((id) => id > 0))
            );
            if (uniquePhotoIds.length === 0) return;

            let storedIds = new Set(readStoredPhotos().map((p) => p.id));
            if (uniquePhotoIds.some((id) => !storedIds.has(id))) {
                try {
                    const token = await getToken();
                    if (!signal.aborted && token) {
                        const synced = await syncAdminPhotosToStorage(token, signal);
                        storedIds = new Set(synced.map((p) => p.id));
                    }
                } catch {
                    // Fall back to resolving individually below
                }
            }

            const pairs = await Promise.all(
                uniquePhotoIds.map(async (photoId) => [
                    photoId,
                    await resolveSinglePhotoUrl(photoId, storedIds, signal),
                ] as const)
            );

            if (signal.aborted) return;

            setPhotoUrls((prev) => {
                const next = { ...prev };
                for (const [photoId, url] of pairs) {
                    if (url) next[photoId] = url;
                }
                photoUrlsRef.current = next;
                return next;
            });
        },
        [getToken, resolveSinglePhotoUrl]
    );

    useEffect(() => {
        const controller = new AbortController();
        requestRef.current = controller;

        async function load() {
            setLoading(true);
            try {
                const signal = AbortSignal.any([
                    controller.signal,
                    AbortSignal.timeout(20_000),
                ]);
                const token = await getToken();
                signal.throwIfAborted();
                if (!token) throw new AdminUserError(401);

                const [fetchedMemes, fetchedSchedule] = await Promise.all([
                    getAdminMemes(token, signal),
                    getEventSchedule(signal).catch((err) => {
                        console.error("Failed to load event schedule:", err);
                        return null;
                    }),
                ]);

                if (!controller.signal.aborted) {
                    setMemes(fetchedMemes);
                    setSchedule(fetchedSchedule);
                    void hydratePhotoUrls(fetchedMemes, signal);
                }
            } catch (cause) {
                if (!controller.signal.aborted) {
                    console.error("Failed to load competition overview:", cause);
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

        void load();
        return () => controller.abort();
    }, [getToken, hydratePhotoUrls]);

    return { memes, schedule, photoUrls, loading };
}