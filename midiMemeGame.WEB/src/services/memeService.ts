import { apiBaseUrl } from "./apiBaseUrl";

export type Photo = {
    id: number;
};

export type SubmittedMeme = {
    id: number;
    photoId: number;
    caption: string;
    statusId: number;
    createdAtUtc: string;
};

export const MEME_STATUS_PENDING = 1;

export class MemeServiceError extends Error {
    constructor(public status: number) { super(`Meme request failed: ${status}`); }
}

export async function getPhotos(token: string, signal?: AbortSignal): Promise<Photo[]> {
    const response = await fetch(apiBaseUrl + "/api/photos", {
        headers: { Authorization: "Bearer " + token },
        signal,
        cache: "no-store",
    });
    if (!response.ok) throw new MemeServiceError(response.status);

    const photos: unknown = await response.json();
    if (!Array.isArray(photos) || !photos.every(photo => Number.isInteger(photo?.id) && photo.id > 0)) {
        throw new Error("Invalid photos response.");
    }
    return photos;
}

const useMock = process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_MOCK_MEME_SUBMIT !== "false"
    : process.env.NEXT_PUBLIC_MOCK_MEME_SUBMIT === "true";

export const useMockPhotos = process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_MOCK_PHOTOS !== "false"
    : process.env.NEXT_PUBLIC_MOCK_PHOTOS === "true";

export const MOCK_PHOTO_URLS: Record<number, string> = Object.fromEntries(
    Array.from({ length: 24 }, (_, index) => [
        index + 1,
        `https://picsum.photos/seed/midi-meme-${index + 1}/640/480`,
    ]),
);

const MOCK_SUBMIT_DELAY_MS = 800;

export async function submitMeme(
    photoId: number,
    caption: string,
    token: string,
    signal?: AbortSignal
): Promise<SubmittedMeme> {
    if (useMock) return mockSubmitMeme(photoId, caption, signal);

    const response = await fetch(apiBaseUrl + "/api/memes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ photoId, caption }),
        signal,
        cache: "no-store",
    });
    if (!response.ok) throw new MemeServiceError(response.status);

    const meme: unknown = await response.json();
    if (!Number.isInteger((meme as SubmittedMeme | null)?.id)) {
        throw new Error("Invalid meme submission response.");
    }
    return meme as SubmittedMeme;
}

function mockSubmitMeme(photoId: number, caption: string, signal?: AbortSignal): Promise<SubmittedMeme> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            signal?.removeEventListener("abort", onAbort);
            resolve({
                id: Date.now(),
                photoId,
                caption,
                statusId: MEME_STATUS_PENDING,
                createdAtUtc: new Date().toISOString(),
            });
        }, MOCK_SUBMIT_DELAY_MS);

        function onAbort() {
            clearTimeout(timer);
            reject(signal?.reason ?? new DOMException("Aborted", "AbortError"));
        }
        signal?.addEventListener("abort", onAbort, { once: true });
    });
}
