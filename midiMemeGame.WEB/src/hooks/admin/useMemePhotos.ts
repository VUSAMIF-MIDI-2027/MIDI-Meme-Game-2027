import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import { getPhotoBlob } from "@/services/userService";

const PHOTO_TIMEOUT_MS = 20_000;

/**
 * Loads source photos as object URLs, keyed by photo id.
 * Only photos that are not cached yet are fetched, URLs of photos that are no
 * longer wanted are revoked, and everything is revoked on unmount.
 * Photos that failed to load are retried the next time `photoIds` changes
 * identity, so pass a new array on every data refresh.
 */
export function useMemePhotos(photoIds: readonly number[]) {
    const { getToken } = useAuth();
    const cache = useRef(new Map<number, string>());
    const pending = useRef(new Set<number>());
    const lifetime = useRef<AbortController | null>(null);
    const wantedNow = useRef<ReadonlySet<number>>(new Set());
    const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({});

    useEffect(() => {
        const controller = new AbortController();
        const urls = cache.current;
        const inFlight = pending.current;
        lifetime.current = controller;

        return () => {
            controller.abort();
            urls.forEach((url) => URL.revokeObjectURL(url));
            urls.clear();
            inFlight.clear();
        };
    }, []);

    useEffect(() => {
        const controller = lifetime.current;
        if (!controller || controller.signal.aborted) return;

        const urls = cache.current;
        const wanted = new Set(photoIds);

        let removed = false;
        for (const [id, url] of urls) {
            if (wanted.has(id)) continue;
            URL.revokeObjectURL(url);
            urls.delete(id);
            removed = true;
        }
        if (removed) setPhotoUrls(Object.fromEntries(urls));

        wantedNow.current = wanted;
        const missing = [...wanted].filter((id) => !urls.has(id) && !pending.current.has(id));
        if (missing.length === 0) return;
        missing.forEach((id) => pending.current.add(id));

        async function loadPhoto(id: number, token: string) {
            const signal = AbortSignal.any([
                controller!.signal,
                AbortSignal.timeout(PHOTO_TIMEOUT_MS),
            ]);
            try {
                const blob = await getPhotoBlob(id, token, signal);
                if (controller!.signal.aborted) return;
                const url = URL.createObjectURL(blob);
                try {
                    const preview = new Image();
                    preview.src = url;
                    await preview.decode();
                } catch (error) {
                    URL.revokeObjectURL(url);
                    throw error;
                }
                if (controller!.signal.aborted || !wantedNow.current.has(id)) {
                    URL.revokeObjectURL(url);
                    return;
                }
                urls.set(id, url);
                setPhotoUrls((previous) => ({ ...previous, [id]: url }));
            } catch (error) {
                if (!signal.aborted) console.error("Failed to load photo", id, error);
            }
        }

        async function loadMissing() {
            try {
                const token = await getToken();
                if (!token || controller!.signal.aborted) return;
                await Promise.all(missing.map((id) => loadPhoto(id, token)));
            } catch (error) {
                if (!controller!.signal.aborted) console.error("Failed to load photos", error);
            } finally {
                missing.forEach((id) => pending.current.delete(id));
            }
        }

        void loadMissing();
    }, [photoIds, getToken]);

    return photoUrls;
}
