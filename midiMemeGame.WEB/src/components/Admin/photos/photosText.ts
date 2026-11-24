import type { Lang } from "@/context/LanguageContext";

type PhotosText = {
    badType: string;
    tooBig: string;
    uploadSuccess: string;
    previewAlt: string;
    uploadTitle: string;
    formats: (labels: string, maxMb: number) => string;
    chooseLabel: string;
    uploading: string;
    uploadButton: string;
    loadingPhotos: string;
    emptyAll: string;
    enabledHeading: string;
    noEnabledPhotos: string;
    disabledHeading: string;
    noDisabledPhotos: string;
};

export const photosText: Record<Lang, PhotosText> = {
    lt: {
        badType: "Blogas tipas",
        tooBig: "Per didelė nuotrauka",
        uploadSuccess: "Nuotrauka sėkmingai įkelta.",
        previewAlt: "Pasirinktos nuotraukos peržiūra",
        uploadTitle: "Įkelti naują nuotrauką",
        formats: (labels, maxMb) => `Leidžiami formatai: ${labels} · iki ${maxMb} MB`,
        chooseLabel: "Pasirinkti nuotrauką",
        uploading: "Įkeliama",
        uploadButton: "Įkelti nuotrauką",
        loadingPhotos: "Kraunamos nuotraukos...",
        emptyAll: "Nuotraukų dar nėra.",
        enabledHeading: "Įjungtos nuotraukos",
        noEnabledPhotos: "Įjungtų nuotraukų nėra.",
        disabledHeading: "Išjungtos nuotraukos",
        noDisabledPhotos: "Išjungtų nuotraukų nėra.",
    },
    en: {
        badType: "Unsupported file type",
        tooBig: "Photo is too large",
        uploadSuccess: "Photo uploaded successfully.",
        previewAlt: "Selected photo preview",
        uploadTitle: "Upload a new photo",
        formats: (labels, maxMb) => `Allowed formats: ${labels} · up to ${maxMb} MB`,
        chooseLabel: "Choose photo",
        uploading: "Uploading",
        uploadButton: "Upload photo",
        loadingPhotos: "Loading photos...",
        emptyAll: "No photos found.",
        enabledHeading: "Enabled photos",
        noEnabledPhotos: "No enabled photos.",
        disabledHeading: "Disabled photos",
        noDisabledPhotos: "No disabled photos.",
    },
};