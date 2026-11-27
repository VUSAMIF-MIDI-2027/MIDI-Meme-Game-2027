"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const copy = {
    lt: {
        title: "Konkurso privatumo pranešimas",
        back: "Grįžti į konkursą",
        controller: {
            title: "Kas tvarko tavo duomenis?",
            description: "Konkurso asmens duomenų valdytojas yra Vilniaus universiteto Studentų atstovybė (VU SA).",
            address: "Universiteto g. 3, Observatorijos kiemelis, LT-01513 Vilnius, Lietuva",
        },
        sections: [
            {
                title: "Kokius duomenis naudojame ir kodėl?",
                paragraphs: [
                    "Registruojantis prašome vardo, pavardės ir el. pašto adreso. Šių duomenų reikia paskyrai sukurti, dalyvavimui administruoti ir su laimėtojais susisiekti dėl prizų. El. paštu taip pat pranešame apie konkurso pradžią. Konkurso laiškai siunčiami iš noreply@midi.lt. Registracijos duomenų reikia norint susikurti paskyrą ir dalyvauti konkurse.",
                    "Taip pat tvarkome paskyros identifikatorių, pateiktus memus, jų vertinimo būseną, balsus ir rezultatus. Patvirtintus memus balsavimo metu mato prisijungę dalyviai. Dalyvavimui administruoti būtinus duomenis tvarkome pagal BDAR 6 straipsnio 1 dalies b punktą.",
                ],
            },
            {
                title: "Kas gali matyti duomenis?",
                paragraphs: [
                    "Duomenis mato įgalioti konkurso administratoriai. Paskyrų kūrimui ir prisijungimui naudojame „Clerk“. Svetainės ir el. pašto paslaugų teikėjai tvarko duomenis tiek, kiek reikia šioms paslaugoms teikti. El. pašto adresai rezultatų puslapyje neviešinami.",
                    "„Clerk“ duomenų tvarkymo priede aprašytas galimas duomenų tvarkymas JAV ir jame nurodytos apsaugos priemonės, įskaitant ES ir JAV duomenų privatumo sistemą bei standartines sutarčių sąlygas, kai jos taikomos.",
                ],
            },
            {
                title: "Ką galime paskelbti viešai?",
                paragraphs: [
                    "Pateikiant memą konkursui privaloma leisti jį viešai skelbti pagal konkurso taisykles. Patvirtinti memai, jų vietos ir taškai skelbiami svetainėje naktis.midi.lt iki 30 dienų nuo rezultatų paskelbimo. Vardą ir pavardę prie memo rodysime tik gavę atskirą sutikimą pagal BDAR 6 straipsnio 1 dalies a punktą.",
                    "Gali dalyvauti, laimėti ir gauti prizą palikęs vardo ir pavardės langelį tuščią. Sutikimą skelbti vardą ir pavardę gali bet kada atšaukti paskyros skiltyje „Mano memai“ paspaudęs „Redaguoti“ arba parašęs VU SA duomenų apsaugos grupei. Atšaukimas nekeičia iki jo atlikto duomenų tvarkymo teisėtumo.",
                ],
            },
            {
                title: "Kiek laiko saugomi duomenys?",
                paragraphs: [
                    "VU SA renginių organizavimo duomenims taiko savo privatumo politikoje nurodytus saugojimo terminus. Įprastas renginio organizavimo duomenų saugojimo terminas – iki vieno mėnesio po renginio. Politiką ir joje išvardytas išimtis rasi nuorodoje žemiau.",
                ],
            },
            {
                title: "Kokias teises turi?",
                paragraphs: [
                    "Gali prašyti susipažinti su duomenimis, juos ištaisyti ar ištrinti, apriboti jų tvarkymą ir, kai taikoma, gauti duomenų kopiją perkeliamu formatu. Dėl šių teisių kreipkis el. paštu dap@vusa.lt. Taip pat gali pateikti skundą Valstybinei duomenų apsaugos inspekcijai.",
                ],
            },
        ],
        links: ["VU SA privatumo politika", "„Clerk“ duomenų tvarkymo priedas", "Skundo pateikimas VDAI"],
    },
    en: {
        title: "Contest privacy notice",
        back: "Back to the contest",
        controller: {
            title: "Who handles your data?",
            description: "The data controller for the contest is Vilnius University Students’ Representation (VU SR).",
            address: "3 Universiteto St., Observatory Courtyard, LT-01513 Vilnius, Lithuania",
        },
        sections: [
            {
                title: "What data do we use and why?",
                paragraphs: [
                    "We ask for your first name, last name and email address to create your account, manage participation and contact winners about prizes. We also email you when the contest opens. Contest emails come from noreply@midi.lt. You need to provide the registration details to create an account and enter the contest.",
                    "We also process your account identifier, submitted memes, moderation status, votes and results. Signed-in participants can see approved memes during voting. Data necessary to administer participation is processed under Article 6(1)(b) GDPR.",
                ],
            },
            {
                title: "Who can access the data?",
                paragraphs: [
                    "Authorised contest administrators have access. We use Clerk to create accounts and authenticate users. Our hosting and email providers process data as needed to provide their services. Email addresses are kept off the public results page.",
                    "Clerk’s Data Processing Addendum describes possible processing in the United States and the applicable safeguards, including the EU–US Data Privacy Framework and Standard Contractual Clauses where applicable.",
                ],
            },
            {
                title: "What can we publish?",
                paragraphs: [
                    "To submit a meme, you must give permission to publish it under the competition rules. Approved memes appear with their places and scores on naktis.midi.lt for up to 30 days after results are published. Showing your first and last name alongside the meme requires separate consent under Article 6(1)(a) GDPR.",
                    "You can enter, win and receive a prize without sharing your name publicly. You can withdraw consent to show your name at any time by selecting Edit under My Memes or by emailing the VU SR data protection team. Withdrawal does not affect the lawfulness of processing before you withdrew consent.",
                ],
            },
            {
                title: "How long is data kept?",
                paragraphs: [
                    "VU SR applies the retention periods set out in its privacy policy to event administration data. The usual retention period is up to one month after an event. The policy and its exceptions are linked below.",
                ],
            },
            {
                title: "What rights do you have?",
                paragraphs: [
                    "You can request access, correction, erasure or restriction of processing and, where applicable, ask for a portable copy of your data. Contact dap@vusa.lt to exercise these rights. You can also lodge a complaint with Lithuania’s State Data Protection Inspectorate.",
                ],
            },
        ],
        links: ["VU SR privacy policy", "Clerk Data Processing Addendum", "File a complaint with the Inspectorate"],
    },
};

