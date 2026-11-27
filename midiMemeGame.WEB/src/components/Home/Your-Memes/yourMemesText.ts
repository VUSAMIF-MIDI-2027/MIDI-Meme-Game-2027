import type { Lang } from "@/context/LanguageContext";
import type { MemeStatus } from "./YourMemes";

type YourMemesText = {
    publicationTitle: string;
    publicationHelp: string;
    publicationUnavailable: string;
    publishMeme: string;
    publishName: string;
    captionLocked: string;
    eyebrow: string;
    title: string;
    loading: string;
    loadFailed: string;
    retry: string;
    emptyTitle: string;
    emptyEndedTitle: string;
    emptyEndedNotice: string;
    emptyEndedCaption: string;
    rulesLink: string;
    submitted: string;
    photoAlt: (id: number) => string;
    status: Record<MemeStatus, string>;
    invalidated: string;
    photoMissing: string;
    edit: string;
    editTitle: string;
    delete: string;
    captionLabel: string;
    save: string;
    saving: string;
    cancel: string;
    deleteConfirm: string;
    deleting: string;
    actionFailed: string;
    create: string;
};

export const yourMemesText: Record<Lang, YourMemesText> = {
    lt: {
        publicationTitle: "Viešinimas",
        publicationHelp: "Jei memas bus paskelbtas, gali pasirinkti, ar šalia jo rodyti savo vardą ir pavardę.",
        publicationUnavailable: "Šiam memui viešinimo leidimas neduotas.",
        publishMeme: "Skelbti laimėjusį memą ir jo rezultatą",
        publishName: "Rodyti mano vardą ir pavardę",
        captionLocked: "Prierašo šiuo metu redaguoti negalima.",
        eyebrow: "Tavo darbai",
        title: "Mano memai",
        loading: "Kraunami tavo memai…",
        loadFailed: "Nepavyko įkelti tavo memų.",
        retry: "Bandyti dar kartą",
        emptyTitle: "Jakubas laukia tavo memo.",
        emptyEndedTitle: "Jakubas nedasilaukė tavo memo.",
        emptyEndedNotice: "Pateikimų laikotarpis pasibaigė.",
        emptyEndedCaption: "Labai labai piktas.",
        rulesLink: "Konkurso taisyklės",
        submitted: "Pateikta",
        photoAlt: (id) => `Konkurso nuotrauka ${id}`,
        status: {
            approved: "Patvirtintas",
            pending: "Laukiama patvirtinimo",
            rejected: "Atmestas",
        },
        invalidated: "Nuotrauka nebenaudojama",
        photoMissing: "Nuotrauka nepasiekiama",
        edit: "Redaguoti",
        editTitle: "Redaguoti memą",
        delete: "Ištrinti",
        captionLabel: "Prierašas",
        save: "Išsaugoti",
        saving: "Saugoma…",
        cancel: "Atšaukti",
        deleteConfirm: "Ar tikrai ištrinti šį memą?",
        deleting: "Trinama…",
        actionFailed: "Veiksmas nepavyko. Bandyk dar kartą.",
        create: "Kurti memą",
    },
    en: {
        publicationTitle: "Publication",
        publicationHelp: "If your meme is published, you can choose whether to show your first and last name alongside it.",
        publicationUnavailable: "This meme has no permission for public display.",
        publishMeme: "Publish my winning meme and its result",
        publishName: "Show my first and last name",
        captionLocked: "The caption cannot be edited right now.",
        eyebrow: "Your creations",
        title: "My memes",
        loading: "Loading your memes…",
        loadFailed: "Could not load your memes.",
        retry: "Try again",
        emptyTitle: "Jakub is waiting for your meme.",
        emptyEndedTitle: "Jakub didn't wait for your memes.",
        emptyEndedNotice: "The submission period has ended.",
        emptyEndedCaption: "Very, very angry.",
        rulesLink: "Competition rules",
        submitted: "Submitted",
        photoAlt: (id) => `Competition photo ${id}`,
        status: {
            approved: "Approved",
            pending: "Pending review",
            rejected: "Rejected",
        },
        invalidated: "Photo disabled",
        photoMissing: "Photo unavailable",
        edit: "Edit",
        editTitle: "Edit meme",
        delete: "Delete",
        captionLabel: "Caption",
        save: "Save",
        saving: "Saving…",
        cancel: "Cancel",
        deleteConfirm: "Delete this meme?",
        deleting: "Deleting…",
        actionFailed: "That didn't work. Try again.",
        create: "Create a meme",
    },
};
