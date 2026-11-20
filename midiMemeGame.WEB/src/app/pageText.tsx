import type { Lang } from "@/context/LanguageContext";
import type { EventPhase } from "@/utils/eventPhase";

type PageText = {
  miniTitle: string,
  titleWhite: string,
  titleBlue: string,
  description: string,

  step1: string,
  step2: string,
  step3: string,
  step4: string
};

export const text: Record<Lang, PageText> = {
  en: {
    miniTitle: "Meme competition",
    titleWhite: "Create your own",
    titleBlue: "MIDI meme.",
    description: 'MIDI invites you to create memes! Choose a photo, come up with a funny caption, and take part — prizes await the creators of the three best memes.',

    step1: "Choose a photo.",
    step2: "Write a caption.",
    step3: "Submit your meme.",
    step4: "Vote for the best meme."
  },

  lt: {
    miniTitle: "Memų konkursas",
    titleWhite: "Sukurk savo",
    titleBlue: "MIDI memą.",
    description: "MIDI kviečia kurti memus! Pasirink nuotrauką, sugalvok juokingą prierašą ir dalyvauk — trijų geriausių memų kūrėjų laukia prizai.",

    step1: "Pasirink nuotrauką.",
    step2: "Sukurk prierašą.",
    step3: "Pateik memą.",
    step4: "Balsuok už geriausią memą."
  },
};

type CountdownCopy = {
  phases: Record<EventPhase, { heading: string; dateLabel: string; description: string; action?: string }>;
  schedule: string;
  loading: string;
  missing: string;
  error: string;
  retry: string;
  timeZone: string;
  shortDays: string;
  timeRemaining: string;
};

export const eventCountdownText: Record<Lang, CountdownCopy> = {
  lt: {
    phases: {
      upcoming: {
        heading: "Jau greitai",
        dateLabel: "Memų pateikimo pradžia",
        description: "Registruokis jau dabar. Memų pateikimas prasidės renginio metu.",
        action: "Registruotis",
      },
      submissions: {
        heading: "Memų pateikimas vyksta",
        dateLabel: "Balsavimo pradžia",
        description: "Memus gali pateikti iki balsavimo pradžios.",
        action: "Prisijungti",
      },
      voting: {
        heading: "Balsavimas vyksta",
        dateLabel: "Renginio pabaiga",
        description: "Gali skirti iki trijų balsų skirtingiems memams.",
        action: "Prisijungti",
      },
      ended: {
        heading: "Renginys baigėsi",
        dateLabel: "Renginio pabaiga",
        description: "Ačiū, kad dalyvavai!",
      },
    },
    schedule: "Renginio tvarkaraštis",
    loading: "Kraunamas tvarkaraštis…",
    missing: "Renginio tvarkaraštis dar nepaskelbtas.",
    error: "Nepavyko įkelti renginio tvarkaraščio.",
    retry: "Bandyti dar kartą",
    timeZone: "Vilniaus laiku",
    shortDays: "d.",
    timeRemaining: "Liko",
  },
  en: {
    phases: {
      upcoming: {
        heading: "Coming soon",
        dateLabel: "Meme submissions open",
        description: "Register now. Meme submissions open when the event starts.",
        action: "Register",
      },
      submissions: {
        heading: "Meme submissions are open",
        dateLabel: "Voting opens",
        description: "You can submit memes until voting opens.",
        action: "Sign in",
      },
      voting: {
        heading: "Voting is open",
        dateLabel: "Event ends",
        description: "You can give up to three votes to different memes.",
        action: "Sign in",
      },
      ended: {
        heading: "The event has ended",
        dateLabel: "Event ended",
        description: "Thanks for taking part!",
      },
    },
    schedule: "Event schedule",
    loading: "Loading the schedule…",
    missing: "The event schedule has yet to be published.",
    error: "Could not load the event schedule.",
    retry: "Try again",
    timeZone: "Vilnius time",
    shortDays: "d",
    timeRemaining: "Time left",
  },
};
