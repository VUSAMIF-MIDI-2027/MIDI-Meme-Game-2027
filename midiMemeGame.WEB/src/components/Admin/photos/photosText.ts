import type { Lang } from "@/context/LanguageContext";

type PhotosText = {
    badType: string;
    tooBig: string;
    uploadSuccess: string;
    previewAlt: string;
    previewTitle: string;
    cropTitle: string;
    cropHint: string;
    zoom: string;
    horizontal: string;
    vertical: string;
    resetCrop: string;
    loadingImage: string;
    preparing: string;
    decodeError: string;
    prepareError: string;
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
        tooBig: "Paruošta nuotrauka viršija įkėlimo limitą.",
        uploadSuccess: "Nuotrauka sėkmingai įkelta.",
        previewAlt: "Apkarpytos nuotraukos peržiūra",
        previewTitle: "Kaip atrodys šablone",
        cropTitle: "Apkarpyti nuotrauką",
        cropHint: "Tempdami nuotrauką arba naudodami slankiklius pasirinkite, kas tilps į 4:3 rėmelį.",
        zoom: "Priartinimas",
        horizontal: "Horizontali padėtis",
        vertical: "Vertikali padėtis",
        resetCrop: "Atkurti",
        loadingImage: "Atidaroma nuotrauka…",
        preparing: "Ruošiama nuotrauka…",
        decodeError: "Nepavyko atidaryti nuotraukos. Pasirinkite kitą failą.",
        prepareError: "Nepavyko paruošti nuotraukos. Bandykite dar kartą.",
        uploadTitle: "Įkelti naują nuotrauką",
        formats: (labels, maxMb) => `Formatai: ${labels} · paruošto failo limitas: ${maxMb} MB`,
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
        tooBig: "The prepared photo exceeds the upload limit.",
        uploadSuccess: "Photo uploaded successfully.",
        previewAlt: "Cropped photo preview",
        previewTitle: "Template preview",
        cropTitle: "Crop the photo",
        cropHint: "Drag the photo or use the sliders to choose what fits in the 4:3 frame.",
        zoom: "Zoom",
        horizontal: "Horizontal position",
        vertical: "Vertical position",
        resetCrop: "Reset",
        loadingImage: "Opening the photo…",
        preparing: "Preparing the photo…",
        decodeError: "Could not open the photo. Choose another file.",
        prepareError: "Could not prepare the photo. Try again.",
        uploadTitle: "Upload a new photo",
        formats: (labels, maxMb) => `Formats: ${labels} · prepared file limit: ${maxMb} MB`,
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