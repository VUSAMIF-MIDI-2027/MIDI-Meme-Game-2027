import {
    getAdminPhotos,
    AdminUserError,
    type AdminPhoto,
} from "@/services/adminService";
import { apiBaseUrl } from "@/services/apiBaseUrl";

export const PHOTOS_STORAGE_DIR = "midi_admin/photos";
export const PHOTOS_STORAGE_KEY = `${PHOTOS_STORAGE_DIR}/items`;

export function readStoredPhotos(): AdminPhoto[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(PHOTOS_STORAGE_KEY);
        if (!raw) return [];
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
            (item): item is AdminPhoto =>
                typeof item === "object" &&
                item !== null &&
                typeof (item as AdminPhoto).id === "number" &&
                typeof (item as AdminPhoto).isEnabled === "boolean"
        );
    } catch {
        return [];
    }
}

export function writeStoredPhotos(photos: AdminPhoto[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(photos));
}

export async function syncAdminPhotosToStorage(
    token: string,
    signal: AbortSignal
): Promise<AdminPhoto[]> {
    const fetched = await getAdminPhotos(token, signal);
    writeStoredPhotos(fetched);
    return fetched;
}

export async function resolvePhotoUrlById(
    sourcePhotoId: number,
    getToken: () => Promise<string | null>,
    signal?: AbortSignal
): Promise<string | null> {
    let stored = readStoredPhotos();
    let matched = stored.find((p) => p.id === sourcePhotoId);

    if (!matched) {
        const token = await getToken();
        if (signal?.aborted) return null;
        if (!token) throw new AdminUserError(401);
        stored = await syncAdminPhotosToStorage(
            token,
            signal ?? AbortSignal.timeout(20_000)
        );
        matched = stored.find((p) => p.id === sourcePhotoId);
    }

    if (!matched) return null;
    return `${apiBaseUrl}/api/photos/${matched.id}/file`;
}