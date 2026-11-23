"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/react";
import { ShieldCheck } from "lucide-react";
import { LoadingScreen } from "@/components/Loading/LoadingScreen";
import { useLanguage } from "@/context/LanguageContext";
import { adminText } from "./pageText";
import { parseSection, SECTIONS, type Section } from "./types";
import { AdminSidebar } from "@/components/Admin/AdminSidebar";
import { AdminHeader } from "@/components/Admin/AdminHeader";
import { Overview } from "@/components/Admin/overview/Overview";
import { MemeApproval } from "@/components/Admin/memeApproval/MemeApproval";
import { Photos } from "@/components/Admin/photos/Photos";
import { Settings } from "@/components/Admin/settings/Settings";

import { AdminResults } from "@/components/Admin/results/AdminResults";

function renderSectionContent(section: Section) {
    switch (section) {
        case "overview":
            return <Overview />;
        case "meme-approval":
            return <MemeApproval />;
        case "photos":
            return <Photos />;
        case "results":
            return <AdminResults />;
        case "settings":
            return <Settings />;
    }
}

function AdminPageContent() {
    const { isLoaded, isSignedIn, sessionClaims } = useAuth();
    const { lang } = useLanguage();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const section = parseSection(searchParams.get("section"));
    const isAdmin = sessionClaims?.role === "admin";
    const t = adminText[lang];
    const currentConfig = SECTIONS.find((s) => s.id === section) ?? SECTIONS[0];

    useEffect(() => {
        if (!isLoaded) return;
        if (!isSignedIn) router.replace("/login");
        else if (!isAdmin) router.replace("/dashboard");
    }, [isLoaded, isSignedIn, isAdmin, router]);

    if (!isLoaded || !isSignedIn || !isAdmin) return <div className="relative flex-1"><LoadingScreen overlay="section" /></div>;

    function navigateToSection(nextSection: Section) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("section", nextSection);
        const basePath = pathname.replace(/\/+$/, "") || "/";
        router.replace(`${basePath}?${params.toString()}`, { scroll: false });
    }

    return (
        <div className="admin-content relative isolate flex min-h-[calc(100svh-4.25rem)] flex-1 flex-col bg-[#080a0c] text-white lg:grid lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,1fr)]">
            <AdminSidebar t={t} section={section} onSelect={navigateToSection} />

            <div className="min-w-0 px-5 py-8 sm:px-8 lg:px-12 lg:py-12 xl:px-16">
                <div className="mx-auto max-w-[1280px]">
                    <AdminHeader
                        t={t}
                        title={currentConfig.getTitle(t)}
                        description={currentConfig.getDescription(t)}
                    />

                    {renderSectionContent(section)}

                    <p className="mt-8 hidden items-center gap-2 text-xs text-white/35 lg:flex">
                        <ShieldCheck className="size-3.5" aria-hidden="true" />
                        {t.access}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function AdminPage() {
    return (
        <Suspense fallback={<div className="relative flex-1"><LoadingScreen overlay="section" /></div>}>
            <AdminPageContent />
        </Suspense>
    );
}