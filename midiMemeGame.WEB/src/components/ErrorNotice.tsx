"use client";

import { Info } from "lucide-react";
import { useLanguage, type Lang } from "@/context/LanguageContext";
import { ApiError, errorCode, isTimeoutError } from "@/services/ApiError";

type Text = Record<Lang, string>;
type Scope = {
    default: Text;
    byCode?: Record<number, Text>; // backend ErrorType
    byStatus?: Record<number, Text>; // HTTP status
};

/******************************************************************************/
// TEXTS
/******************************************************************************/

const GENERIC: Text = {
    lt: "Įvyko klaida. Bandykite dar kartą.",
    en: "Something went wrong. Please try again.",
};
const NETWORK: Text = {
    lt: "Nepavyko prisijungti prie serverio. Patikrinkite interneto ryšį.",
    en: "Could not reach the server. Check your connection.",
};
const TIMEOUT: Text = {
    lt: "Užklausa užtruko per ilgai. Bandykite dar kartą.",
    en: "The request took too long. Please try again.",
};

const COMMON_STATUS: Record<number, Text> = {
    401: { lt: "Sesija baigėsi. Prisijunkite iš naujo.", en: "Your session has expired. Please sign in again." },
    403: { lt: "Neturite teisių atlikti šio veiksmo.", en: "You don't have permission to do this." },
};

const SCOPES = {
    generic: { default: GENERIC },

    photoList: {
        default: { lt: "Nepavyko įkelti nuotraukų sąrašo.", en: "Could not load photos." },
    },

    photoLoad: {
        default: { lt: "Nepavyko įkelti nuotraukos.", en: "Could not load the photo." },
    },

    upload: {
        default: { lt: "Nepavyko įkelti nuotraukos.", en: "Could not upload the photo." },
        byCode: {
            2300: { lt: "Failas tuščias.", en: "The file is empty." },
            2301: { lt: "Failas per didelis.", en: "The file is too large." },
            2302: { lt: "Netinkamas failo tipas.", en: "This file type is not allowed." },
        },
    },

    photo: {
        default: { lt: "Nepavyko pakeisti nuotraukos būsenos.", en: "Could not update the photo." },
        byCode: {
            2406: {
                lt: "Nuotraukos išjungti negalima, kai jau prasidėjo balsavimas.",
                en: "The photo can't be disabled once voting has started.",
            },
        },
    },

    memeList: {
        default: { lt: "Nepavyko įkelti memų sąrašo.", en: "Could not load memes." },
    },

    review: {
        default: { lt: "Nepavyko atnaujinti memo būsenos.", en: "Could not update the meme." },
        byCode: {
            2702: { lt: "Šis memas jau moderuotas.", en: "This meme has already been moderated." },
        },
        byStatus: {
            404: { lt: "Memas nerastas.", en: "Meme not found." },
        },
    },

    admins: {
        default: { lt: "Nepavyko atlikti veiksmo.", en: "Could not complete the action." },
        byCode: {
            4003: {
                lt: "Autentifikavimo paslauga laikinai nepasiekiama. Bandykite vėliau.",
                en: "The authentication service is temporarily unavailable. Try again later.",
            },
        },
        byStatus: {
            400: { lt: "Neteisingas el. pašto adresas.", en: "Invalid email address." },
            404: { lt: "Vartotojas su tokiu el. paštu nerastas.", en: "No user found with this email." },
            409: { lt: "Rasti keli vartotojai su šiuo el. pašto adresu.", en: "Multiple users matched this email." },
        },
    },

    resetRules: {
        default: { lt: "Nepavyko atstatyti taisyklių patvirtinimų.", en: "Could not reset rules acknowledgements." },
    },

    scheduleLoad: {
        default: { lt: "Nepavyko įkelti tvarkaraščio.", en: "Could not load the schedule." },
    },

    scheduleSave: {
        default: { lt: "Nepavyko išsaugoti tvarkaraščio.", en: "Could not save the schedule." },
        byCode: {
            2401: {
                lt: "Balsavimo pabaigos / rezultatų atidarymo laikas turi būti vėlesnis nei balsavimo pradžios laikas.",
                en: "Voting end / results opening time must be later than voting start time.",
            },
        },
    },
} satisfies Record<string, Scope>;

export type ErrorScope = keyof typeof SCOPES;

/******************************************************************************/
// COMPONENT
/******************************************************************************/

function resolveText(error: unknown, scopeName: ErrorScope, lang: Lang): string {
    const scope: Scope = SCOPES[scopeName];

    if (error instanceof ApiError) {
        if (error.status === 0) return NETWORK[lang];

        const specific =
            (error.code !== null ? scope.byCode?.[error.code] : undefined) ??
            scope.byStatus?.[error.status] ??
            COMMON_STATUS[error.status];
        if (specific) return specific[lang];
    } else if (isTimeoutError(error)) {
        return TIMEOUT[lang];
    }

    return scope.default[lang];
}

type Props = {
    error: unknown; // whatever the catch received; null/undefined shows nothing
    scope?: ErrorScope;
    className?: string; // extra classes (spacing), appended to the base style
};

export function ErrorNotice({ error, scope = "generic", className = "" }: Props) {
    const { lang } = useLanguage();

    if (error == null) return null;

    if (scope === "review" && error instanceof ApiError && error.status === 409 && error.code === 2702) {
        return (
            <div
                role="status"
                className={`flex items-start gap-3 rounded-xl border border-sky-400/25 bg-sky-400/5 px-4 py-3 text-white ${className}`}
            >
                <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-sky-300" />
                <div>
                    <p className="font-semibold">
                        {lang === "lt" ? "Šio memo būsena pasikeitė" : "This meme’s status has changed"}
                    </p>
                    <p className="mt-1 text-sm text-white/75">
                        {lang === "lt"
                            ? "Tavo sprendimas neįrašytas. Sąraše matai naujausią memo būseną."
                            : "Your decision wasn’t saved. The list shows the latest status."}
                    </p>
                </div>
            </div>
        );
    }

    const code = errorCode(error); // null for aborts, so nothing is shown
    if (!code) return null;

    return (
        <p
            role="alert"
            className={`rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200 ${className}`}
        >
            {resolveText(error, scope, lang)}{" "}
            <span className="select-text font-mono text-xs opacity-70">({code})</span>
        </p>
    );
}
