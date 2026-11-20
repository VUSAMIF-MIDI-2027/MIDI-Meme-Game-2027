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
    settings: string;
    title: string;
    description: string;
    photosDescription: string;
    memeReviewDescription: string;
    teamDescription: string;
    rulesDescription: string;
    settingsDescription: string;
    access: string;
    tools: string;
    schedule: string;
    scheduleDescription: string;
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
        settings: "Nustatymai",
        title: "Viskas savo vietoje.",
        description: "Tvarkyk komandos prieigą, nuotraukas ir dalyvių supažindinimą su taisyklėmis.",
        photosDescription: "Įkelk ir peržiūrėk konkurso nuotraukas.",
        memeReviewDescription: "Peržiūrėk ir moderuok dalyvių pateiktus memus.",
        teamDescription: "Pridėk žmogų prie organizatorių komandos pagal jo el. paštą.",
        rulesDescription: "Pakviesk dalyvius iš naujo perskaityti konkurso taisykles.",
        settingsDescription: "Tvarkyk renginio ir balsavimo tvarkaraštį bei nustatymus.",
        access: "Organizatorių erdvė",
        tools: "Konkurso valdymas",
        schedule: "Tvarkaraštis",
        scheduleDescription: "Nustatyk memų pateikimo, balsavimo ir renginio pabaigos laikus.",
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
        settings: "Settings",
        title: "Everything in one place.",
        description: "Manage team access, photos, and participant rules acknowledgements.",
        photosDescription: "Upload and view competition photos.",
        memeReviewDescription: "Review and moderate submitted memes.",
        teamDescription: "Add someone to the organising team using their email address.",
        rulesDescription: "Ask participants to read the competition rules again.",
        settingsDescription: "Configure the event and voting schedule as well as settings.",
        access: "Organiser workspace",
        tools: "Competition management",
        schedule: "Schedule",
        scheduleDescription: "Set the times for meme submissions, voting and the end of the event.",
    },
};

export const eventScheduleText = {
    lt: {
        eventStartsAt: "Memų pateikimo pradžia",
        votingStartsAt: "Balsavimo pradžia",
        eventEndsAt: "Renginio pabaiga",
        timeZone: "Laikus įvesk Vilniaus laiku, 24 valandų formatu.",
        date: "Data",
        time: "Laikas",
        empty: "Tvarkaraštis dar nenustatytas. Įvesk visus tris laikus ir išsaugok.",
        loading: "Kraunamas tvarkaraštis…",
        loadError: "Nepavyko gauti tvarkaraščio.",
        retry: "Bandyti dar kartą",
        save: "Išsaugoti tvarkaraštį",
        saving: "Saugoma…",
        saved: "Tvarkaraštis išsaugotas.",
        invalidTime: "Patikrink pažymėtą datą ir laiką.",
        order: "Memų pateikimas turi prasidėti prieš balsavimą.",
        votingOrder: "Balsavimo pradžia turi būti vėlesnė už memų pateikimo pradžią.",
        endOrder: "Renginio pabaiga turi būti po balsavimo pradžios.",
        denied: "Sesija nebegalioja arba neturi administratoriaus teisių.",
        saveError: "Nepavyko išsaugoti tvarkaraščio.",
    },
    en: {
        eventStartsAt: "Meme submissions open",
        votingStartsAt: "Voting opens",
        eventEndsAt: "Event ends",
        timeZone: "Enter all times in Vilnius time using the 24-hour format.",
        date: "Date",
        time: "Time",
        empty: "The schedule is empty. Enter all three times and save.",
        loading: "Loading schedule…",
        loadError: "Could not load the schedule.",
        retry: "Try again",
        save: "Save schedule",
        saving: "Saving…",
        saved: "Schedule saved.",
        invalidTime: "Check the highlighted date and time.",
        order: "Meme submissions must open before voting.",
        votingOrder: "Voting must open after meme submissions open.",
        endOrder: "The event must end after voting opens.",
        denied: "Your session has expired or you do not have administrator access.",
        saveError: "Could not save the schedule.",
    },
};

export const grantAdminText = {
    lt: { title: "Pridėti administratorių", description: "Rask žmogų pagal el. paštą ir suteik jam administratoriaus teises.", email: "El. paštas", search: "Rasti vartotoją", searching: "Ieškoma…", grant: "Suteikti teises", granting: "Suteikiama…", confirm: "Suteikti administratoriaus teises?", warning: "Šis žmogus gaus prieigą prie administravimo funkcijų.", cancel: "Atšaukti", success: "Administratoriaus teisės suteiktos.", notFound: "Vartotojas nerastas.", invalid: "Patikrink el. pašto adresą.", ambiguous: "Šį el. paštą turi keli vartotojai.", denied: "Neturi administratoriaus teisių.", error: "Nepavyko gauti atsakymo." },
    en: { title: "Add an administrator", description: "Find a person by email and grant them administrator access.", email: "Email address", search: "Find user", searching: "Searching…", grant: "Grant access", granting: "Granting…", confirm: "Grant administrator access?", warning: "This person will gain access to administration features.", cancel: "Cancel", success: "Administrator access granted.", notFound: "User not found.", invalid: "Check the email address.", ambiguous: "Multiple users have this email.", denied: "You do not have administrator access.", error: "Could not receive a response." },
};

export const resetRulesText = {
    lt: { title: "Taisyklių peržiūra", description: "Atstatyk visų vartotojų taisyklių patvirtinimus.", action: "Atstatyti patvirtinimus", confirm: "Atstatyti visiems?", warning: "Bus atstatyti visų vartotojų taisyklių patvirtinimai.", cancel: "Atšaukti", submit: "Taip, atstatyti visiems", saving: "Saugoma…", success: "Atnaujinta vartotojų:", empty: "Nė vienas vartotojas neturėjo patvirtinimo.", error: "Nepavyko atstatyti.", denied: "Neturi teisės atlikti šio veiksmo." },
    en: { title: "Rules acknowledgement", description: "Reset every user's rules acknowledgement.", action: "Reset acknowledgements", confirm: "Reset for everyone?", warning: "All users' acknowledgements will be reset.", cancel: "Cancel", submit: "Yes, reset for everyone", saving: "Saving…", success: "Users updated:", empty: "No users had an acknowledgement to reset.", error: "Could not reset.", denied: "You do not have permission to do this." },
};