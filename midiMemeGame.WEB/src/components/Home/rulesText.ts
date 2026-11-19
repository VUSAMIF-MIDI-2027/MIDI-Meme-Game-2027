import type { Lang } from "@/context/LanguageContext";

export const rulesText = {
    lt: {
        title: "Memų konkurso taisyklės",
        intro: "Dalyvauk „Naktis su MIDI“ gyvai arba nuotoliu šiame puslapyje. Prieš kurdamas memą perskaityk ribas ir turinio taisykles.",
        limits: ["Iki 3 memų vienam žmogui", "Iki 3 balsų vienam žmogui", "1 balsas = 1 taškas"],
        flowTitle: "Kaip vyks konkursas?",
        stages: [
            { title: "Memų įkėlimas", body: "Prisijunk, pasirink organizatorių nuotrauką, sukurk prierašą ir pateik memą. Vienas žmogus gali pateikti ne daugiau kaip 3 memus. Pateiktus memus peržiūri organizatoriai." },
            { title: "Balsavimas", body: "Pasibaigus įkėlimui prasideda balsavimas už patvirtintus memus. Gali atiduoti iki 3 balsų — kiekvieną skirtingam memui. Vienam memui iš vieno žmogaus galima skirti tik 1 balsą, vertą 1 taško." },
            { title: "Rezultatai", body: "Pasibaigus balsavimui susumuojami taškai ir paskelbiami rezultatai. Laimėtojų laukia prizai." },
        ],
        example: "Pavyzdys: 3 balsus gali skirti 3 skirtingiems memams po 1 tašką. Visų 3 balsų vienam memui atiduoti negalima.",
        warningTitle: "NSFW ir asmeniniai įžeidimai draudžiami",
        warning: "Nekelk NSFW (seksualinio ar kito nepadoraus turinio) ir memų, kuriuose asmeniškai įžeidinėjami žmonės. Pažeidžiantis memas bus užblokuotas ir sunaudos vieną iš 3 bandymų. Šis bandymas negrąžinamas, tačiau likusius bandymus gali panaudoti kitiems memams.",
        warningNote: "Juokauk kūrybiškai, bet nežemink kitų. Ši taisyklė taikoma visiems dalyviams.",
        tutorialLink: "Peržiūrėti kūrimo ir balsavimo pavyzdį ↓",
        reminderTitle: "Prieš pateikdamas memą",
        reminder: "Iki 3 memų, iki 3 balsų skirtingiems memams. NSFW ar asmeninių įžeidimų turintis memas blokuojamas, o jam panaudotas bandymas negrąžinamas.",
        read: "Perskaityti taisykles →",
    },
    en: {
        title: "Meme competition rules",
        intro: "Join Naktis su MIDI in person or take part remotely on this website. Read the limits and content rules before creating a meme.",
        limits: ["Up to 3 memes per person", "Up to 3 votes per person", "1 vote = 1 point"],
        flowTitle: "How does the competition work?",
        stages: [
            { title: "Meme submissions", body: "Sign in, choose a photo provided by the organisers, write a caption and submit your meme. Each person may submit no more than 3 memes. Organisers review the submissions." },
            { title: "Voting", body: "Voting for approved memes starts after submissions close. You may cast up to 3 votes, each for a different meme. Each person can give a meme only 1 vote, worth 1 point." },
            { title: "Results", body: "Once voting closes, points are counted and the results are announced. Winners receive prizes." },
        ],
        example: "Example: you can give 1 point each to 3 different memes. You cannot give all 3 votes to the same meme.",
        warningTitle: "No NSFW content or personal insults",
        warning: "Do not submit NSFW (sexual or other indecent content) or memes that personally insult people. The offending meme will be blocked and use up one of the 3 attempts. That attempt is not refunded, but you can still use your remaining attempts for other memes.",
        warningNote: "Be creative with your humour, but do not demean others. This rule applies to every participant.",
        tutorialLink: "See the creation and voting example ↓",
        reminderTitle: "Before submitting a meme",
        reminder: "Up to 3 memes and 3 votes for different memes. Memes containing NSFW content or personal insults are blocked, and the attempt used is not refunded.",
        read: "Read the rules →",
    },
} satisfies Record<Lang, unknown>;

