import { apiBaseUrl } from "./apiBaseUrl";

export type Photo = {
    id: number;
};

export type SubmittedMeme = {
    id: number;
    sourcePhotoId: number;
    caption: string;
    statusId: number;
    score: number;
    createdAtUtc: string;
    updatedAtUtc: string;
};

export const MEME_STATUS_PENDING = 1;
export const MEME_STATUS_REJECTED = 2;
export const MEME_STATUS_APPROVED = 3;

// Backend ErrorType codes returned as `{ error: { code } }` with HTTP 500.
export const MEME_ERROR_SUBMISSIONS_NOT_OPEN = 2402;
export const MEME_ERROR_SUBMISSIONS_CLOSED = 2403;
export const MEME_ERROR_PHOTO_DISABLED = 2501;
export const MEME_ERROR_ACCESS_DENIED = 4004;

export class MemeServiceError extends Error {
    constructor(
        public status: number,
        public code?: number,
    ) { super(`Meme request failed: ${status}`); }
}

async function readErrorCode(response: Response): Promise<number | undefined> {
    try {
        const body: unknown = await response.json();
        const code = (body as { error?: { code?: unknown } } | null)?.error?.code;
        return typeof code === "number" ? code : undefined;
    } catch {
        return undefined;
    }
}

function isSubmittedMeme(value: unknown): value is SubmittedMeme {
    const meme = value as SubmittedMeme | null;
    return (
        Number.isInteger(meme?.id) &&
        Number.isInteger(meme?.sourcePhotoId) &&
        typeof meme?.caption === "string" &&
        Number.isInteger(meme?.statusId) &&
        typeof meme?.createdAtUtc === "string" &&
        Number.isFinite(Date.parse(meme.createdAtUtc))
    );
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

export async function submitMeme(
    sourcePhotoId: number,
    caption: string,
    token: string,
    signal?: AbortSignal
): Promise<SubmittedMeme> {
    const response = await fetch(apiBaseUrl + "/api/memes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ sourcePhotoId, caption }),
        signal,
        cache: "no-store",
    });
    if (!response.ok) {
        throw new MemeServiceError(response.status, await readErrorCode(response));
    }

    const meme: unknown = await response.json();
    if (!isSubmittedMeme(meme)) {
        throw new Error("Invalid meme submission response.");
    }
    return meme;
}

export async function getMyMemes(token: string, signal?: AbortSignal): Promise<SubmittedMeme[]> {
    const response = await fetch(apiBaseUrl + "/api/memes/mine", {
        headers: { Authorization: "Bearer " + token },
        signal,
        cache: "no-store",
    });
    if (!response.ok) {
        throw new MemeServiceError(response.status, await readErrorCode(response));
    }

    const memes: unknown = await response.json();
    if (!Array.isArray(memes) || !memes.every(isSubmittedMeme)) {
        throw new Error("Invalid memes response.");
    }
    return memes;
}
