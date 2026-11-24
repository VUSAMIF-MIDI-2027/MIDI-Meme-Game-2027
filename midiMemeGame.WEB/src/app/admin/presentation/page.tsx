"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import midiLogo from "#/public/logos/MIDI-Logotipas-pilnas-baltas.png";
import stars from "../../account/account.module.css";
import { useAuth } from "@clerk/react";
import { LoadingScreen } from "@/components/Loading/LoadingScreen";
import { FlyingCat } from "@/components/FlyingCat";
import dioCatStyles from "@/components/Shared/DioCat.module.css";
import { PresentationMemeCard } from "@/components/Admin/presentation/PresentationMemeCard";
import { useLanguage } from "@/context/LanguageContext";
import { usePresentationAutoScroll } from "@/hooks/admin/usePresentationAutoScroll";
import { usePresentationMemes } from "@/hooks/admin/usePresentationMemes";
import { presentationText } from "./pageText";
import styles from "./presentation.module.css";

type CatMessageProps = {
    src: string;
    title: string;
    description: string;
};

function CatMessage({ src, title, description }: CatMessageProps) {
    return (
        <div className="flex min-h-full flex-col items-center justify-center gap-6 px-6 text-center">
            <Image
                src={src}
                alt=""
                width={220}
                height={220}
                unoptimized
                className="size-40 [image-rendering:pixelated] sm:size-56"
            />
            <h1 className="text-3xl font-extrabold sm:text-5xl">{title}</h1>
            <p className="max-w-2xl text-lg text-white/60 sm:text-2xl">{description}</p>
        </div>
    );
}

export default function PresentationPage() {
    const { isLoaded, isSignedIn, sessionClaims } = useAuth();
    const { lang } = useLanguage();
    const router = useRouter();
    const scrollRef = useRef<HTMLDivElement>(null);
    const galleryRef = useRef<HTMLElement>(null);

    const isAdmin = isLoaded && isSignedIn && sessionClaims?.role === "admin";
    const t = presentationText[lang];
    const { memes, photoUrls, status } = usePresentationMemes(isAdmin);
    usePresentationAutoScroll(scrollRef, galleryRef, isAdmin && status === "ready" && memes.length > 0);

    useEffect(() => {
        if (!isLoaded) return;
        if (!isSignedIn) router.replace("/login");
        else if (sessionClaims?.role !== "admin") router.replace("/dashboard");
    }, [isLoaded, isSignedIn, sessionClaims, router]);

    useEffect(() => {
        if (!isAdmin) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [isAdmin]);

    if (!isAdmin) {
        return (
            <div className="relative flex-1">
                <LoadingScreen overlay="section" />
            </div>
        );
    }

    return (
        <div
            ref={scrollRef}
            className="fixed inset-0 z-[100] overflow-y-auto bg-[#080a0c] text-white"
        >
            {status === "loading" && <LoadingScreen overlay="section" />}

            {status === "error" && (
                <CatMessage
                    src="/cats/hundred_yard_stare.svg"
                    title={t.errorTitle}
                    description={t.errorDescription}
                />
            )}

            {status === "ready" && memes.length === 0 && (
                <CatMessage
                    src="/cats/sleepy.svg"
                    title={t.emptyTitle}
                    description={t.emptyDescription}
                />
            )}

            {status === "ready" && memes.length > 0 && (
                <>
                    <section className={stars.page + " flex h-dvh flex-col items-center justify-center gap-6 overflow-hidden px-5 text-center sm:gap-10"}>
                        <Image
                            src={midiLogo}
                            alt="Matematikų ir informatikų dienos"
                            loading="eager"
                            sizes="(min-width: 1536px) 352px, (min-width: 640px) 256px, 160px"
                            className="h-auto w-40 sm:w-64 2xl:w-88"
                        />
                        <div>
                            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-[#70cfff] sm:text-lg">Naktis su MIDI</p>
                            <h1 className="text-4xl font-extrabold text-white sm:text-6xl lg:text-7xl 2xl:text-8xl">{t.introTitle}</h1>
                        </div>
                        <span aria-hidden="true" className={dioCatStyles.cat + " [--dio-cat-size:5rem] sm:absolute sm:right-[10%] sm:bottom-[10%] sm:[--dio-cat-size:7rem] lg:[--dio-cat-size:10rem]"} />
                        <FlyingCat startSide="left" bounceOnContact interactive={false} />
                    </section>
                    <section ref={galleryRef} aria-labelledby="presentation-memes-title" className="[--presentation-header-height:4rem] sm:[--presentation-header-height:4.5rem]">
                        <h2
                            id="presentation-memes-title"
                            className={styles.galleryHeading + " sticky top-0 z-10 flex h-[var(--presentation-header-height)] items-center justify-center px-5 text-center text-2xl font-bold text-white sm:text-3xl"}
                        >
                            {t.introTitle}
                        </h2>
                        <div
                            data-presentation-grid
                            className="grid auto-rows-[calc(100dvh-var(--presentation-header-height)-4rem)] grid-cols-1 gap-8 p-8 sm:grid-cols-2 xl:auto-rows-[calc(100dvh-var(--presentation-header-height)-6rem)] xl:gap-12 xl:p-12"
                        >
                            {memes.map((meme) => (
                                <PresentationMemeCard
                                    key={meme.id}
                                    imageUrl={photoUrls[meme.sourcePhotoId]}
                                    caption={meme.caption}
                                />
                            ))}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
