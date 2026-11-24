import type { Lang } from "@/context/LanguageContext";

type PageText = {
    greeting: string;
    title: string;
    description: string;
    createMeme: string;
    vote: string;
    creationNotice: string;
    adminEyebrow: string;
    adminTitle: string;
    adminDescription: string;
    adminLink: string;
};

export const dashboardText: Record<Lang, PageText> = {
    lt: {
        greeting: "Labas",
        title: "Sukurk memą, kurį prisimins visi.",
        description: "Pasirink nuotrauką, parašyk juokingą prierašą ir pateik savo memą. Vienas žmogus gali pateikti iki 3 memų.",
        createMeme: "Kurti memą",
        vote: "Balsuoti",
        creationNotice: "Memų kūrimas bus pasiekiamas renginio metu.",
        adminEyebrow: "Organizatoriams",
        adminTitle: "Administravimas",
        adminDescription: "Konkurso administravimo erdvė tavo komandai.",
        adminLink: "Atidaryti administravimą",
    },
    en: {
        greeting: "Hi",
        title: "Create a meme everyone will remember.",
        description: "Choose a photo, write a funny caption and submit your meme. Each person can submit up to 3 memes.",
        createMeme: "Create a meme",
        vote: "Vote",
        creationNotice: "Meme creation will be available during the event.",
        adminEyebrow: "For organisers",
        adminTitle: "Administration",
        adminDescription: "Your team’s competition administration area.",
        adminLink: "Open administration",
    },
};
