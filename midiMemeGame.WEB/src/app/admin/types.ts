import { adminText } from "./pageText";

export type Section = "overview" | "meme-approval" | "photos" | "settings";
export type AdminTranslations = (typeof adminText)["en"];

export type SectionConfig = {
    id: Section;
    getTitle: (t: AdminTranslations) => string;
    getDescription: (t: AdminTranslations) => string;
};

export const SECTIONS: readonly SectionConfig[] = [
    {
        id: "overview",
        getTitle: (t) => t.overview,
        getDescription: (t) => t.overviewDescription,
    },
    {
        id: "meme-approval",
        getTitle: (t) => t.memeReview,
        getDescription: (t) => t.memeReviewDescription,
    },
    {
        id: "photos",
        getTitle: (t) => t.photos,
        getDescription: (t) => t.photosDescription,
    },
    {
        id: "settings",
        getTitle: (t) => t.settings,
        getDescription: (t) => t.settingsDescription,
    },
];

const VALID_SECTIONS = new Set<Section>(SECTIONS.map((s) => s.id));

export function parseSection(raw: string | null): Section {
    if (raw && VALID_SECTIONS.has(raw as Section)) {
        return raw as Section;
    }
    return "overview";
}