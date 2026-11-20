import { adminText } from "./pageText";

export type Section = "overview" | "meme-approval" | "photos" | "schedule" | "team" | "rules";
export type AdminTranslations = (typeof adminText)["en"];

export type SectionConfig = {
    id: Section;
    getTitle: (t: AdminTranslations) => string;
    getDescription: (t: AdminTranslations) => string;
};

export const SECTIONS: readonly SectionConfig[] = [
    {
        id: "overview",
        getTitle: (t) => t.title,
        getDescription: (t) => t.description,
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
        id: "schedule",
        getTitle: (t) => t.schedule,
        getDescription: (t) => t.scheduleDescription,
    },
    {
        id: "team",
        getTitle: (t) => t.team,
        getDescription: (t) => t.teamDescription,
    },
    {
        id: "rules",
        getTitle: (t) => t.rules,
        getDescription: (t) => t.rulesDescription,
    },
];

const VALID_SECTIONS = new Set<Section>(SECTIONS.map((s) => s.id));

export function parseSection(raw: string | null): Section {
    if (raw && VALID_SECTIONS.has(raw as Section)) {
        return raw as Section;
    }
    return "overview";
}