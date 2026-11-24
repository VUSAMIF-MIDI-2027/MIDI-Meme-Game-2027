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
    imageUrl: string;
};

export type Winner = ResultMeme & { place: PodiumPlace };

// One item of the GET /api/results array. The API also sends the score, status and
// timestamps; they are left out on purpose so they can never end up on the page.
type ResultResponse = {
    id: number;
    place: number;
    sourcePhotoId: number;
    caption: string;
    userName: string | null;
};

async function readJson<T>(response: Response): Promise<T> {
    try {
        return (await response.json()) as T;
    } catch {
        throw ApiError.invalidResponse();
    }
}

const isPodiumPlace = (place: number): place is PodiumPlace => place >= 1 && place <= 3;

const toResultMeme = (result: ResultResponse): ResultMeme => ({
    id: result.id,
    place: result.place,
    userName: result.userName?.trim() ?? "",
    caption: result.caption.trim(),
    imageUrl: `${apiBaseUrl}/api/photos/${result.sourcePhotoId}/file`,
});

// The API returns every ranked meme, already ordered by place.
export async function getResults(signal: AbortSignal): Promise<{ winners: Winner[]; others: ResultMeme[] }> {
    let response: Response;
    try {
        response = await fetch(`${apiBaseUrl}/api/results`, {
            headers: { Accept: "application/json" },
            signal,
            cache: "no-store",
        });
    } catch (error) {
        if (error instanceof DOMException) throw error; // abort or timeout
        throw ApiError.network();
    }
    if (!response.ok) throw await ApiError.fromResponse(response);

    const results = (await readJson<ResultResponse[]>(response)).map(toResultMeme);

    return {
        winners: results.filter((meme): meme is Winner => isPodiumPlace(meme.place)),
        others: results.filter(meme => !isPodiumPlace(meme.place)),
    };
}
