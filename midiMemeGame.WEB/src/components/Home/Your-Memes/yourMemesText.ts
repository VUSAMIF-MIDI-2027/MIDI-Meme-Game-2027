import type { Lang } from "@/context/LanguageContext";
import type { MemeStatus } from "./YourMemes";

type YourMemesText = {
    eyebrow: string;
    title: string;
    description: string;
    empty: string;
    emptyTitle: string;
    submitted: string;
    photoAlt: (id: number) => string;
    status: Record<MemeStatus, string>;
    invalidated: string;
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
        empty: "Kai pateiksi memą, jis atsiras čia.",
        emptyTitle: "Kol kas tuščia",
        submitted: "Pateikta",
        photoAlt: (id) => `Konkurso nuotrauka ${id}`,
        status: {
            approved: "Patvirtintas",
            pending: "Laukiama patvirtinimo",
            rejected: "Atmestas",
        },
        invalidated: "Šablonas išjungtas",
        edit: "Redaguoti",
        editTitle: "Redaguoti prierašą",
        delete: "Ištrinti",
        captionLabel: "Prierašas",
        save: "Išsaugoti",
        saving: "Saugoma…",
        cancel: "Atšaukti",
        deleteConfirm: "Ar tikrai ištrinti šį memą? Ištrinti memai vis tiek skaičiuojasi į pateikimo limitą.",
        deleting: "Trinama…",
        actionFailed: "Veiksmas nepavyko. Bandyk dar kartą.",
        create: "Kurti memą",
    },
    en: {
        eyebrow: "Your creations",
        title: "My memes",
        description:
            "All your submitted memes and their moderation status in one place.",
        empty: "Your memes will appear here after you submit them.",
        emptyTitle: "Nothing here yet",
        submitted: "Submitted",
        photoAlt: (id) => `Competition photo ${id}`,
        status: {
            approved: "Approved",
            pending: "Pending review",
            rejected: "Rejected",
        },
        invalidated: "Template disabled",
        edit: "Edit",
        editTitle: "Edit caption",
        delete: "Delete",
        captionLabel: "Caption",
        save: "Save",
        saving: "Saving…",
        cancel: "Cancel",
        deleteConfirm: "Delete this meme? Deleted memes still count toward the submission limit.",
        deleting: "Deleting…",
        actionFailed: "That didn't work. Try again.",
        create: "Create a meme",
    },
};
