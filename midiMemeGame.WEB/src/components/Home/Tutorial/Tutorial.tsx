"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PhotoPicker from "./PhotoPicker";
import MemePreview from "./MemePreview";
import VotePreview from "./VotePreview";
import { demoPhotos } from "./demoPhotos";
import { text } from "@/app/pageText";
import { useLanguage } from "@/context/LanguageContext";
import { tutorialText } from "./tutorialText";

export default function Tutorial({ showRulesLink = false }: { showRulesLink?: boolean }) {
    const { lang } = useLanguage();
    const t = tutorialText[lang];
    const page = text[lang];
    const [selectedPhoto, setSelectedPhoto] = useState(demoPhotos[0]);
    const votingPhotos = demoPhotos.filter((photo) => photo.id !== selectedPhoto.id);
    const creationSteps = [page.step1, page.step2, page.step3];

    return (
        <section
            id="tutorial"
            aria-labelledby="tutorial-title"
            className="scroll-mt-17 bg-black px-5 py-16 sm:px-6 lg:py-24"
        >
            <div className="mx-auto max-w-6xl">
                <div className="mx-auto mb-10 max-w-xl text-center lg:mb-12">
                    <h2 id="tutorial-title" className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                        {t.title}
                    </h2>
                </div>
                <ol className="grid gap-10 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
                    {creationSteps.map((title, index) => (
                        <li key={title} className="mx-auto flex w-full max-w-110 flex-col gap-5 lg:max-w-none">
                            {index === 0 ? (
                                <PhotoPicker selectedPhoto={selectedPhoto} onSelect={setSelectedPhoto} lang={lang} />
                            ) : (
                                <MemePreview
                                    step={index + 1}
                                    photo={selectedPhoto.image}
                                    caption={selectedPhoto.text[lang].caption}
                                    submitted={t.submitted}
                                    photoAlt={selectedPhoto.text[lang].alt}
                                />
                            )}
                            <div className="order-first flex items-start gap-4 lg:order-last">
                                <span className="pt-1 text-sm font-bold text-midi-blue">
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                                <div>
                                    <h3 className="text-xl font-bold">{title}</h3>
                                    <p className="mt-2 text-sm leading-relaxed text-text-muted">{t.descriptions[index]}</p>
                                </div>
                            </div>
                        </li>
                    ))}
                    <li className="mx-auto w-full max-w-110 border-t border-white/10 pt-10 lg:col-span-3 lg:max-w-none lg:pt-12">
                        <div className="mb-8 flex items-start gap-4">
                            <span className="pt-2 text-sm font-bold text-midi-blue">04</span>
                            <div>
                                <h3 className="text-2xl font-bold sm:text-3xl">{page.step4}</h3>
                                <p className="mt-2 text-base leading-relaxed text-text-muted">{t.descriptions[3]}</p>
                            </div>
                        </div>
                        <VotePreview key={selectedPhoto.id} lang={lang} photos={votingPhotos} />
                        {showRulesLink && (
                            <Link
                                href="/rules"
                                className="mt-11 flex w-full items-center gap-3 rounded-lg bg-[radial-gradient(ellipse_29%_48%_at_29%_50%,color-mix(in_srgb,var(--midi-blue)_15%,transparent),transparent),radial-gradient(ellipse_33%_46%_at_55%_54%,color-mix(in_srgb,var(--midi-blue)_8%,transparent),transparent)] px-3 text-2xl leading-tight font-bold text-midi-blue focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-midi-blue motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:hover:scale-[1.02] sm:mt-12 sm:gap-6 sm:px-5 sm:text-3xl lg:text-4xl"
                            >
                                <Image
                                    src="/cats/skaitantis_kasaras.svg"
                                    alt=""
                                    width={160}
                                    height={160}
                                    className="size-24 shrink-0 sm:size-32 lg:size-40 [image-rendering:pixelated]"
                                />
                                <span className="min-w-0">
                                    <span className="block text-midi-white">{t.rulesLink}</span>
                                    <span className="mt-1 block text-sm leading-snug font-normal text-text-muted sm:text-base">
                                        {t.rulesLinkDescription}
                                    </span>
                                </span>
                                <ArrowRight aria-hidden="true" className="ml-auto size-5 shrink-0 sm:size-7" />
                            </Link>
                        )}
                    </li>
                </ol>
            </div>
        </section>
    );
}
