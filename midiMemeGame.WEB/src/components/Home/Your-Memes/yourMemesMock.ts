import type { StaticImageData } from "next/image";
import type { Lang } from "@/context/LanguageContext";
import pointingPhoto from "#/public/images/tutorial/midi-photo-close.webp";
import groupPhoto from "#/public/images/tutorial/midi-group.webp";
import portraitPhoto from "#/public/images/tutorial/midi-portrait.webp";
import explainingPhoto from "#/public/images/tutorial/midi-explaining.webp";

export type MemeStatus = "approved" | "pending" | "rejected";

type MemeText = { alt: string; caption: string };

export type YourMeme = {
    id: string;
    image: StaticImageData;
    submittedAt: string;
    status: MemeStatus;
    text: Record<Lang, MemeText>;
};

export const yourMemes: YourMeme[] = [
    {
        id: "meme-1",
        image: portraitPhoto,
        submittedAt: "2026-11-16T09:41",
        status: "approved",
        text: {
            lt: {
                alt: "MIDI dalyvis mąsliai žiūri į kamerą",
                caption: "Kai dėstytojas sako „šito egzamine nebus“",
            },
            en: {
                alt: "A MIDI participant looking thoughtfully at the camera",
                caption: "When the lecturer says “this won't be on the exam”",
            },
        },
    },
    {
        id: "meme-2",
        image: groupPhoto,
        submittedAt: "2026-11-16T10:03",
        status: "approved",
        text: {
            lt: {
                alt: "MIDI dalyvių grupinė nuotrauka",
                caption: "Aš ir vaikinai 3 val. nakties prieš terminą",
            },
            en: {
                alt: "A group photo of MIDI participants",
                caption: "Me and the boys at 3 AM before the deadline",
            },
        },
    },
    {
        id: "meme-3",
        image: pointingPhoto,
        submittedAt: "2026-11-16T11:27",
        status: "pending",
        text: {
            lt: {
                alt: "MIDI dalyviai rodo vienas į kitą",
                caption: "Kas sužaidė visus praktinių užduočių testus",
            },
            en: {
                alt: "MIDI participants pointing at each other",
                caption: "Who passed all the practical assignment tests",
            },
        },
    },
    {
        id: "meme-4",
        image: explainingPhoto,
        submittedAt: "2026-11-16T13:48",
        status: "approved",
        text: {
            lt: {
                alt: "MIDI dalyvis kalba ir gestikuliuoja rankomis",
                caption: "Aš aiškinu, kodėl kodas veikia tik mano kompiuteryje",
            },
            en: {
                alt: "A MIDI participant talking and gesturing",
                caption: "Me explaining why the code only works on my machine",
            },
        },
    },
    {
        id: "meme-5",
        image: portraitPhoto,
        submittedAt: "2026-11-16T15:12",
        status: "pending",
        text: {
            lt: {
                alt: "MIDI dalyvis įtemptai žiūri į kamerą",
                caption: "POV: tau paklausė, ar skaitei paskaitos medžiagą",
            },
            en: {
                alt: "A MIDI participant staring tensely at the camera",
                caption: "POV: you got asked if you read the lecture material",
            },
        },
    },
    {
        id: "meme-6",
        image: groupPhoto,
        submittedAt: "2026-11-16T17:55",
        status: "rejected",
        text: {
            lt: {
                alt: "MIDI dalyvių grupinė nuotrauka",
                caption: "Grupinis darbas be to vieno žmogaus",
            },
            en: {
                alt: "A group photo of MIDI participants",
                caption: "Group project without that one person",
            },
        },
    },
];
