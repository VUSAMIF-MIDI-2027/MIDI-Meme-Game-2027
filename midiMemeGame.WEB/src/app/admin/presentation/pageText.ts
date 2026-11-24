import type { Lang } from "@/context/LanguageContext";

type PresentationPageText = {
    emptyTitle: string;
    emptyDescription: string;
    errorTitle: string;
    errorDescription: string;
    photoMissing: string;
};

export const presentationText: Record<Lang, PresentationPageText> = {
    lt: {
        emptyTitle: "Patvirtintų memų dar nėra",
        emptyDescription: "Čia pasirodys memai, kai tik jie bus patvirtinti.",
        errorTitle: "Nepavyko įkelti memų",
        errorDescription: "Bandoma iš naujo automatiškai.",
        photoMissing: "Nepavyko įkelti nuotraukos",
    },
    en: {
        emptyTitle: "No approved memes yet",
        emptyDescription: "Memes will show up here as soon as they are approved.",
        errorTitle: "Could not load the memes",
        errorDescription: "Retrying automatically.",
        photoMissing: "Photo could not be loaded",
    },
};
