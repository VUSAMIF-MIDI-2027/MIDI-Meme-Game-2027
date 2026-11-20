import type { Lang } from "@/context/LanguageContext";

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
};

export const settingsText: Record<Lang, SettingsText> = {
    lt: {
        scheduleTitle: "Renginio tvarkaraštis",
        scheduleDescription:
            "Nustatyk renginio pradžią, balsavimo pradžią bei balsavimo pabaigos / rezultatų atidarymo laiką.",
        eventStart: "Renginio pradžia",
        votingStart: "Balsavimo pradžia",
        votingEndAndResults: "Balsavimo pabaiga / rezultatų atidarymas",
        dateAriaLabel: (fieldLabel) => `${fieldLabel} – data`, timeAriaLabel: (fieldLabel) => `${fieldLabel} – laikas`,
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
    },
    en: {
        scheduleTitle: "Event schedule",
        scheduleDescription:
            "Set event start, voting start, and voting end / results opening time.",
        eventStart: "Event start",
        votingStart: "Voting start",
        votingEndAndResults: "Voting end / results opening",
        dateAriaLabel: (fieldLabel) => `${fieldLabel} – date`, timeAriaLabel: (fieldLabel) => `${fieldLabel} – time`,
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
    },
};