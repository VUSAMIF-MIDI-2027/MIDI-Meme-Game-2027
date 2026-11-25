import type { Lang } from "@/context/LanguageContext";

export const CAPTION_MAX_CHARS = 100;

export function isCaptionValid(caption: string): boolean {
    const trimmed = caption.trim();
    return trimmed.length > 0 && trimmed.length <= CAPTION_MAX_CHARS;
}

type MemeCreationText = {
    pageTitle: string;
    backToDashboard: string;
    progressLabel: string;
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
    captionCount: (count: number) => string;
    captionRequired: string;
    previewButton: string;
    previewTitle: string;
    edit: string;
    changePhoto: string;
    submit: string;
    submitting: string;
    submitError: string;
    submitErrorClosed: string;
    submitErrorPhotoDisabled: string;
    submitErrorDenied: string;
    submitErrorLimit: string;
    authError: string;
    confirmTitle: string;
    confirmBody: string;
    createAnother: string;
    myMemes: string;
};

export const memeCreationText: Record<Lang, MemeCreationText> = {
    lt: {
        pageTitle: "Memų kūrimas",
        backToDashboard: "Atgal į pradžią",
        progressLabel: "Memų kūrimo eiga",
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
        captionCount: (count) => `${count} / ${CAPTION_MAX_CHARS} simbolių`,
        captionRequired: "Prierašas negali būti tuščias.",
        previewButton: "Peržiūrėti memą",
        previewTitle: "Peržiūrėk memą",
        edit: "Redaguoti",
        changePhoto: "Rinktis kitą nuotrauką",
        submit: "Pateikti memą",
        submitting: "Pateikiama…",
        submitError: "Memą pateikti nepavyko. Bandyk dar kartą.",
        submitErrorClosed: "Memų teikimas šiuo metu uždarytas.",
        submitErrorPhotoDisabled: "Pasirinkta nuotrauka nebegalima. Pasirink kitą.",
        submitErrorDenied: "Tavo paskyra negali teikti memų.",
        submitErrorLimit: "Jau išnaudojai 3 memų pateikimo limitą.",
        authError: "Prisijunk iš naujo ir bandyk dar kartą.",
        confirmTitle: "Memas pateiktas!",
        confirmBody: "Tavo memas laukia organizatorių peržiūros. Kai jį patvirtins, jis atsiras balsavime.",
        createAnother: "Kurti dar vieną",
        myMemes: "Mano memai",
    },
    en: {
        pageTitle: "Meme creation",
        backToDashboard: "Back to dashboard",
        progressLabel: "Meme creation progress",
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
        captionCount: (count) => `${count} / ${CAPTION_MAX_CHARS} characters`,
        captionRequired: "Caption can't be empty.",
        previewButton: "Preview meme",
        previewTitle: "Review your meme",
        edit: "Edit",
        changePhoto: "Choose a different photo",
        submit: "Submit meme",
        submitting: "Submitting…",
        submitError: "Couldn't submit the meme. Try again.",
        submitErrorClosed: "Meme submissions are closed right now.",
        submitErrorPhotoDisabled: "That photo is no longer available. Choose another one.",
        submitErrorDenied: "Your account isn't allowed to submit memes.",
        submitErrorLimit: "You've used all 3 meme submissions.",
        authError: "Sign in again and try once more.",
        confirmTitle: "Meme submitted!",
        confirmBody: "Your meme is waiting for organizer review. Once approved, it will appear in voting.",
        createAnother: "Create another",
        myMemes: "My memes",
    },
};
