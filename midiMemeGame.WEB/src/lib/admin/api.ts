"use client";

import { useAuth } from "@clerk/react";
import { useMemo } from "react";

export const UPLOAD_LIMITS = { types: ["image/jpeg", "image/png", "image/webp"], labels: "JPG, PNG or WEBP", maxBytes: 10 * 1024 * 1024 };

export type MemeStatus = "pending" | "approved" | "rejected";
export type Meme = { id: string; photoUrl: string; caption: string; authorName: string; submittedAt: string; status: MemeStatus };
export type Overview = { total: number; pending: number; approved: number; rejected: number; stage: string; votingOpen: boolean };
export type Photo = { id: string; fileName: string; url: string };
export type Voting = { startsAt: string; endsAt: string; isOpen: boolean; override: "open" | "closed" | null };
export type ResultItem = { id: string; photoUrl: string; caption: string; authorName: string; votes: number; rank: number };
export type Results = { items: ResultItem[]; canPublish: boolean; published: boolean };

export class ApiError extends Error {
    constructor(message: string, public status: number) { super(message); }
}

export function errorMessage(e: unknown): string {
    return e instanceof Error ? e.message : "Something went wrong";
}

export function useAdminApi() {
    const { getToken } = useAuth();

    return useMemo(() => {
        const headers = async (extra?: HeadersInit) => {
            const token = await getToken();
            return { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...extra };
        };

        async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
            const res = await fetch(path, {
                ...init,
                headers: await headers(init.body ? { "Content-Type": "application/json" } : undefined),
            });
            if (!res.ok) {
                let msg = `Request failed (${res.status})`;
                try { const b = await res.json(); msg = b.message ?? b.detail ?? msg; } catch { /* ignore */ }
                throw new ApiError(msg, res.status);
            }
            return res.status === 204 ? (undefined as T) : res.json();
        }
        const send = <T,>(method: string, path: string, body?: unknown) =>
            request<T>(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });

        return {
            overview: () => request<Overview>("/admin/overview"),
            memes: (status?: MemeStatus) => request<Meme[]>(`/admin/memes${status ? `?status=${status}` : ""}`),
            review: (id: string, decision: "approve" | "reject") => send<Meme>("POST", `/admin/memes/${id}/${decision}`),
            photos: () => request<Photo[]>("/api/admin/photos"),
            uploadPhoto: (file: File, onProgress: (pct: number) => void) =>
                new Promise<Photo>(async (resolve, reject) => {
                    const h = await headers();
                    const xhr = new XMLHttpRequest();
                    xhr.open("POST", "api/admin/photos");
                    Object.entries(h).forEach(([k, v]) => xhr.setRequestHeader(k, v as string));
                    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) return resolve(JSON.parse(xhr.responseText || "{}"));
                        let msg = `Upload failed (${xhr.status})`;
                        try { const b = JSON.parse(xhr.responseText); msg = b.message ?? b.detail ?? msg; } catch { /* ignore */ }
                        reject(new ApiError(msg, xhr.status));
                    };
                    xhr.onerror = () => reject(new ApiError("Network error", 0));
                    const form = new FormData();
                    form.append("file", file);
                    xhr.send(form);
                }),
            eventStart: () => request<{ startsAt: string }>("/admin/event-start"),
            saveEventStart: (startsAt: string) => send<{ startsAt: string }>("PUT", "/admin/event-start", { startsAt }),
            voting: () => request<Voting>("/admin/voting"),
            saveVotingSchedule: (startsAt: string, endsAt: string) => send<Voting>("PUT", "/admin/voting/schedule", { startsAt, endsAt }),
            setVotingOverride: (mode: "open" | "closed") => send<Voting>("PUT", "/admin/voting/override", { mode }),
            clearVotingOverride: () => send<Voting>("DELETE", "/admin/voting/override"),
            results: () => request<Results>("/admin/results"),
            publishResults: () => send<Results>("POST", "/admin/results/publish"),
        };
    }, [getToken]);
}