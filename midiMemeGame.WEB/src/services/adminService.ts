import { apiBaseUrl } from "./apiBaseUrl";
import { ApiError } from "./ApiError";

const authHeaders = (token: string): Record<string, string> => ({
    Authorization: "Bearer " + token,
});

async function send(url: string, init: RequestInit): Promise<Response> {
    let response: Response;
    try {
        response = await fetch(url, init);
    } catch (error) {
        if (error instanceof DOMException) throw error; // abort or timeout, handled by errorMessage
        throw ApiError.network();
    }
    if (!response.ok) throw await ApiError.fromResponse(response);
    return response;
}

async function readJson<T>(response: Response): Promise<T> {
    try {
        return (await response.json()) as T;
    } catch {
        throw ApiError.invalidResponse();
    }
}

const isJson = (response: Response) =>
    response.headers.get("content-type")?.includes("application/json") ?? false;

/******************************************************************************/
// USERS
/******************************************************************************/

export type AdminUser = {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
};

export async function lookupAdminUser(email: string, token: string, signal: AbortSignal): Promise<AdminUser> {
    const query = new URLSearchParams({ email: email.trim() });
    const response = await send(`${apiBaseUrl}/api/admin/users/lookup?${query}`, {
        headers: authHeaders(token),
        signal,
        cache: "no-store",
    });

    const user = await readJson<AdminUser>(response);
    if (
        !Number.isInteger(user?.userId) || user.userId <= 0 ||
        ![user.firstName, user.lastName, user.email].every(value => typeof value === "string")
    ) {
        throw ApiError.invalidResponse();
    }
    return user;
}

export async function grantAdminRole(userId: number, token: string, signal: AbortSignal): Promise<void> {
    await send(`${apiBaseUrl}/api/admin/users/${userId}/grant-admin`, {
        method: "POST",
        headers: authHeaders(token),
        signal,
        cache: "no-store",
    });
}

/******************************************************************************/
// PHOTOS
/******************************************************************************/

export interface AdminPhoto { id: number; isEnabled: boolean }

export async function getAdminPhotos(token: string, signal: AbortSignal): Promise<AdminPhoto[]> {
    const response = await send(`${apiBaseUrl}/api/admin/photos`, {
        method: "GET",
        headers: authHeaders(token),
        signal,
        cache: "no-store",
    });
    return readJson<AdminPhoto[]>(response);
}

export interface UploadedPhoto { id: number; isEnabled?: boolean }

export function uploadAdminPhoto(
    file: File,
    token: string,
    onProgress?: (percent: number) => void,
    signal?: AbortSignal
): Promise<UploadedPhoto> {
    return new Promise((resolve, reject) => {
        const abortReason = () => signal?.reason ?? new DOMException("Aborted", "AbortError");

        if (signal?.aborted) {
            reject(abortReason());
            return;
        }

        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${apiBaseUrl}/api/admin/photos`);
        xhr.responseType = "json";
        xhr.setRequestHeader("Authorization", "Bearer " + token);

        const cleanup = () => signal?.removeEventListener("abort", onAbort);
        const onAbort = () => {
            cleanup();
            xhr.abort();
            reject(abortReason());
        };
        signal?.addEventListener("abort", onAbort, { once: true });

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                onProgress(Math.round((event.loaded / event.total) * 100));
            }
        };

        xhr.onload = () => {
            cleanup();
            if (xhr.status >= 200 && xhr.status < 300) {
                const body = xhr.response as UploadedPhoto | null;
                if (body && typeof body.id === "number") resolve(body);
                else reject(ApiError.invalidResponse());
            } else {
                reject(ApiError.fromParts(xhr.status, xhr.response));
            }
        };

        xhr.onerror = () => {
            cleanup();
            reject(ApiError.network());
        };

        const formData = new FormData();
        formData.append("file", file);
        xhr.send(formData);
    });
}

export async function patchAdminPhoto(
    photoId: number,
    isEnabled: boolean,
    token: string,
    signal?: AbortSignal
): Promise<AdminPhoto> {
    const response = await send(`${apiBaseUrl}/api/admin/photos/${photoId}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({ isEnabled }),
        signal,
        cache: "no-store",
    });

    // 200 with JSON body or 204 No Content.
    return isJson(response) ? readJson<AdminPhoto>(response) : { id: photoId, isEnabled };
}

/******************************************************************************/
// MEMES
/******************************************************************************/

export const MEME_STATUS = {
    pending: 1,
    rejected: 2,
    approved: 3,
} as const;

export type MemeStatusId = (typeof MEME_STATUS)[keyof typeof MEME_STATUS];

export interface AdminMeme {
    id: number;
    sourcePhotoId: number;
    caption: string;
    statusId: MemeStatusId;
    score: number;
    createdAtUtc: string;
    updatedAtUtc: string;
    isInvalidatedBySourcePhoto: boolean;
}

export async function getAdminMemes(
    token: string,
    signal?: AbortSignal,
    statusId?: MemeStatusId
): Promise<AdminMeme[]> {
    const query = statusId ? `?${new URLSearchParams({ statusId: String(statusId) })}` : "";
    const response = await send(`${apiBaseUrl}/api/admin/memes${query}`, {
        method: "GET",
        headers: authHeaders(token),
        signal,
        cache: "no-store",
    });
    return readJson<AdminMeme[]>(response);
}

export async function patchAdminMemeStatus(
    memeId: number,
    statusId: MemeStatusId,
    token: string,
    signal?: AbortSignal
): Promise<AdminMeme> {
    const params = new URLSearchParams({ statusId: String(statusId) });
    const response = await send(`${apiBaseUrl}/api/admin/memes/${memeId}/status?${params}`, {
        method: "PATCH",
        headers: authHeaders(token),
        signal,
        cache: "no-store",
    });

    if (isJson(response)) return readJson<AdminMeme>(response);

    return {
        id: memeId,
        sourcePhotoId: 0,
        caption: "",
        statusId,
        score: 0,
        createdAtUtc: "",
        updatedAtUtc: new Date().toISOString(),
        isInvalidatedBySourcePhoto: false,
    };
}