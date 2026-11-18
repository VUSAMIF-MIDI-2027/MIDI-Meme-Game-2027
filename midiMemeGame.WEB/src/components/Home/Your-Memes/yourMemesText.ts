import type { Lang } from "@/context/LanguageContext";
import type { MemeStatus } from "./yourMemesMock";

type YourMemesText = {
    title: string;
    description: string;
    empty: string;
    status: Record<MemeStatus, string>;
};

export const yourMemesText: Record<Lang, YourMemesText> = {
    lt: {
        title: "Tavo įkelti memai",
        description:
            "Visi tavo pateikti memai ir jų moderavimo būsena vienoje vietoje.",
        empty: "Kol kas tuščia — dar nieko neįkėlei, pirmyn!",
        status: {
            approved: "Patvirtintas",
            pending: "Laukiama patvirtinimo",
            rejected: "Atmestas",
        },
    },
    en: {
        title: "Your uploaded memes",
        description:
            "All your submitted memes and their moderation status in one place.",
        empty: "It's empty here — you didn't upload anything yet, please do!",
        status: {
            approved: "Approved",
            pending: "Pending review",
            rejected: "Rejected",
        },
    },
};
