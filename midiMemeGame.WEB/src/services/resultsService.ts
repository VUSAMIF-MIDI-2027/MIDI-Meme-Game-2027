import { apiBaseUrl } from "./apiBaseUrl";
import { ApiError } from "./ApiError";

// Backend ErrorType codes returned by GET /api/results.
export const EVENT_SCHEDULE_NOT_FOUND = 2400;
export const RESULTS_NOT_AVAILABLE = 2407; // the event has not ended yet
export const RESULTS_NOT_PUBLISHED = 2408; // the event ended, results are not published yet

export type PodiumPlace = 1 | 2 | 3;

export type ResultMeme = {
    id: number;
    place: number;
    userName: string;
    caption: string;
    score: number;
    imageUrl: string;
};

export type Winner = ResultMeme & { place: PodiumPlace };

// Fields used by the results page from each ranked item.
type ResultResponse = {
    id: number;
    place: number;
    sourcePhotoId: number;
    caption: string;
    userName: string | null;
    score: number;
};

type ResultsPageResponse = {
    items: ResultResponse[];
    nextAfterPlace: number | null;
    publicationVersion: string;
};

const GALLERY_PAGE_SIZE = 12;
const PODIUM_SIZE = 3;

async function readJson<T>(response: Response): Promise<T> {
    try {
        return (await response.json()) as T;
    } catch {
        throw ApiError.invalidResponse();
    }
}

const isPodiumPlace = (place: number): place is PodiumPlace => Number.isInteger(place) && place >= 1 && place <= PODIUM_SIZE;

const toResultMeme = (result: ResultResponse): ResultMeme => ({
    id: result.id,
    place: result.place,
    userName: result.userName?.trim() ?? "",
    caption: result.caption.trim(),
    score: result.score,
    imageUrl: `${apiBaseUrl}/api/photos/${result.sourcePhotoId}/file`,
});

export async function getResults(signal: AbortSignal, afterPlace = 0) {
    const limit = GALLERY_PAGE_SIZE + (afterPlace === 0 ? PODIUM_SIZE : 0);
    const params = new URLSearchParams({ afterPlace: String(afterPlace), limit: String(limit) });
    let response: Response;
    try {
        response = await fetch(`${apiBaseUrl}/api/results/page?${params}`, {
            headers: { Accept: "application/json" },
            signal,
            cache: "no-store",
        });
    } catch (error) {
        if (error instanceof DOMException) throw error; // abort or timeout
        throw ApiError.network();
    }
    if (!response.ok) throw await ApiError.fromResponse(response);

    const page = await readJson<ResultsPageResponse | null>(response);
    if (!page || !Array.isArray(page.items) || typeof page.publicationVersion !== "string"
        || (page.nextAfterPlace !== null && (!Number.isInteger(page.nextAfterPlace)
            || page.nextAfterPlace <= afterPlace || page.nextAfterPlace !== page.items.at(-1)?.place))) {
        throw ApiError.invalidResponse();
    }

    const results = page.items.map(toResultMeme);

    return {
        winners: results.filter((meme): meme is Winner => isPodiumPlace(meme.place)),
        others: results.filter(meme => !isPodiumPlace(meme.place)),
        nextAfterPlace: page.nextAfterPlace,
        publicationVersion: page.publicationVersion,
    };
}