const resourceUrls = [
    "https://www.vusa.lt/lt/privatumas",
    "https://clerk.com/legal/dpa",
    "https://vdai.lrv.lt/lt/veiklos-sritys-1/skundu-nagrinejimas/",
];

export default function PrivacyPage() {
    const { lang } = useLanguage();
    const t = copy[lang];

    return (
        <article className="mx-auto w-full max-w-3xl px-5 py-12 text-white sm:px-8 sm:py-16">
            <Link href="/" className="text-sm font-semibold text-[#70cfff] underline underline-offset-4">
                {t.back}
            </Link>
            <h1 className="mb-9 mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">{t.title}</h1>
            <div className="space-y-7">
                <section>
                    <h2 className="mb-2 text-xl font-bold">{t.controller.title}</h2>
                    <p className="mt-2 leading-relaxed text-white/80">{t.controller.description}</p>
                    <address className="mt-2 text-sm not-italic leading-relaxed text-white/80">
                        <p>{t.controller.address}</p>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[#70cfff]">
                            <a className="underline underline-offset-4" href="tel:+37052687144">+370 5 268 7144</a>
                            <a className="underline underline-offset-4" href="mailto:info@vusa.lt">info@vusa.lt</a>
                        </div>
                    </address>
                </section>
                {t.sections.map((section) => (
                    <section key={section.title}>
                        <h2 className="mb-2 text-xl font-bold">{section.title}</h2>
                        {section.paragraphs.map((paragraph) => (
                            <p key={paragraph} className="mt-2 leading-relaxed text-white/80">{paragraph}</p>
                        ))}
                    </section>
                ))}
            </div>
            <ul className="mt-7 space-y-2 border-t border-white/15 pt-6 text-[#70cfff]">
                <li><a className="underline underline-offset-4" href="mailto:dap@vusa.lt">dap@vusa.lt</a></li>
                {t.links.map((label, index) => (
                    <li key={label}>
                        <a className="underline underline-offset-4" href={resourceUrls[index]}>{label}</a>
                    </li>
                ))}
            </ul>
        </article>
    );
}
