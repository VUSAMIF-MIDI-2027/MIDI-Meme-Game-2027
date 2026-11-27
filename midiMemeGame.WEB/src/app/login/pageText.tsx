import type { Lang } from "@/context/LanguageContext";

type PageText = {
    miniTitle: string;
    titlePrefix: string;
    titleEnding: string;
    description: string;

    registerTab: string;
    loginTab: string;

    registerMiniTitle: string;
    registerTitle: string;
    registerDescription: string;

    loginMiniTitle: string;
    loginTitle: string;
    loginDescription: string;

    firstName: string;
    lastName: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;

    registerButton: string;
    loginButton: string;
    forgotPassword: string;
    privacyNotice: string;
    privacyLink: string;
};

export const authText: Record<Lang, PageText> = {
    lt: {
        miniTitle: "Naktis su MIDI",
        titlePrefix: "Paversk",
        titleEnding: "akimirką memu.",
        description: "Išsirink renginio nuotrauką, parašyk prierašą ir pateik savo memą.",

        registerTab: "Registruotis",
        loginTab: "Prisijungti",

        registerMiniTitle: "Pradėk čia",
        registerTitle: "Susikurk paskyrą",
        registerDescription: "Pirmą memą pradėsi kurti greičiau nei per minutę.",

        loginMiniTitle: "Sugrįžk kurti",
        loginTitle: "Prisijunk",
        loginDescription: "Tavo memai ir naujos idėjos laukia tavęs.",

        firstName: "Vardas",
        lastName: "Pavardė",
        email: "El. paštas",
        emailPlaceholder: "vardas@pastas.lt",
        password: "Slaptažodis",
        passwordPlaceholder: "Įvesk slaptažodį",

        registerButton: "Registruotis ir kurti",
        loginButton: "Prisijungti ir kurti",
        forgotPassword: "Pamiršai slaptažodį?",
        privacyNotice: "Vardą, pavardę ir el. paštą naudojame paskyrai ir konkursui administruoti. Apie konkurso pradžią ir prizus rašome el. paštu. Pateikdamas memą galėsi pasirinkti, ar rezultatuose rodyti tavo vardą ir pavardę.",
        privacyLink: "Konkurso privatumo pranešimas",
    },

    en: {
        miniTitle: "Night with MIDI",
        titlePrefix: "Turn a",
        titleEnding: "moment into a meme.",
        description: "Choose an event photo, write a caption, and submit your meme.",

        registerTab: "Register",
        loginTab: "Sign in",

        registerMiniTitle: "Start here",
        registerTitle: "Create your account",
        registerDescription: "You'll start creating your first meme in less than a minute.",

        loginMiniTitle: "Welcome back",
        loginTitle: "Sign in",
        loginDescription: "Your memes and new ideas are waiting for you.",

        firstName: "First name",
        lastName: "Last name",
        email: "Email",
        emailPlaceholder: "name@email.com",
        password: "Password",
        passwordPlaceholder: "Enter your password",

        registerButton: "Register and create",
        loginButton: "Sign in and create",
        forgotPassword: "Forgot your password?",
        privacyNotice: "We use your name and email to manage your account and run the contest. We email you about the contest opening and contact winners about prizes. When you submit a meme, you can choose whether to show your name in the results.",
        privacyLink: "Contest privacy notice",
    },
};
