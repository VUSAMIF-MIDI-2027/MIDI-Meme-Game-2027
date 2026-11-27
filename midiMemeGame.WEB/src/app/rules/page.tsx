"use client";

import { ArrowDown, Check, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import stars from "../account/account.module.css";
import styles from "./rules.module.css";
import { FlyingCat } from "@/components/FlyingCat";
import Tutorial from "@/components/Home/Tutorial/Tutorial";
import { rulesText } from "@/components/Home/rulesText";
import { useLanguage } from "@/context/LanguageContext";

const copy = {
    lt: {
        eyebrow: "NAKTIS SU MIDI",
        intro: "Dalyvauk gyvai arba nuotoliu. Štai ką reikia žinoti prieš pateikiant memą.",
        stats: [["3", "memai", "daugiausia vienam žmogui"], ["3", "balsai", "skirtingiems memams"], ["1", "taškas", "už kiekvieną balsą"]],
        steps: [
            { title: "Pateik memus", lines: ["Prisijunk ir pasirink pateiktą nuotrauką.", "Pridėk prierašą. Gali pateikti iki 3 memų.", "Pateikdamas memą privalai leisti jį viešai skelbti. Prieš skelbdami organizatoriai memą peržiūrės."] },
            { title: "Balsuok", lines: ["Balsavimas prasideda pasibaigus įkėlimui.", "Rinkis iš organizatorių patvirtintų memų.", "Skirk iki 3 balsų: kiekvieną vis kitam memui."] },
            { title: "Sulauk rezultatų", lines: ["Pasibaigus balsavimui susumuojami taškai.", "Viešuose rezultatuose rodomi patvirtinti konkurso memai. Pirmos trys vietos rodomos ant podiumo, kiti memai – galerijoje."] },
        ],
        voting: "Kaip paskirstyti balsus?",
        yes: "Gali skirti po 1 balsą 3 skirtingiems memams.",
        no: "Negali tam pačiam memui skirti daugiau nei 1 balso.",
        content: "Turinio ribos",
        explanation: "Draudžiamas seksualinis ir kitas nepadorus turinys (NSFW) bei asmeniniai įžeidimai.",
        rights: "Naudok organizatorių pateiktą nuotrauką ir prierašą, kurį gali teisėtai pateikti. Į prierašą nedėk asmens duomenų, pagal kuriuos būtų galima atpažinti tave ar kitus žmones.",
        consequence: "Užblokuotas memas sunaudoja vieną iš trijų bandymų.",
        consequenceDetail: "Panaudotas bandymas negrąžinamas. Jei dar turi bandymų, gali pateikti kitą memą.",
        publication: "Privalomas memo viešinimas",
        publicationRequirement: "Norėdamas pateikti memą konkursui, privalai leisti jį skelbti viešuose rezultatuose. Patvirtintas memas bus rodomas ir tada, jei nepateks į pirmąsias tris vietas.",
        authorChoice: "Vardo ir pavardės viešinimas neprivalomas. Jei langelį paliksi tuščią, memas bus rodomas be tavo vardo ir pavardės. Pasirinkimą gali pakeisti skiltyje „Mano memai“ paspaudęs „Redaguoti“.",
        publicationTerms: "Pateikdamas memą konkursui suteiki VU SA neatlygintinį, neišimtinį leidimą atgaminti ir rodyti pateiktą memą prisijungusiems dalyviams balsavimo metu bei viešai skelbti jį su vieta ir taškais svetainėje naktis.midi.lt iki 30 dienų nuo rezultatų paskelbimo. Svetainė prieinama iš bet kurios šalies. Leidimas suteikiamas šiam konkursui ir jo rezultatams skelbti.",
        privacy: "Konkurso privatumo pranešimas",
        tutorial: "Pažiūrėti, kaip kurti memą",
    },
    en: {
        eyebrow: "NAKTIS SU MIDI",
        intro: "Join in person or remotely. Here is what to know before submitting a meme.",
        stats: [["3", "memes", "maximum per person"], ["3", "votes", "for different memes"], ["1", "point", "for each vote"]],
        steps: [
            { title: "Submit your memes", lines: ["Sign in and choose a provided photo.", "Add a caption. Submit up to 3 memes.", "You must give permission to publish each meme you submit. The organisers will review it before publication."] },
            { title: "Vote", lines: ["Voting opens after submissions close.", "Choose from organiser-approved memes.", "Cast up to 3 votes, each for a different meme."] },
            { title: "See the results", lines: ["Points are counted after voting closes.", "Approved competition memes appear in the public results. The first three places appear on the podium and the other memes in the gallery."] },
        ],
        voting: "How can you use your votes?",
        yes: "You can give 1 vote each to 3 different memes.",
        no: "You cannot give more than 1 vote to the same meme.",
        content: "Content limits",
        explanation: "Sexual or other indecent content (NSFW) and personal insults are prohibited.",
        rights: "Use a photo supplied by the organisers and a caption you can lawfully submit. Keep personal details that could identify you or anyone else out of the caption.",
        consequence: "A blocked meme uses up one of your three attempts.",
        consequenceDetail: "That attempt is not restored. You can submit another meme if you have attempts left.",
        publication: "Required meme publication",
        publicationRequirement: "To submit a meme, you must allow it to appear in the public results. If approved, your meme will appear even if it does not place in the top three.",
        authorChoice: "Showing your first and last name is optional. Leave the box unchecked to have your meme displayed without your name. You can change your choice by selecting Edit under My Memes.",
        publicationTerms: "By entering a meme, you give VU SR royalty-free, non-exclusive permission to reproduce and show that meme to signed-in voters during voting and to publish it with its place and score on naktis.midi.lt for up to 30 days after results are published. The site is accessible from any country. The permission covers this contest and the publication of its results.",
        privacy: "Contest privacy notice",
        tutorial: "See how to create a meme",
    },
};

export default function RulesPage() {
    const { lang } = useLanguage();
    const t = copy[lang];
    return (
        <div className="flex-1 text-white">
            <div className={stars.page}>
                <FlyingCat startSide="left" bounceOnContact />
                <div className={`${styles.content} mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-20`}>
                    <header className="grid items-center gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:gap-8">
                        <div>
                            <p className="text-xs font-semibold tracking-widest text-[#70cfff]">{t.eyebrow}</p>
                            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-6xl">{rulesText[lang].title}</h1>
                            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">{t.intro}</p>
                        </div>
                        <Image
                            src="/cats/skaitantis_kasaras.svg"
                            width={250}
                            height={250}
                            alt=""
                            loading="eager"
                            className="pointer-events-none w-full max-w-40 justify-self-center select-none [image-rendering:pixelated] md:max-w-56"
                        />
                    </header>
                    <ul className="mt-6 grid grid-cols-3 gap-3 sm:gap-6 md:mt-9">
                        {t.stats.map(([number, label, detail]) => <li key={label} className="min-w-0">
                            <span className="block text-[clamp(2.5rem,5vw,4rem)] font-bold leading-none text-[#18a9ec]">{number}</span>
                            <span className="mt-2 block text-lg font-bold sm:text-2xl">{label}</span>
                            <span className="mt-1 block text-xs leading-relaxed text-white/65 sm:text-sm">{detail}</span>
                        </li>)}
                    </ul>
                    <div className="mt-12 grid gap-10 sm:mt-14 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
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
                        <div className="space-y-8 sm:space-y-10">
                            <section aria-labelledby="voting-title">
                                <h2 id="voting-title" className="text-xl font-bold">{t.voting}</h2>
                                <p className="mt-4 flex items-center gap-3 text-base"><Check aria-hidden="true" className="size-5 shrink-0 text-[#70cfff]" />{t.yes}</p>
                                <p className="mt-3 flex items-center gap-3 text-base text-white/65"><X aria-hidden="true" className="size-5 shrink-0" />{t.no}</p>
                            </section>
                            <section aria-labelledby="content-title">
                                <h2 id="content-title" className="text-xl font-bold">{t.content}</h2>
                                <p className="mt-4 max-w-prose text-base leading-relaxed text-white/85">{t.explanation}</p>
                                <p className="mt-2 max-w-prose text-base leading-relaxed text-white/85">{t.rights}</p>
                                <p className="mt-3 text-lg leading-snug text-amber-200 sm:text-xl">
                                    <strong className="font-bold">{t.consequence}</strong>
                                </p>
                                <p className="mt-2 max-w-prose text-base leading-relaxed text-white/85">{t.consequenceDetail}</p>
                            </section>
                        </div>
                    </div>
                    <section id="publication" aria-labelledby="publication-title" className="mt-10 scroll-mt-24">
                        <h2 id="publication-title" className="text-xl font-bold">{t.publication}</h2>
                        <p className="mt-3 max-w-prose font-semibold text-white">{t.publicationRequirement}</p>
                        <p className="mt-3 max-w-prose text-white/85">{t.authorChoice}</p>
                        <p className="mt-3 max-w-prose text-white/85">{t.publicationTerms}</p>
                        <Link href="/privacy" className="mt-3 inline-block text-[#70cfff] underline underline-offset-4">{t.privacy}</Link>
                    </section>
                    <a href="#tutorial" className="mx-auto mt-12 flex min-h-12 w-fit items-center justify-center gap-3 rounded border border-white/20 px-5 py-3 font-semibold transition-colors hover:border-midi-blue hover:text-[#70cfff] focus-visible:outline-2 focus-visible:outline-midi-blue">{t.tutorial}<ArrowDown aria-hidden="true" className="size-4" /></a>
                </div>
            </div>
            <Tutorial />
        </div>
    );
}

