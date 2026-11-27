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
    isInvalidatedBySourcePhoto: boolean;
    publishMeme?: boolean;
    galleryPublicationAccepted?: boolean;
    publishName?: boolean;
};

export const MEME_STATUS_PENDING = 1;
export const MEME_STATUS_REJECTED = 2;
export const MEME_STATUS_APPROVED = 3;

export const MEME_SUBMISSION_LIMIT = 3;

// Backend ErrorType codes returned as `{ error: { code } }` with HTTP 500.
export const MEME_ERROR_SUBMISSIONS_NOT_OPEN = 2402;
export const MEME_ERROR_SUBMISSIONS_CLOSED = 2403;
export const MEME_ERROR_LIMIT_REACHED = 2700;
export const MEME_ERROR_PHOTO_DISABLED = 2701;
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
        Number.isFinite(Date.parse(meme.createdAtUtc)) &&
        typeof meme?.isInvalidatedBySourcePhoto === "boolean"
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
    publication: { acceptGalleryPublication: boolean; publishName: boolean },
    signal?: AbortSignal
): Promise<SubmittedMeme> {
    const response = await fetch(apiBaseUrl + "/api/memes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ sourcePhotoId, caption, ...publication }),
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

export async function updateMemeCaption(
    memeId: number,
    caption: string,
    token: string,
    signal?: AbortSignal
): Promise<SubmittedMeme> {
    const response = await fetch(apiBaseUrl + `/api/memes/${memeId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ caption }),
        signal,
        cache: "no-store",
    });
    if (!response.ok) {
        throw new MemeServiceError(response.status, await readErrorCode(response));
    }

    const meme: unknown = await response.json();
    if (!isSubmittedMeme(meme)) {
        throw new Error("Invalid meme update response.");
    }
    return meme;
}

export async function deleteMeme(
    memeId: number,
    token: string,
    signal?: AbortSignal
): Promise<void> {
    const response = await fetch(apiBaseUrl + `/api/memes/${memeId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
        signal,
        cache: "no-store",
    });
    if (!response.ok) {
        throw new MemeServiceError(response.status, await readErrorCode(response));
    }
}

export async function withdrawMemePublication(
    memeId: number,
    nameOnly: boolean,
    token: string,
): Promise<void> {
    const response = await fetch(apiBaseUrl + `/api/memes/${memeId}/publication?nameOnly=${nameOnly}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
        cache: "no-store",
    });
    if (!response.ok) {
        throw new MemeServiceError(response.status, await readErrorCode(response));
    }
}

export async function setMemeNamePublication(
    memeId: number,
    publishName: boolean,
    token: string,
): Promise<void> {
    const response = await fetch(apiBaseUrl + `/api/memes/${memeId}/publication/name`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
        body: JSON.stringify(publishName),
        cache: "no-store",
    });
    if (!response.ok) {
        throw new MemeServiceError(response.status, await readErrorCode(response));
    }
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
