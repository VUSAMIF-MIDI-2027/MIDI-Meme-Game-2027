"use client";

import { ArrowDown, Check, X } from "lucide-react";
import Image from "next/image";
import moon from "#/public/images/moon-current.webp";
import stars from "../account/account.module.css";
import { CatReaction } from "@/components/CatReaction";
import Tutorial from "@/components/Home/Tutorial/Tutorial";
import { rulesText } from "@/components/Home/rulesText";
import { useLanguage } from "@/context/LanguageContext";

const copy = {
    lt: {
        eyebrow: "NAKTIS SU MIDI / TAISYKLĖS",
        intro: "Dalyvauk gyvai arba nuotoliu. Štai ką reikia žinoti prieš pateikiant memą.",
        stats: [["3", "memai", "daugiausia vienam žmogui"], ["3", "balsai", "skirtingiems memams"], ["1", "taškas", "už kiekvieną balsą"]],
        steps: [
            { title: "Pateik memus", lines: ["Prisijunk ir pasirink pateiktą nuotrauką.", "Pridėk prierašą. Gali pateikti iki 3 memų.", "Organizatoriai peržiūrės tavo pateiktus memus."] },
            { title: "Balsuok", lines: ["Balsavimas prasideda pasibaigus įkėlimui.", "Rinkis iš organizatorių patvirtintų memų.", "Skirk iki 3 balsų: kiekvieną vis kitam memui."] },
            { title: "Sulauk rezultatų", lines: ["Pasibaigus balsavimui susumuojami taškai.", "Paskelbiami rezultatai ir prizų laimėtojai."] },
        ],
        voting: "Kaip paskirstyti balsus?", yes: "3 memams po 1 balsą", no: "3 balsai vienam memui",
        content: "Turinio ribos", banned: "Jokio NSFW ar asmeninių įžeidimų.",
        explanation: "Seksualinis, nepadorus ar žmones asmeniškai įžeidžiantis turinys draudžiamas.",
        consequence: "Užblokuotas memas = panaudotas bandymas",
        consequenceDetail: "Bandymas negrąžinamas. Jei dar turi likusių iš 3 bandymų, gali pateikti kitą memą.",
        example: "Pavyzdžiui: pateikei 1 memą, jis užblokuotas — lieka 2 bandymai.",
        tutorial: "Pažiūrėti, kaip kurti memą",
    },
    en: {
        eyebrow: "NAKTIS SU MIDI / RULES",
        intro: "Join in person or remotely. Here is what to know before submitting a meme.",
        stats: [["3", "memes", "maximum per person"], ["3", "votes", "for different memes"], ["1", "point", "for each vote"]],
        steps: [
            { title: "Submit your memes", lines: ["Sign in and choose a provided photo.", "Add a caption. Submit up to 3 memes.", "Organisers will review your submissions."] },
            { title: "Vote", lines: ["Voting opens after submissions close.", "Choose from organiser-approved memes.", "Cast up to 3 votes, each for a different meme."] },
            { title: "See the results", lines: ["Points are counted after voting closes.", "Results and prize winners are announced."] },
        ],
        voting: "How can you use your votes?", yes: "1 vote each for 3 memes", no: "3 votes for one meme",
        content: "Content limits", banned: "No NSFW content or personal insults.",
        explanation: "Sexual, indecent or personally insulting content is not allowed.",
        consequence: "Blocked meme = used attempt",
        consequenceDetail: "The attempt is not refunded. If you have attempts remaining out of your 3, you can submit another meme.",
        example: "For example: you submit 1 meme and it gets blocked — you have 2 attempts left.",
        tutorial: "See how to create a meme",
    },
};

