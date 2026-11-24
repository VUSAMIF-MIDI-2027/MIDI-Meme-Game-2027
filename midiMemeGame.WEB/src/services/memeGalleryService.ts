import { apiBaseUrl } from "./apiBaseUrl";

export type GalleryMeme = {
    id: number;
    sourcePhotoId: number;
    caption: string;
    userName?: string | null;
    createdAtUtc: string;
    hasVoted: boolean;
    isOwnMeme: boolean;
};

export type VoteStatus = {
    remainingVotes: number;
    votedMemeIds: number[];
};

export class VotingError extends Error {
    constructor(public status: number) {
        super(`Voting request failed: HTTP ${status}`);
    }
}

async function request(path: string, token: string, signal: AbortSignal, init: RequestInit = {}): Promise<unknown> {
    const response = await fetch(apiBaseUrl + path, {
        ...init,
        headers: {
            Authorization: "Bearer " + token,
            ...(init.body ? { "Content-Type": "application/json" } : {}),
        },
        signal,
        cache: "no-store",
    });
    if (!response.ok) throw new VotingError(response.status);
    return response.json();
}

function isVoteStatus(value: unknown): value is VoteStatus {
    const status = value as VoteStatus | null;
    return Number.isInteger(status?.remainingVotes)
        && Array.isArray(status?.votedMemeIds)
        && status.votedMemeIds.every(Number.isInteger);
}

function isGalleryMeme(value: unknown): value is GalleryMeme {
    const meme = value as GalleryMeme | null;
    return Number.isInteger(meme?.id)
        && Number.isInteger(meme?.sourcePhotoId)
        && typeof meme?.caption === "string"
        && typeof meme?.isOwnMeme === "boolean";
}

export async function getGalleryMemes(token: string, signal: AbortSignal): Promise<GalleryMeme[]> {
    const memes = await request("/api/voting/memes", token, signal);
    if (!Array.isArray(memes) || !memes.every(isGalleryMeme)) throw new Error("Invalid gallery response.");
    return memes;
}

export async function getVoteStatus(token: string, signal: AbortSignal): Promise<VoteStatus> {
    const status = await request("/api/voting/me", token, signal);
    if (!isVoteStatus(status)) throw new Error("Invalid vote status response.");
    return status;
}

export async function setMemeVote(memeId: number, voted: boolean, token: string, signal: AbortSignal): Promise<VoteStatus> {
    const status = await request(`/api/voting/memes/${memeId}/vote`, token, signal, {
        method: "PUT",
        body: JSON.stringify({ voted }),
    });
    if (!isVoteStatus(status)) throw new Error("Invalid vote response.");
    return status;
}
