"use client";

import { useState } from "react";
import PhotoPicker from "./PhotoPicker";
import MemePreview from "./MemePreview";
import VotePreview from "./VotePreview";
import { demoPhotos } from "./demoPhotos";
import { text } from "@/app/pageText";
import { useLanguage } from "@/context/LanguageContext";
import { howItWorksText } from "./howItWorksText";

export default function HowItWorks() {
    const { lang } = useLanguage();
    const t = howItWorksText[lang];
    const page = text[lang];
    const [selectedPhoto, setSelectedPhoto] = useState(demoPhotos[0]);
    const votingPhotos = demoPhotos.filter((photo) => photo.id !== selectedPhoto.id);
    const creationSteps = [page.step1, page.step2, page.step3];

    return (
        <section
            id="how-it-works"
            aria-labelledby="how-it-works-title"
            className="scroll-mt-17 bg-black px-5 py-16 sm:px-6 lg:py-24"
        >
            <div className="mx-auto max-w-6xl">
                <div className="mx-auto mb-10 max-w-xl text-center lg:mb-12">
                    <h2 id="how-it-works-title" className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
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
                    </li>
                </ol>
            </div>
        </section>
    );
}
