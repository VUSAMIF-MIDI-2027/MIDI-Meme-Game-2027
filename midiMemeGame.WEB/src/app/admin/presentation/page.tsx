"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@clerk/react";
import { LoadingScreen } from "@/components/Loading/LoadingScreen";
import { PresentationMemeCard } from "@/components/Admin/presentation/PresentationMemeCard";
import { useLanguage } from "@/context/LanguageContext";
import { usePresentationAutoScroll } from "@/hooks/admin/usePresentationAutoScroll";
import { usePresentationMemes } from "@/hooks/admin/usePresentationMemes";
import { presentationText } from "./pageText";

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

    const isAdmin = isLoaded && isSignedIn && sessionClaims?.role === "admin";
    const t = presentationText[lang];
    const { memes, photoUrls, status } = usePresentationMemes(isAdmin);
    usePresentationAutoScroll(scrollRef, isAdmin);

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
                <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2 xl:gap-12 xl:p-12 min-[1920px]:grid-cols-3 min-[2560px]:grid-cols-4">
                    {memes.map((meme) => (
                        <PresentationMemeCard
                            key={meme.id}
                            imageUrl={photoUrls[meme.sourcePhotoId]}
                            caption={meme.caption}
                            photoMissingLabel={t.photoMissing}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
