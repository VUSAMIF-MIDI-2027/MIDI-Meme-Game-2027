import type { Lang } from "@/context/LanguageContext";
import type { MemeStatus } from "./YourMemes";

type YourMemesText = {
    eyebrow: string;
    title: string;
    description: string;
    emptyTitle: string;
    emptyEndedTitle: string;
    emptyEndedNotice: string;
    emptyEndedCaption: string;
    rulesLink: string;
    submitted: string;
    photoAlt: (id: number) => string;
    status: Record<MemeStatus, string>;
    invalidated: string;
    invalidatedInfoLabel: string;
    invalidatedBody: string;
    close: string;
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
        eyebrow: "Tavo darbai",
        title: "Mano memai",
        description:
            "Visi tavo pateikti memai ir jų moderavimo būsena vienoje vietoje.",
        emptyTitle: "Jakubas laukia tavo prikolo.",
        emptyEndedTitle: "Jakubas nedasilaukė tavo prikolų.",
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
        invalidated: "Šablonas išjungtas",
        invalidatedInfoLabel: "Ką tai reiškia?",
        invalidatedBody:
            "Organizatoriai išjungė nuotrauką, su kuria šis memas buvo sukurtas, todėl jis nedalyvaus balsavime. Į pateikimų limitą jis neįskaičiuojamas.",
        close: "Uždaryti",
        edit: "Redaguoti",
        editTitle: "Redaguoti prierašą",
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
        eyebrow: "Your creations",
        title: "My memes",
        description:
            "All your submitted memes and their moderation status in one place.",
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
        invalidated: "Template disabled",
        invalidatedInfoLabel: "What does this mean?",
        invalidatedBody:
            "The organizers disabled the photo this meme was made with, so it won't appear in voting. It doesn't count toward your submission limit.",
        close: "Close",
        edit: "Edit",
        editTitle: "Edit caption",
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
