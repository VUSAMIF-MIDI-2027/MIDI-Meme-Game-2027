import type { StaticImageData } from "next/image";
import type { Lang } from "@/context/LanguageContext";
import pointingPhoto from "#/public/images/how-it-works/midi-photo-close.webp";
import groupPhoto from "#/public/images/how-it-works/midi-group.webp";
import portraitPhoto from "#/public/images/how-it-works/midi-portrait.webp";

import explainingPhoto from "#/public/images/how-it-works/midi-explaining.webp";

type PhotoText = { alt: string; caption: string };

export type DemoPhoto = {
    id: string;
    image: StaticImageData;
    text: Record<Lang, PhotoText>;
};

export const demoPhotos: DemoPhoto[] = [
    {
        id: "pointing",
        image: pointingPhoto,
        text: {
            lt: {
                alt: "MIDI dalyviai rodo vienas į kitą",
                caption: "Kai dėstytojas paklausia, kas eis atsiskaityti pirmas",
            },
            en: {
                alt: "MIDI participants pointing at each other",
                caption: "When the lecturer asks who wants to present first",
            },
        },
    },
    {
        id: "group",
        image: groupPhoto,
        text: {
            lt: {
                alt: "MIDI dalyvių grupinė nuotrauka",
                caption: "Tas vienas šeimos narys kiekvienoje nuotraukoje",
            },
            en: {
                alt: "A group photo of MIDI participants",
                caption: "That one family member in every photo",
            },
        },
    },
    {
        id: "portrait",
        image: portraitPhoto,
        text: {
            lt: {
                alt: "MIDI dalyvis žiūri į kamerą, laikydamas ranką prie smakro",
                caption: "Kai dėstytojas sako „šitą jau turėtumėt mokėti“",
            },
            en: {
                alt: "A MIDI participant looking at the camera with a hand near his chin",
                caption: "When the lecturer says “you should already know this”",
            },
        },
    },
    {
        id: "explaining",
        image: explainingPhoto,
        text: {
            lt: {
                alt: "MIDI dalyvis kalba ir gestikuliuoja rankomis",
                caption: "Aš aiškinu, kodėl grupiniam darbe buvau tik morališkai",
            },
            en: {
                alt: "A MIDI participant talking and gesturing",
                caption: "Me explaining why my only contribution to the group project was moral support",
            },
        },
    },
];
