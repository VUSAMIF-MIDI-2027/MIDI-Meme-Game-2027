import { Lang } from "@/context/LanguageContext";

type PageText = {
  miniTitle: string,
  titleWhite: string,
  titleBlue: string,
  description: string,
  startsSoon: string,
  dateTime: string,
  registrationNotice: string,

  step1: string,
  step2: string,
  step3: string
};

export const text: Record<Lang, PageText> = {
  en: {
    miniTitle: "Night with MIDI · Meme competition",
    titleWhite: "Your caption.",
    titleBlue: "Pure comedy.",
    description: 'MIDI invites you to create memes! Choose a photo, come up with a funny caption, and take part — prizes await the creators of the three best memes.',
    startsSoon: "Coming soon · Starts in",
    dateTime: "November 27th 2026 · 21:00 · Vilnius time",
    registrationNotice: "Registration and meme creation open during the event.",

    step1: "Choose a photo.",
    step2: "Write a caption.",
    step3: "Submit your meme."
  },

  lt: {
    miniTitle: "Naktis su MIDI · Memų konkursas",
    titleWhite: "Tavo prierašas.",
    titleBlue: "Visų juokas.",
    description: "MIDI kviečia kurti memus! Pasirink nuotrauką, sugalvok juokingą prierašą ir dalyvauk — trijų geriausių memų kūrėjų laukia prizai.",
    startsSoon: "Jau greitai · Prasideda po",
    dateTime: "2026 m. lapkričio 27 d. · 21:00 · Vilniaus laiku",
    registrationNotice: "Registracija ir memų kūrimas atsidarys renginio metu.",

    step1: "Pasirink nuotrauką.",
    step2: "Parašyk prierašą.",
    step3: "Pateik memą."
  },
};
