import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import { getPhotoBlob } from "@/services/userService";
import { getAdminMemes, type AdminMeme } from "@/services/adminService";
import { ApiError } from "@/services/ApiError";
import { getEventSchedule, type EventSchedule } from "@/services/eventScheduleService";

export function useOverviewData() {
    const { getToken } = useAuth();

    const [memes, setMemes] = useState<AdminMeme[]>([]);
    const [schedule, setSchedule] = useState<EventSchedule | null>(null);
    const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);
    const loadRef = useRef<(() => Promise<void>) | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        const objectUrls = new Map<number, string>();
        let inFlight = false;
        let firstLoad = true;

        async function load() {
            if (inFlight || document.hidden) return;
            inFlight = true;
            setRefreshing(true);
            try {
                const signal = AbortSignal.any([
                    controller.signal,
                    AbortSignal.timeout(20_000),
                ]);
                const token = await getToken();
                signal.throwIfAborted();
                if (firstLoad) {
                    firstLoad = false;
                    setPhotoUrls({});
                }
                if (!token) throw ApiError.unauthorized();

                const [fetchedMemes, fetchedSchedule] = await Promise.all([
                    getAdminMemes(token, signal),
                    getEventSchedule(signal).catch((err) => {
                        console.error("Failed to load event schedule:", err);
                        return undefined;
                    }),
                ]);

                if (!controller.signal.aborted) {
                    const activeMemes = fetchedMemes.filter((meme) => !meme.isDeleted);
                    setMemes(activeMemes);
                    if (fetchedSchedule !== undefined) setSchedule(fetchedSchedule);
                    const photoIds = new Set(activeMemes.map((meme) => meme.sourcePhotoId));
                    await Promise.all(Array.from(photoIds, async (id) => {
                        if (!Number.isInteger(id) || id <= 0 || objectUrls.has(id)) return;
                        try {
                            const blob = await getPhotoBlob(id, token, signal);
                            if (signal.aborted) return;
                            const url = URL.createObjectURL(blob);

                            const preview = new Image();
                            preview.src = url;
                            try {
                                await preview.decode();
                            } finally {
                                if (controller.signal.aborted || !preview.naturalWidth) URL.revokeObjectURL(url);
                            }
                            if (controller.signal.aborted || !preview.naturalWidth) return;
                            objectUrls.set(id, url);
                            setPhotoUrls((prev) => ({ ...prev, [id]: url }));
                        } catch (error) {
                            if (!signal.aborted) console.error("Failed to load photo", id, error);
                        }
                    }));
                }
            } catch (cause) {
                if (!controller.signal.aborted) {
                    console.error("Failed to load competition overview:", cause);
                }
            } finally {
                inFlight = false;
                if (!controller.signal.aborted) {
                    setLoading(false);
                    setRefreshing(false);
                }
            }
        }

        loadRef.current = load;
        void load();
        const interval = window.setInterval(load, 60_000);
        document.addEventListener("visibilitychange", load);
        return () => {
            loadRef.current = null;
            window.clearInterval(interval);
            document.removeEventListener("visibilitychange", load);
            controller.abort();
            objectUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [getToken]);

    return { memes, schedule, photoUrls, loading, refreshing, refresh: () => void loadRef.current?.() };
}