"use client";

import { useState } from "react";


import PhotoPicker from "./PhotoPicker";
import MemePreview from "./MemePreview";
import { demoPhotos } from "./demoPhotos";
import { text } from "@/app/pageText";
import { useLanguage } from "@/context/LanguageContext";
import { ui } from "@/styles/ui";
import { howItWorksText } from "./howItWorksText";

export default function HowItWorks() {
    const { lang } = useLanguage();
    const t = howItWorksText[lang];
    const [selectedPhoto, setSelectedPhoto] = useState(demoPhotos[0]);
    const page = text[lang];
    const titles = [page.step1, page.step2, page.step3];

    return (
        <section
            id="how-it-works"
            aria-labelledby="how-it-works-title"
            className="scroll-mt-17 bg-black px-5 py-16 sm:px-6 lg:py-24"
        >
            <div className="mx-auto max-w-6xl">
                <div className="mx-auto mb-10 max-w-xl text-center lg:mb-12">
                    <p className={ui.eyebrow}>{t.eyebrow}</p>
                    <h2 id="how-it-works-title" className="mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                        {t.title}
                    </h2>
                </div>
                <ol className="grid gap-10 md:grid-cols-3 md:gap-6 lg:gap-8">
                    {titles.map((title, index) => (
                        <li key={title} className="mx-auto w-full max-w-110 md:max-w-none">
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
                            <div className="mt-5 flex items-start gap-4">
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
                </ol>
            </div>
        </section>
    );
}
