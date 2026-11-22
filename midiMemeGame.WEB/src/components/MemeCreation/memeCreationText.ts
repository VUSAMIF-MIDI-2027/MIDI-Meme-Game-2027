import type { Lang } from "@/context/LanguageContext";

export const CAPTION_MAX_WORDS = 30;
export const CAPTION_MAX_CHARS = 250;

type MemeCreationText = {
    dialogLabel: string;
    progressLabel: string;
    closeLabel: string;
    confirmClose: string;
    stepNames: [string, string, string];
    photoTitle: string;
    photoHint: string;
    photoLoading: string;
    photoError: string;
    photoEmpty: string;
    photoAlt: (id: number) => string;
    retry: string;
    captionTitle: string;
    captionLabel: string;
    captionPlaceholder: string;
    captionPlaceholderCard: string;
    captionLimits: string;
    captionRequired: string;
    wordsLabel: string;
    charsLabel: string;
    previewButton: string;
    previewTitle: string;
    edit: string;
    submit: string;
    submitting: string;
    submitError: string;
    authError: string;
    confirmTitle: string;
    confirmBody: string;
    createAnother: string;
    myMemes: string;
};

export const memeCreationText: Record<Lang, MemeCreationText> = {
    lt: {
        dialogLabel: "Memų kūrimas",
        progressLabel: "Memų kūrimo eiga",
        closeLabel: "Uždaryti",
        confirmClose: "Ar tikrai nori uždaryti? Tavo progresas bus prarastas.",
        stepNames: ["Nuotrauka", "Prierašas", "Pateikimas"],
        photoTitle: "Pasirink nuotrauką",
        photoHint: "Išrink vieną iš organizatorių paruoštų nuotraukų.",
        photoLoading: "Kraunamos nuotraukos…",
        photoError: "Nuotraukų įkelti nepavyko.",
        photoEmpty: "Kol kas nėra nuotraukų. Pabandyk vėliau.",
        photoAlt: (id) => `Konkurso nuotrauka ${id}`,
        retry: "Bandyti dar kartą",
        captionTitle: "Sukurk prierašą",
        captionLabel: "Prierašas",
        captionPlaceholder: "Parašyk juokingą prierašą…",
        captionPlaceholderCard: "Tavo prierašas",
        captionLimits: "Iki 30 žodžių ir 250 simbolių.",
        captionRequired: "Prierašas negali būti tuščias.",
        wordsLabel: "Žodžiai",
        charsLabel: "Simboliai",
        previewButton: "Peržiūrėti memą",
        previewTitle: "Peržiūrėk memą",
        edit: "Redaguoti",
        submit: "Pateikti memą",
        submitting: "Pateikiama…",
        submitError: "Memą pateikti nepavyko. Bandyk dar kartą.",
        authError: "Prisijunk iš naujo ir bandyk dar kartą.",
        confirmTitle: "Memas pateiktas!",
        confirmBody: "Tavo memas laukia organizatorių peržiūros. Kai jį patvirtins, jis atsiras balsavime.",
        createAnother: "Kurti dar vieną",
        myMemes: "Mano memai",
    },
    en: {
        dialogLabel: "Meme creation",
        progressLabel: "Meme creation progress",
        closeLabel: "Close",
        confirmClose: "Close the meme creator? Your progress will be lost.",
        stepNames: ["Photo", "Caption", "Submit"],
        photoTitle: "Choose a photo",
        photoHint: "Pick one of the photos provided by the organizers.",
        photoLoading: "Loading photos…",
        photoError: "Couldn't load the photos.",
        photoEmpty: "No photos yet. Check back later.",
        photoAlt: (id) => `Competition photo ${id}`,
        retry: "Try again",
        captionTitle: "Write a caption",
        captionLabel: "Caption",
        captionPlaceholder: "Write a funny caption…",
        captionPlaceholderCard: "Your caption",
        captionLimits: "Up to 30 words and 250 characters.",
        captionRequired: "Caption can't be empty.",
        wordsLabel: "Words",
        charsLabel: "Characters",
        previewButton: "Preview meme",
        previewTitle: "Review your meme",
        edit: "Edit",
        submit: "Submit meme",
        submitting: "Submitting…",
        submitError: "Couldn't submit the meme. Try again.",
        authError: "Sign in again and try once more.",
        confirmTitle: "Meme submitted!",
        confirmBody: "Your meme is waiting for organizer review. Once approved, it will appear in voting.",
        createAnother: "Create another",
        myMemes: "My memes",
    },
};
