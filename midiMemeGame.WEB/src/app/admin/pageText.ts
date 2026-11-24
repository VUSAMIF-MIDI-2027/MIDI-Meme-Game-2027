import type { Lang } from "@/context/LanguageContext";

type AdminPageText = {
    back: string;
    label: string;
    admin: string;
    nightWithMidi: string;
    overview: string;
    photos: string;
    memeReview: string;
    team: string;
    rules: string;
    results: string;
    resultsDescription: string;
    settings: string;
    overviewDescription: string;
    photosDescription: string;
    memeReviewDescription: string;
    teamDescription: string;
    rulesDescription: string;
    settingsDescription: string;
    access: string;
    tools: string;
    presentationMode: string;
};

export const adminText: Record<Lang, AdminPageText> = {
    lt: {
        back: "Į dalyvio puslapį",
        label: "Valdymo skydelis",
        admin: "Administravimas",
        nightWithMidi: "Naktis su MIDI",
        overview: "Apžvalga",
        photos: "Nuotraukos",
        memeReview: "Memų moderacija",
        team: "Administratoriai",
        rules: "Taisyklės",
        results: "Rezultatai",
        resultsDescription: "Peržiūrėkite prizines vietas ir paskelbkite konkurso rezultatus.",
        settings: "Nustatymai",
        overviewDescription: "Peržiūrėk pagrindinę renginio statistiką ir top memus.",
        photosDescription: "Įkelk ir peržiūrėk konkurso nuotraukas.",
        memeReviewDescription: "Peržiūrėk ir moderuok dalyvių pateiktus memus.",
        teamDescription: "Pridėk žmogų prie organizatorių komandos pagal jo el. paštą.",
        rulesDescription: "Pakviesk dalyvius iš naujo perskaityti konkurso taisykles.",
        settingsDescription: "Tvarkyk renginio ir balsavimo tvarkaraštį bei nustatymus.",
        access: "Organizatorių erdvė",
        tools: "Konkurso valdymas",
        presentationMode: "Prezentacijos režimas",
    },
    en: {
        back: "Participant home",
        label: "Control panel",
        admin: "Administration",
        nightWithMidi: "Naktis su MIDI",
        overview: "Overview",
        photos: "Photos",
        memeReview: "Meme moderation",
        team: "Administrators",
        rules: "Rules",
        results: "Results",
        resultsDescription: "Review the podium and publish the contest results.",
        settings: "Settings",
        overviewDescription: "Take a look at meme statistics and top memes.",
        photosDescription: "Upload and view competition photos.",
        memeReviewDescription: "Review and moderate submitted memes.",
        teamDescription: "Add someone to the organising team using their email address.",
        rulesDescription: "Ask participants to read the competition rules again.",
        settingsDescription: "Configure the event and voting schedule as well as settings.",
        access: "Organiser workspace",
        tools: "Competition management",
        presentationMode: "Presentation mode",
    },
};