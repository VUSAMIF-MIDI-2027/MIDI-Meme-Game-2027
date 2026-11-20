import type { Lang } from "@/context/LanguageContext";

type TutorialText = {
    eyebrow: string;
    title: string;
    descriptions: [string, string, string, string];
    votePreviewLabel: string;
    choosePhotoHint: string;
    submitted: string;
    rulesLink: string;
    rulesLinkDescription: string;

};

export const tutorialText: Record<Lang, TutorialText> = {
    lt: {
        eyebrow: "Kaip tai veikia?",
        title: "Viena nuotrauka. Keturi paprasti žingsniai.",
        descriptions: [
            "Pasirink vieną iš pateiktų nuotraukų.",
            "Pridėk vieną trumpą ir juokingą sakinį.",
            "Pateik memą organizatorių peržiūrai. Vienam žmogui — iki 3 memų.",
            "Pasibaigus įkėlimui skirk iki 3 balsų skirtingiems patvirtintiems memams. Vienas balsas — vienas taškas.",
        ],

        choosePhotoHint: "Išbandyk — pasirink nuotrauką",
        submitted: "Memas pateiktas!",
        rulesLink: "Taisyklės",
        rulesLinkDescription: "Susipažink su memų pateikimo ir balsavimo tvarka.",
        votePreviewLabel: "Tavo favoritas · balsavimo pavyzdys",
    },
    en: {
        eyebrow: "How does it work?",
        title: "One photo. Four simple steps.",
        descriptions: [
            "Choose one of the provided photos.",
            "Add one short, funny sentence.",
            "Submit your meme for organiser review. Up to 3 memes per person.",
            "After submissions close, cast up to 3 votes for different approved memes. One vote equals one point.",
        ],

        choosePhotoHint: "Try it — choose a photo",
        submitted: "Meme submitted!",
        rulesLink: "Rules",
        rulesLinkDescription: "See how to submit memes and vote.",
        votePreviewLabel: "Your favourite · voting preview",
    },
};

