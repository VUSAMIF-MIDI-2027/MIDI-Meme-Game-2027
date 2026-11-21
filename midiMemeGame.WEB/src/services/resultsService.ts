import { apiBaseUrl } from "./apiBaseUrl";

export type ResultMeme = {
    id: string;
    firstName: string;
    lastName: string;
    caption: string;
    imageUrl: string;
};

export type Winner = ResultMeme & { place: 1 | 2 | 3 };

export type ResultMemesPage = {
    items: ResultMeme[];
    page: number;
    hasMore: boolean;
};

export class ResultsError extends Error {
    constructor(public status: number) {
        super(`Results request failed: HTTP ${status}`);
    }
}

type Raw = Record<string, unknown>;

const resultsUrl = apiBaseUrl + "/api/results";
const memesUrl = apiBaseUrl + "/api/results/memes";

const isRecord = (value: unknown): value is Raw =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const toText = (value: unknown) =>
    typeof value === "string" ? value.trim()
        : typeof value === "number" ? String(value)
            : "";

function listFrom(payload: unknown, keys: string[]): unknown[] {
    if (Array.isArray(payload)) return payload;
    if (isRecord(payload)) {
        for (const key of keys) {
            if (Array.isArray(payload[key])) return payload[key] as unknown[];
        }
    }
    return [];
}

function resolveImageUrl(raw: Raw) {
    const url = toText(raw.imageUrl) || toText(raw.photoUrl);
    if (url) return /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(url) ? url : apiBaseUrl + (url.startsWith("/") ? url : `/${url}`);

    const photoId = toText(raw.sourcePhotoId) || toText(raw.photoId);
    return photoId ? `${apiBaseUrl}/api/photos/${encodeURIComponent(photoId)}/file` : "";
}

// Only the fields shown on the public page are copied. Scores, decisions,
// emails and any other extra fields in the response are dropped here.
function toMeme(value: unknown): ResultMeme | null {
    if (!isRecord(value)) return null;
    if (value.isPublished === false || value.published === false) return null;

    const meme = {
        id: toText(value.id),
        firstName: toText(value.firstName),
        lastName: toText(value.lastName),
        caption: toText(value.caption),
        imageUrl: resolveImageUrl(value),
    };

    return meme.id || meme.imageUrl || meme.caption ? meme : null;
}

async function readJson(response: Response): Promise<unknown> {
    if (!response.ok) throw new ResultsError(response.status);
    return response.json();
}

/** Returns null while the results have not been published yet. */
export async function getResults(signal: AbortSignal): Promise<Winner[] | null> {
    const response = await fetch(resultsUrl, { signal, cache: "no-store", headers: { Accept: "application/json" } });
    if (response.status === 404) return null;

    const payload = await readJson(response);
    const listed = listFrom(payload, ["winners", "items"]);
    const winners: Winner[] = [];

    listed.forEach((entry, index) => {
        const meme = toMeme(entry);
        const place = Number(isRecord(entry) ? entry.place : undefined) || index + 1;
        if (meme && (place === 1 || place === 2 || place === 3)) winners.push({ ...meme, place });
    });

    return winners
        .sort((a, b) => a.place - b.place)
        .filter((winner, index, all) => all.findIndex(other => other.place === winner.place) === index);
}

export async function getResultMemes(page: number, pageSize: number, signal: AbortSignal): Promise<ResultMemesPage> {
    const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    const response = await fetch(`${memesUrl}?${query}`, { signal, cache: "no-store", headers: { Accept: "application/json" } });
    if (response.status === 404) return { items: [], page, hasMore: false };

    const payload = await readJson(response);
    const entries = listFrom(payload, ["items", "memes"]);
    const meta = isRecord(payload) ? payload : {};

    const hasMore = typeof meta.hasMore === "boolean" ? meta.hasMore
        : typeof meta.hasNextPage === "boolean" ? meta.hasNextPage
            : typeof meta.totalPages === "number" ? page < meta.totalPages
                : typeof meta.totalCount === "number" ? page * pageSize < meta.totalCount
                    : entries.length >= pageSize;

    return {
        items: entries.map(toMeme).filter((meme): meme is ResultMeme => meme !== null),
        page,
        hasMore,
    };
}
