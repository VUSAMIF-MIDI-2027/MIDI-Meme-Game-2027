import type { Lang } from "@/context/LanguageContext";

type MemeApprovalText = {
    eyebrow: string;
    title: string;
    comingSoonTitle: string;
    comingSoonDescription: string;
};

export const memeApprovalText: Record<Lang, MemeApprovalText> = {
    lt: {
        eyebrow: "Moderiavimas",
        title: "Memų patvirtinimas",
        comingSoonTitle: "Netrukus",
        comingSoonDescription:
            "Ši skiltis dar kuriama. Netrukus čia galėsi peržiūrėti ir patvirtinti arba atmesti dalyvių pateiktus memus.",
    },
    en: {
        eyebrow: "Moderation",
        title: "Meme approval",
        comingSoonTitle: "Coming soon",
        comingSoonDescription:
            "This section is under development. Soon you will be able to review and approve or reject submitted memes here.",
    },
};