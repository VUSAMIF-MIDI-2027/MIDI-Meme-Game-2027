import { apiBaseUrl } from "./apiBaseUrl";
import { ApiError } from "./ApiError";

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

// Photos
export async function getPhotoBlob(photoId: number, token: string, signal?: AbortSignal): Promise<Blob> {
    let response: Response;
    try {
        response = await fetch(`${apiBaseUrl}/api/photos/${photoId}/file`, {
            method: "GET",
            headers: { Authorization: "Bearer " + token },
            signal,
        });
    } catch (error) {
        if (error instanceof DOMException) throw error; // abort or timeout
        throw ApiError.network();
    }
    if (!response.ok) throw await ApiError.fromResponse(response);
    return response.blob();
}
