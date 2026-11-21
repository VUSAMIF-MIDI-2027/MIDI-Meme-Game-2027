import type { Lang } from "@/context/LanguageContext";

type GrantAdminText = {
    title: string;
    description: string;
    email: string;
    search: string;
    searching: string;
    grant: string;
    granting: string;
    confirm: string;
    warning: string;
    cancel: string;
    success: string;
    notFound: string;
    invalid: string;
    ambiguous: string;
    denied: string;
    error: string;
};

type ResetRulesText = {
    title: string;
    description: string;
    action: string;
    confirm: string;
    warning: string;
    cancel: string;
    submit: string;
    saving: string;
    empty: string;
    success: string;
    denied: string;
    error: string;
};

type SettingsText = {
    scheduleTitle: string;
    scheduleDescription: string;
    eventStart: string;
    votingStart: string;
    votingEndAndResults: string;
    dateAriaLabel: (fieldLabel: string) => string;
    timeAriaLabel: (fieldLabel: string) => string;
    saveSchedule: string;
    savingSchedule: string;
    scheduleSaved: string;
    invalidRangeError: string;
    loading: string;
    loadError: string;
    saveError: string;
    currentScheduleLabel: string;
    notSet: string;
    grantAdmin: GrantAdminText;
    resetRules: ResetRulesText;
};

export const settingsText: Record<Lang, SettingsText> = {
    lt: {
        scheduleTitle: "Renginio tvarkaraštis",
        scheduleDescription:
            "Nustatyk renginio pradžią, balsavimo pradžią bei balsavimo pabaigos / rezultatų atidarymo laiką.",
        eventStart: "Renginio (memų pateikimo) pradžia",
        votingStart: "Memų pateikimo pabaiga / Balsavimo pradžia",
        votingEndAndResults: "Balsavimo pabaiga / rezultatų atidarymas",
        dateAriaLabel: (fieldLabel) => `${fieldLabel} – data`,
        timeAriaLabel: (fieldLabel) => `${fieldLabel} – laikas`,
        saveSchedule: "Išsaugoti tvarkaraštį",
        savingSchedule: "Saugoma…",
        scheduleSaved: "Tvarkaraštis išsaugotas.",
        invalidRangeError:
            "Balsavimo pabaigos / rezultatų atidarymo laikas turi būti vėlesnis nei balsavimo pradžios laikas.",
        loading: "Kraunami nustatymai…",
        loadError: "Nepavyko įkelti tvarkaraščio.",
        saveError: "Nepavyko išsaugoti tvarkaraščio.",
        currentScheduleLabel: "Patvirtintas tvarkaraštis",
        notSet: "Nenustatyta",
        grantAdmin: {
            title: "Suteikti administratoriaus teises",
            description: "Surask naudotoją pagal el. pašto adresą ir suteik jam administratoriaus rolę.",
            email: "El. pašto adresas",
            search: "Ieškoti",
            searching: "Ieškoma…",
            grant: "Suteikti teises",
            granting: "Suteikiama…",
            confirm: "Patvirtinti administratoriaus teises",
            warning:
                "Šis naudotojas įgis pilną prieigą prie administratoriaus skydelio ir galės valdyti renginio nustatymus bei turinį.",
            cancel: "Atšaukti",
            success: "Administratoriaus teisės sėkmingai suteiktos.",
            notFound: "Naudotojas su tokiu el. paštu nerastas.",
            invalid: "Neteisingas el. pašto adresas.",
            ambiguous: "Rasti keli naudotojai su šiuo el. pašto adresu.",
            denied: "Neturi teisių atlikti šio veiksmo.",
            error: "Nepavyko atlikti užklausos. Bandyk dar kartą.",
        },
        resetRules: {
            title: "Atstatyti taisyklių patvirtinimus",
            description:
                "Atšauk visų naudotojų taisyklių sutikimus, kad jie turėtų iš naujo patvirtinti atnaujintas renginio taisykles.",
            action: "Atstatyti patvirtinimus",
            confirm: "Patvirtinti atstatymą",
            warning:
                "Visi naudotojai turės iš naujo sutikti su taisyklėmis prieš tęsdami naudojimąsi platforma. Šio veiksmo atšaukti negalima.",
            cancel: "Atšaukti",
            submit: "Atstatyti",
            saving: "Atstatoma…",
            empty: "Nebuvo nė vieno patvirtinimo, kurį reikėtų atstatyti.",
            success: "Atstatytų patvirtinimų skaičius:",
            denied: "Neturi teisių atlikti šio veiksmo.",
            error: "Nepavyko atstatyti taisyklių patvirtinimų.",
        },
    },
    en: {
        scheduleTitle: "Event schedule",
        scheduleDescription:
            "Set event start, voting start, and voting end / results opening time.",
        eventStart: "Event (meme submission) start",
        votingStart: "Meme submission end / Voting start",
        votingEndAndResults: "Voting end / results opening",
        dateAriaLabel: (fieldLabel) => `${fieldLabel} – date`,
        timeAriaLabel: (fieldLabel) => `${fieldLabel} – time`,
        saveSchedule: "Save schedule",
        savingSchedule: "Saving…",
        scheduleSaved: "Schedule saved.",
        invalidRangeError:
            "Voting end / results opening time must be later than voting start time.",
        loading: "Loading settings…",
        loadError: "Failed to load schedule.",
        saveError: "Failed to save schedule.",
        currentScheduleLabel: "Saved schedule",
        notSet: "Not set",
        grantAdmin: {
            title: "Grant admin permissions",
            description: "Look up a user by email address and grant them the administrator role.",
            email: "Email address",
            search: "Search",
            searching: "Searching…",
            grant: "Grant admin",
            granting: "Granting…",
            confirm: "Confirm admin access",
            warning:
                "This user will gain full access to the admin panel and will be able to manage event settings and content.",
            cancel: "Cancel",
            success: "Admin permissions granted successfully.",
            notFound: "No user found with that email address.",
            invalid: "Invalid email address.",
            ambiguous: "Multiple users matched this email address.",
            denied: "You do not have permission to perform this action.",
            error: "Request failed. Please try again.",
        },
        resetRules: {
            title: "Reset rules acknowledgements",
            description:
                "Clear all users' rules acknowledgements so everyone must accept the updated event rules again.",
            action: "Reset acknowledgements",
            confirm: "Confirm reset",
            warning:
                "All users will be required to accept the rules again before continuing. This action cannot be undone.",
            cancel: "Cancel",
            submit: "Reset",
            saving: "Resetting…",
            empty: "There were no acknowledgements to reset.",
            success: "Reset acknowledgements count:",
            denied: "You do not have permission to perform this action.",
            error: "Failed to reset rules acknowledgements.",
        },
    },
};