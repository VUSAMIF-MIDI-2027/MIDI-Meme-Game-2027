import type { Lang } from "@/context/LanguageContext";
import type { MemeStatus } from "./yourMemesMock";

type YourMemesText = {
    eyebrow: string;
    title: string;
    description: string;
    empty: string;
    emptyTitle: string;
    submitted: string;
    status: Record<MemeStatus, string>;
};

export const yourMemesText: Record<Lang, YourMemesText> = {
    lt: {
        eyebrow: "Tavo darbai",
        title: "Mano memai",
        description:
            "Visi tavo pateikti memai ir jų moderavimo būsena vienoje vietoje.",
        empty: "Kai pateiksi memą, jis atsiras čia.",
        emptyTitle: "Kol kas tuščia",
        submitted: "Pateikta",
        status: {
            approved: "Patvirtintas",
            pending: "Laukiama patvirtinimo",
            rejected: "Atmestas",
        },
    },
    en: {
        eyebrow: "Your creations",
        title: "My memes",
        description:
            "All your submitted memes and their moderation status in one place.",
        empty: "Your memes will appear here after you submit them.",
        emptyTitle: "Nothing here yet",
        submitted: "Submitted",
        status: {
            approved: "Approved",
            pending: "Pending review",
            rejected: "Rejected",
        },
    },
};