export default function RulesPage() {
    const { lang } = useLanguage();
    const t = copy[lang];
    return (
        <div className={`${stars.page} flex-1 text-white`}>
            <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-20">
                <header className="grid items-center gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:gap-8">
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-[#70cfff]">{t.eyebrow}</p>
                        <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-6xl">{rulesText[lang].title}</h1>
                        <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">{t.intro}</p>
                    </div>
                    <div className="pointer-events-none relative isolate mx-auto h-36 w-full max-w-md select-none md:h-56">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_57%_50%,#0075b534,transparent_68%)]" />
                        <div className="absolute top-1/2 left-1/2 h-18 w-52 -translate-1/2 -rotate-15 rounded-[50%] border border-[#70cfff]/25 md:h-28 md:w-[88%]" />
                        <Image
                            src={moon}
                            alt=""
                            sizes="(min-width: 768px) 224px, 144px"
                            className="absolute top-1/2 left-[58%] size-36 -translate-1/2 object-contain opacity-70 md:size-56"
                        />
                        <CatReaction
                            hovering
                            className="absolute top-[54%] left-[36%] size-26 -translate-1/2 [--flight-rotation:-12deg] drop-shadow-[0_4px_12px_#000] md:size-38"
                        />
                    </div>
                </header>
                <ul className="mt-6 grid grid-cols-3 border-y border-white/15 py-6 sm:py-8 md:mt-8">
                    {t.stats.map(([number, label, detail]) => <li key={label} className="px-3 first:pl-0 last:pr-0 sm:px-8">
                        <span className="block text-5xl font-bold leading-none text-[#18a9ec] sm:text-7xl">{number}</span>
                        <span className="mt-2 block text-lg font-bold sm:text-2xl">{label}</span>
                        <span className="mt-1 block text-xs leading-relaxed text-white/65 sm:text-sm">{detail}</span>
                    </li>)}
                </ul>
                <div className="mt-12 grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
                    <section aria-labelledby="flow-title">
                        <h2 id="flow-title" className="mb-8 text-2xl font-bold">{rulesText[lang].flowTitle}</h2>
                        <ol className="space-y-9">
                            {t.steps.map((step, index) => <li key={step.title} className="grid grid-cols-[2rem_1fr] gap-4 sm:gap-5">
                                <span className="pt-1 text-lg font-bold text-[#70cfff]">0{index + 1}</span>
                                <div>
                                    <h3 className="text-xl font-bold">{step.title}</h3>
                                    <ul className="mt-3 space-y-2 text-base leading-relaxed text-white/85">
                                        {step.lines.map(line => <li key={line}>{line}</li>)}
                                    </ul>
                                </div>
                            </li>)}
                        </ol>
                    </section>
                    <div className="space-y-9 lg:border-l lg:border-white/15 lg:pl-10">
                        <section aria-labelledby="voting-title">
                            <h2 id="voting-title" className="text-xl font-bold">{t.voting}</h2>
                            <p className="mt-4 flex items-center gap-3 text-base"><Check aria-hidden="true" className="size-5 shrink-0 text-[#70cfff]" />{t.yes}</p>
                            <p className="mt-3 flex items-center gap-3 text-base text-white/65"><X aria-hidden="true" className="size-5 shrink-0" />{t.no}</p>
                        </section>
                        <section aria-labelledby="content-title" className="border-t border-white/15 pt-7">
                            <h2 id="content-title" className="text-xl font-bold">{t.content}</h2>
                            <p className="mt-4 font-semibold text-amber-200">{t.banned}</p>
                            <p className="mt-2 text-base leading-relaxed text-white/80">{t.explanation}</p>
                            <div className="mt-6 rounded-lg border border-midi-blue/20 bg-midi-blue/6 p-4 sm:p-5">
                                <h3 className="text-lg leading-snug font-semibold text-white/90">{t.consequence}</h3>
                                <p className="mt-2 text-base leading-relaxed text-white/85">{t.consequenceDetail}</p>
                                <p className="mt-3 text-sm leading-relaxed text-white/70">{t.example}</p>
                            </div>
                        </section>
                    </div>
                </div>
                <a href="#tutorial" className="mx-auto mt-12 flex min-h-12 w-fit items-center justify-center gap-3 rounded border border-white/20 px-5 py-3 font-semibold transition-colors hover:border-midi-blue hover:text-[#70cfff] focus-visible:outline-2 focus-visible:outline-midi-blue">{t.tutorial}<ArrowDown aria-hidden="true" className="size-4" /></a>
            </div>
            <Tutorial />
        </div>
    );
}

