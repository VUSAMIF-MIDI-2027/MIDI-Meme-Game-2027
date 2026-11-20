import { apiBaseUrl } from "./apiBaseUrl";

export type CurrentUser = {
    userId: number;
    rulesAcknowledgedAtUtc: string | null;
};

export async function resetRulesAcknowledgements(token: string, signal: AbortSignal): Promise<number> {
    const response = await fetch(apiBaseUrl + "/api/admin/users/reset-rules-acknowledgements", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        signal,
        cache: "no-store",
    });
    if (response.status === 401 || response.status === 403) throw new Error("ACCESS_DENIED");
    if (!response.ok) throw new Error("Rules reset failed: HTTP " + response.status);
    const data = await response.json();
    if (!Number.isInteger(data?.updatedUsers) || data.updatedUsers < 0) {
        throw new Error("Invalid rules reset response.");
    }
    return data.updatedUsers;
}

export async function getCurrentUser(token: string, signal: AbortSignal): Promise<CurrentUser> {
    const response = await fetch(apiBaseUrl + "/api/users/me", {
        headers: { Authorization: "Bearer " + token },
        signal,
        cache: "no-store",
    });
    if (!response.ok) throw new Error("User lookup failed: HTTP " + response.status);
    const user = await response.json();
    if (typeof user?.userId !== "number" ||
        !(user.rulesAcknowledgedAtUtc === null || typeof user.rulesAcknowledgedAtUtc === "string")) {
        throw new Error("Invalid current user response.");
    }
    return user;
}

export async function acknowledgeRules(token: string, signal: AbortSignal): Promise<void> {
    const response = await fetch(apiBaseUrl + "/api/users/me/rules-acknowledgement", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        signal,
        cache: "no-store",
    });
    if (!response.ok) throw new Error("Rules acknowledgement failed: HTTP " + response.status);
}

export async function syncUser(token: string, signal: AbortSignal): Promise<void> {
    const response = await fetch(apiBaseUrl + "/api/users/sync", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        signal,
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error("User synchronization failed: HTTP " + response.status);
    }
}

export type AdminUser = {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
};

export class AdminUserError extends Error {
    constructor(public status: number) {
        super(`Admin user request failed: ${status}`);
    }
}

export async function lookupAdminUser(email: string, token: string, signal: AbortSignal): Promise<AdminUser> {
    const response = await fetch(apiBaseUrl + "/api/admin/users/lookup?" + new URLSearchParams({ email: email.trim() }), {
        headers: { Authorization: "Bearer " + token },
        signal,
        cache: "no-store",
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
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        signal,
        cache: "no-store",
    });
    if (!response.ok) throw new AdminUserError(response.status);
}

// Photos
export class PhotoBlobError extends Error {
    constructor(public status: number) { super(`Get photo file request failed: ${status}`); }
}
export async function getPhotoBlob(photoId: number,token: string,signal?: AbortSignal): Promise<Blob> {
    const response = await fetch(apiBaseUrl + `/api/photos/${photoId}/file`, {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
        signal,
        cache: "no-store",
    });
    if (!response.ok) throw new PhotoBlobError(response.status);
    return response.blob();
}