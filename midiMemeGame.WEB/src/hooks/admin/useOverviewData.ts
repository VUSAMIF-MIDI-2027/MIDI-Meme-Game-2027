import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import { getPhotoBlob } from "@/services/userService";
import { getAdminMemes, type AdminMeme } from "@/services/adminService";
import { ApiError } from "@/services/ApiError";
import { getEventSchedule, type EventSchedule } from "@/services/eventScheduleService";

export function useOverviewData() {
    const { getToken } = useAuth();
    const requestRef = useRef<AbortController | null>(null);

    const [memes, setMemes] = useState<AdminMeme[]>([]);
    const [schedule, setSchedule] = useState<EventSchedule | null>(null);
    const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        requestRef.current = controller;
        const objectUrls: string[] = [];

        async function load() {
            setLoading(true);
            setPhotoUrls({});
            try {
                const signal = AbortSignal.any([
                    controller.signal,
                    AbortSignal.timeout(20_000),
                ]);
                const token = await getToken();
                signal.throwIfAborted();
                if (!token) throw ApiError.unauthorized();

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
                    const photoIds = new Set(fetchedMemes.map((meme) => meme.sourcePhotoId));
                    await Promise.all(Array.from(photoIds, async (id) => {
                        try {
                            const blob = await getPhotoBlob(id, token, signal);
                            if (signal.aborted) return;
                            const url = URL.createObjectURL(blob);
                            objectUrls.push(url);
                            const preview = new Image();
                            preview.src = url;
                            await preview.decode();
                            if (controller.signal.aborted) return;
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
                if (requestRef.current === controller) {
                    requestRef.current = null;
                }
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        void load();
        return () => {
            controller.abort();
            objectUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [getToken]);

    return { memes, schedule, photoUrls, loading };
}