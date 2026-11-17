const apiBaseUrl = (
    process.env.NEXT_PUBLIC_API_BASE_URL
    ?? (process.env.NODE_ENV === "development" ? "http://localhost:5000" : "")
).replace(/[/]$/, "");

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
