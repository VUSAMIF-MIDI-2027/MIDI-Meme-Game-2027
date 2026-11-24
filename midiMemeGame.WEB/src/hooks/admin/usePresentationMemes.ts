import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/react";
import { ApiError } from "@/services/ApiError";
import {
    getActiveAdminMemes,
    MEME_STATUS,
    type AdminMeme,
} from "@/services/adminService";
import { useMemePhotos } from "./useMemePhotos";

const REFRESH_INTERVAL_MS = 30_000;
const INITIAL_RETRY_INTERVAL_MS = 10_000;
const REQUEST_TIMEOUT_MS = 20_000;

function submittedAtUtc(meme: AdminMeme) {
    const value = meme.createdAtUtc;
    const hasOffset = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);
    return Date.parse(hasOffset ? value : value + "Z") || 0;
}

export type PresentationStatus = "loading" | "error" | "ready";

export function usePresentationMemes(enabled: boolean) {
    const { getToken } = useAuth();
    const [memes, setMemes] = useState<AdminMeme[] | null>(null);
    const [initialError, setInitialError] = useState(false);

    useEffect(() => {
        if (!enabled) return;

        const controller = new AbortController();
        let timer: number | undefined;
        let loaded = false;

        async function load() {
            try {
                const signal = AbortSignal.any([
                    controller.signal,
                    AbortSignal.timeout(REQUEST_TIMEOUT_MS),
                ]);
                const token = await getToken();
                signal.throwIfAborted();
                if (!token) throw ApiError.unauthorized();

                const fetched = await getActiveAdminMemes(token, signal, MEME_STATUS.approved);
                if (controller.signal.aborted) return;
                loaded = true;
                setMemes(fetched.sort((a, b) => submittedAtUtc(b) - submittedAtUtc(a) || b.id - a.id));
                setInitialError(false);
            } catch {
                // A failed refresh keeps the last good list; the next tick retries.
                if (controller.signal.aborted) return;
                if (!loaded) setInitialError(true);
            }
            if (controller.signal.aborted) return;
            timer = window.setTimeout(
                load,
                loaded ? REFRESH_INTERVAL_MS : INITIAL_RETRY_INTERVAL_MS
            );
        }

        void load();

        return () => {
            controller.abort();
            window.clearTimeout(timer);
        };
    }, [enabled, getToken]);

    // A new array identity on every refresh also retries photos that failed.
    const photoIds = useMemo(() => (memes ?? []).map((meme) => meme.sourcePhotoId), [memes]);
    const photoUrls = useMemePhotos(photoIds);

    const status: PresentationStatus = memes ? "ready" : initialError ? "error" : "loading";

    return { memes: memes ?? [], photoUrls, status };
}
