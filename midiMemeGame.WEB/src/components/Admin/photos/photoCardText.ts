import type { Lang } from "@/context/LanguageContext";

type PhotoCardText = {
    failedToLoad: string;
    loadingPhoto: string;
    photoAlt: string;
    confirmEnable: string;
    confirmDisable: string;
    saving: string;
    confirm: string;
    cancel: string;
    enablePhoto: string;
    disablePhoto: string;
};

export const photoCardText: Record<Lang, PhotoCardText> = {
    lt: {
        failedToLoad: "Nepavyko įkelti nuotraukos",
        loadingPhoto: "Kraunama nuotrauka...",
        photoAlt: "Nuotrauka",
        confirmEnable: "Padaryti nuotrauką matomą viešai?",
        confirmDisable: "Padaryti nuotrauką viešai neprieinamą?",
        saving: "Saugoma...",
        confirm: "Patvirtinti",
        cancel: "Atšaukti",
        enablePhoto: "Įjungti nuotrauką",
        disablePhoto: "Išjungti nuotrauką",
    },
    en: {
        failedToLoad: "Failed to load photo",
        loadingPhoto: "Loading photo...",
        photoAlt: "Photo",
        confirmEnable: "Make photo visible to the public?",
        confirmDisable: "Hide photo from the public?",
        saving: "Saving...",
        confirm: "Confirm",
        cancel: "Cancel",
        enablePhoto: "Enable photo",
        disablePhoto: "Disable photo",
    },
};