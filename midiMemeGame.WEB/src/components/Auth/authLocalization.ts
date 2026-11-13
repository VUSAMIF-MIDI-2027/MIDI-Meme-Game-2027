import { enUS } from "@clerk/localizations/en-US";

export const ltLT = {
    ...enUS,
    locale: "lt-LT",
    unstable__errors: {
        ...enUS.unstable__errors,
        form_password_length_too_short:
            "Slaptažodis per trumpas. Naudok bent 8 simbolius.",
        form_password_not_strong_enough:
            "Slaptažodis per silpnas. Pasirink stipresnį slaptažodį.",
        form_password_pwned:
            "Šis slaptažodis aptiktas nutekintų duomenų sąraše. Pasirink kitą.",
        form_password_pwned__sign_in:
            "Šis slaptažodis aptiktas nutekintų duomenų sąraše. Atkurk slaptažodį.",
        form_password_matches_identifier:
            "Slaptažodis negali sutapti su el. paštu, telefono numeriu ar vartotojo vardu.",
        form_new_password_matches_current:
            "Naujas slaptažodis negali sutapti su dabartiniu.",
        passwordComplexity: {
            ...enUS.unstable__errors?.passwordComplexity,
            sentencePrefix: "Slaptažodžio reikalavimai:",
            minimumLength: "bent {{length}} simboliai",
            maximumLength: "mažiau nei {{length}} simbolių",
            requireLowercase: "bent viena mažoji raidė",
            requireUppercase: "bent viena didžioji raidė",
            requireNumbers: "bent vienas skaitmuo",
            requireSpecialCharacter: "bent vienas specialusis simbolis",
        },
    },
    backButton: "Atgal",
    dividerText: "arba",
    footerPageLink__privacy: "Privatumo politika",
    footerPageLink__terms: "Naudojimosi sąlygos",
    formButtonPrimary: "Tęsti",
    formButtonPrimary__verify: "Patvirtinti",
    formFieldLabel__firstName: "Vardas",
    formFieldLabel__lastName: "Pavardė",
    formFieldLabel__emailAddress: "El. paštas",
    formFieldLabel__password: "Slaptažodis",
    formFieldLabel__confirmPassword: "Pakartok slaptažodį",
    formFieldLabel__newPassword: "Naujas slaptažodis",
    formFieldLabel__signOutOfOtherSessions: "Atsijungti kituose įrenginiuose",
    formFieldInputPlaceholder__firstName: "Vardas",
    formFieldInputPlaceholder__lastName: "Pavardė",
    formFieldInputPlaceholder__emailAddress: "vardas@pastas.lt",
    formFieldInputPlaceholder__password: "Įvesk slaptažodį",
    formFieldInputPlaceholder__signUpPassword: "Sukurk slaptažodį",
    formFieldAction__forgotPassword: "Pamiršai slaptažodį?",
    formFieldAction__showPassword: "Rodyti slaptažodį",
    formFieldAction__hidePassword: "Slėpti slaptažodį",
    formFieldHintText__optional: "Neprivaloma",
    socialButtonsBlockButton: "Tęsti su {{provider|titleize}}",
    socialButtonsBlockButtonManyInView: "{{provider|titleize}}",
    signUp: {
        ...enUS.signUp,
        legalConsent: {
            ...enUS.signUp?.legalConsent,
            checkbox: {
                label__onlyPrivacyPolicy:
                    'Susipažinau su {{ privacyPolicyLink || link("privatumo politika") }}',
                label__onlyTermsOfService:
                    'Sutinku su {{ termsOfServiceLink || link("naudojimosi sąlygomis") }}',
                label__termsOfServiceAndPrivacyPolicy:
                    'Sutinku su {{ termsOfServiceLink || link("naudojimosi sąlygomis") }} ir susipažinau su {{ privacyPolicyLink || link("privatumo politika") }}',
            },
            continue: {
                title: "Susipažink su dokumentais",
                subtitle: "Prieš tęsdamas perskaityk ir pažymėk patvirtinimą.",
            },
        },
        start: {
            ...enUS.signUp?.start,
            title: "Susikurk paskyrą",
            subtitle: "Pirmą memą pradėsi kurti greičiau nei per minutę.",
            actionText: "Jau turi paskyrą?",
            actionLink: "Prisijunk",
        },
        continue: {
            ...enUS.signUp?.continue,
            title: "Užpildyk trūkstamus laukus",
            subtitle: "Pateik likusius duomenis, kad galėtum tęsti.",
            actionText: "Jau turi paskyrą?",
            actionLink: "Prisijunk",
        },
        emailCode: {
            ...enUS.signUp?.emailCode,
            title: "Patvirtink el. paštą",
            subtitle: "Įvesk el. paštu atsiųstą patvirtinimo kodą.",
            formTitle: "Patvirtinimo kodas",
            formSubtitle: "Įvesk el. paštu gautą kodą.",
            resendButton: "Negavai kodo? Siųsti dar kartą",
        },
    },
    signIn: {
        ...enUS.signIn,
        start: {
            ...enUS.signIn?.start,
            title: "Smagu, kad grįžai",
            titleCombined: "Prisijunk arba susikurk paskyrą",
            subtitle: "Prisijunk ir tęsk memų kūrimą.",
            actionText: "Dar neturi paskyros?",
            actionLink: "Registruokis",
        },
        password: {
            ...enUS.signIn?.password,
            title: "Įvesk slaptažodį",
            subtitle: "Įvesk savo paskyros slaptažodį.",
            actionLink: "Naudoti kitą būdą",
        },
        emailCode: {
            ...enUS.signIn?.emailCode,
            title: "Patikrink el. paštą",
            subtitle: "Įvesk el. paštu atsiųstą kodą.",
            formTitle: "Patvirtinimo kodas",
            resendButton: "Negavai kodo? Siųsti dar kartą",
        },
        forgotPassword: {
            ...enUS.signIn?.forgotPassword,
            title: "Pamiršai slaptažodį?",
            subtitle: "Atsiųsime instrukcijas, kaip atkurti slaptažodį.",
        },
        resetPassword: {
            ...enUS.signIn?.resetPassword,
            title: "Nustatyk naują slaptažodį",
            formButtonPrimary: "Pakeisti slaptažodį",
            successMessage: "Slaptažodis pakeistas. Prijungiame…",
            requiredMessage: "Norint tęsti reikia pakeisti slaptažodį.",
        },
    },
};

export { enUS };



