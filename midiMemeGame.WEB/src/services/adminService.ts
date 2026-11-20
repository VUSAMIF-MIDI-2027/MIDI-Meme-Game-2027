const apiBaseUrl = (
    process.env.NEXT_PUBLIC_API_BASE_URL
    ?? (process.env.NODE_ENV === "development" ? "http://localhost:5000" : "")
).replace(/[/]$/, "");


export type AdminUser = { 
    userId: number;
    firstName: string;
    lastName: string;
    email: string
};
export class AdminUserError extends Error {
    constructor(public status: number) { super(`Admin user request failed: ${status}`); }
}
export async function lookupAdminUser(email: string, token: string, signal: AbortSignal): Promise<AdminUser> {
    const response = await fetch(apiBaseUrl + "/api/admin/users/lookup?" + new URLSearchParams({ email: email.trim() }), {
        headers: { Authorization: "Bearer " + token }, signal, cache: "no-store",
    });
    if (!response.ok) throw new AdminUserError(response.status);
    const user = await response.json();
    if (!Number.isInteger(user?.userId) || user.userId <= 0 ||
        ![user.firstName, user.lastName, user.email].every(value => typeof value === "string")) {
        throw new Error("Invalid user lookup response.");
    }
    return user;
}

export async function grantAdminRole(userId: number, token: string, signal: AbortSignal): Promise<void> {
    const response = await fetch(apiBaseUrl + `/api/admin/users/${userId}/grant-admin`, {
        method: "POST", headers: { Authorization: "Bearer " + token }, signal, cache: "no-store",
    });
    if (!response.ok) throw new AdminUserError(response.status);
}

export interface AdminPhoto {id: number;isEnabled: boolean;}
export class AdminPhotoError extends Error {
    constructor(public status: number) { super(`Admin photo (GET) request failed: ${status}`); }
}
export async function getAdminPhotos(token: string, signal: AbortSignal): Promise<AdminPhoto[]> {
    const response = await fetch(`${apiBaseUrl}/api/admin/photos`, {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
        signal,
        cache: "no-store",
    });
    if (!response.ok) throw new AdminUserError(response.status);

    const photos: AdminPhoto[] = await response.json();
    return photos;
}

export interface UploadedPhoto { id: number; isEnabled?: boolean; }
export function uploadAdminPhoto(
    file: File,
    token: string,
    onProgress?: (percent: number) => void,
    signal?: AbortSignal
): Promise<UploadedPhoto> {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
            return;
        }

        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${apiBaseUrl}/api/admin/photos`);
        xhr.responseType = "json";
        xhr.setRequestHeader("Authorization", "Bearer " + token);

        const onAbort = () => {
            xhr.abort();
            reject(signal?.reason ?? new DOMException("Aborted", "AbortError"));
        };
        signal?.addEventListener("abort", onAbort, { once: true });

        const cleanup = () => {
            signal?.removeEventListener("abort", onAbort);
        };

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                const percent = Math.round((event.loaded / event.total) * 100);
                onProgress(percent);
            }
        };

        xhr.onload = () => {
            cleanup();
            if (xhr.status >= 200 && xhr.status < 300) {
                const body = xhr.response as UploadedPhoto | null;
                if (body && typeof body.id === "number") {
                    resolve(body);
                } else {
                    reject(new Error("Upload succeeded but response was missing photo id"));
                }
            } else {
                reject(new AdminUserError(xhr.status));
            }
        };

        xhr.onerror = () => {
            cleanup();
            reject(new Error("Network error while uploading photo"));
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
    const response = await fetch(`${apiBaseUrl}/api/admin/photos/${photoId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ isEnabled }),
        signal,
    });
    if (!response.ok) throw new AdminUserError(response.status);

    // Handle both 200 JSON body and 204 No Content responses safely
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }
    return { id: photoId, isEnabled };
}