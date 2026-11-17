"use client";

import { useEffect } from "react";
import { LoadingScreen } from "@/components/Loading/LoadingScreen";
import { useAuth } from "@clerk/react";
import { useRouter } from "next/navigation";

import { LogoutButton } from "@/components/Auth/LogoutButton";
import { Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { dashboardText } from "./pageText";

export default function DashboardPage() {
    const { isLoaded, isSignedIn } = useAuth();
    const { lang } = useLanguage();
    const t = dashboardText[lang];
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && !isSignedIn) router.replace("/login");
    }, [isLoaded, isSignedIn, router]);

    if (!isLoaded || !isSignedIn) return <LoadingScreen />;

    return (
        <section className="relative isolate flex min-h-[calc(100svh-4.25rem)] flex-col items-center justify-center overflow-hidden px-6 py-20 text-center text-white">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(0,117,181,0.18), transparent 65%)" }} />
            <div className="mb-8 flex size-20 items-center justify-center rounded-full bg-[#0075b5]">
                <Check aria-hidden="true" className="size-10" />
            </div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#48b5ed]">
                {t.miniTitle}
            </p>
            <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-6xl">
                {t.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#b2b7bb]">
                {t.description}
            </p>
            <div className="mt-10"><LogoutButton /></div>
        </section>
    );
}
