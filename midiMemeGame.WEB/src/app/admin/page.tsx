"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/react";
import { ArrowLeft, ArrowUpRight, LayoutDashboard, ShieldCheck, UsersRound, BookOpen } from "lucide-react";
import { LoadingScreen } from "@/components/Loading/LoadingScreen";
import { useLanguage } from "@/context/LanguageContext";
import { ResetRulesAcknowledgements } from "@/components/Admin/ResetRulesAcknowledgements";
import { GrantAdmin } from "@/components/Admin/GrantAdmin";

const text = {
    lt: {
        back: "Į dalyvio puslapį", label: "Valdymo skydelis", admin: "Administravimas",
        overview: "Apžvalga", team: "Administratoriai", rules: "Taisyklės",
        title: "Viskas savo vietoje.", description: "Tvarkyk komandos prieigą ir dalyvių supažindinimą su taisyklėmis.",
        teamDescription: "Pridėk žmogų prie organizatorių komandos pagal jo el. paštą.",
        rulesDescription: "Pakviesk dalyvius iš naujo perskaityti konkurso taisykles.",
        open: "Atidaryti", access: "Organizatorių erdvė", tools: "Konkurso valdymas",
    },
    en: {
        back: "Participant home", label: "Control panel", admin: "Administration",
        overview: "Overview", team: "Administrators", rules: "Rules",
        title: "Everything in one place.", description: "Manage team access and participant rules acknowledgements.",
        teamDescription: "Add someone to the organising team using their email address.",
        rulesDescription: "Ask participants to read the competition rules again.",
        open: "Open", access: "Organiser workspace", tools: "Competition management",
    },
};
type Section = "overview" | "team" | "rules";

export default function AdminPage() {
    const { isLoaded, isSignedIn, sessionClaims } = useAuth();
    const { lang } = useLanguage();
    const router = useRouter();
    const [section, setSection] = useState<Section>("overview");
    const isAdmin = sessionClaims?.role === "admin";
    const t = text[lang];
    const navigation = [
        { id: "overview", label: t.overview, icon: LayoutDashboard },
        { id: "team", label: t.team, icon: UsersRound },
        { id: "rules", label: t.rules, icon: BookOpen },
    ] as const;

    useEffect(() => {
        if (!isLoaded) return;
        if (!isSignedIn) router.replace("/login");
        else if (!isAdmin) router.replace("/dashboard");
    }, [isLoaded, isSignedIn, isAdmin, router]);

    if (!isLoaded || !isSignedIn || !isAdmin) return <LoadingScreen />;

    return (
        <div className="flex min-h-[calc(100svh-4.25rem)] flex-1 flex-col bg-[#080a0c] text-white lg:grid lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,1fr)]">
            <aside className="flex shrink-0 flex-col border-b border-white/10 bg-[#0d1013] px-5 pt-2 lg:border-r lg:border-b-0 lg:p-6">
                <div className="hidden items-center gap-3 px-3 py-5 lg:flex">
                    <ShieldCheck className="size-7 text-midi-blue" aria-hidden="true" />
                    <div><p className="text-lg font-bold">{t.admin}</p><p className="mt-1 text-xs text-white/45">Naktis su MIDI</p></div>
                </div>
                <p className="mb-4 hidden px-3 pt-8 text-[11px] font-semibold tracking-[0.16em] text-white/40 uppercase lg:block">{t.tools}</p>
                <nav aria-label={t.admin} className="grid grid-cols-[1fr_1.45fr_1fr] gap-1 lg:flex lg:flex-col lg:gap-2">
                    {navigation.map(({ id, label, icon: Icon }) => (
                        <button key={id} type="button" aria-current={section === id ? "page" : undefined} onClick={() => setSection(id)}
                            className={`flex min-h-12 items-center justify-center gap-2 border-b-2 px-1 py-3 text-sm lg:rounded-lg lg:border-b-0 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-midi-blue lg:justify-start lg:gap-3 lg:px-4 ${section === id ? "border-midi-blue text-[#70cfff] lg:bg-midi-blue lg:text-white" : "border-transparent text-white/60 hover:bg-white/5 hover:text-white"}`}>
                            <Icon className="hidden size-4 shrink-0 sm:block" aria-hidden="true" />{label}
                        </button>
                    ))}
                </nav>
                <Link href="/dashboard" className="hidden min-h-11 items-center gap-2 px-3 text-sm text-white/50 hover:text-white lg:mt-auto lg:inline-flex lg:pt-12">
                    <ArrowLeft className="size-4" aria-hidden="true" />{t.back}
                </Link>
            </aside>
            <div className="min-w-0 px-5 py-8 sm:px-8 lg:px-12 lg:py-12 xl:px-16">
                <div className="mx-auto max-w-[1280px]">
                    <header className="mb-6 lg:mb-12 lg:border-b lg:border-white/10 lg:pb-8">
                        <p className="text-xs font-bold tracking-[0.18em] text-midi-blue uppercase">{t.label}</p>
                        <h1 className="mt-3 text-3xl font-extrabold sm:text-5xl">{section === "overview" ? t.title : section === "team" ? t.team : t.rules}</h1>
                        <p className="mt-4 max-w-xl text-base leading-relaxed text-white/60">{section === "overview" ? t.description : section === "team" ? t.teamDescription : t.rulesDescription}</p>
                    </header>
                    {section === "overview" ? (
                        <div className="grid gap-5 xl:grid-cols-2">
                            {[
                                { id: "team" as const, title: t.team, description: t.teamDescription, icon: UsersRound },
                                { id: "rules" as const, title: t.rules, description: t.rulesDescription, icon: BookOpen },
                            ].map(({ id, title, description, icon: Icon }) => (
                                <button key={id} type="button" onClick={() => setSection(id)} className="group flex flex-col lg:min-h-64 items-start rounded-xl border border-white/10 bg-[#11161a] p-6 text-left transition-colors hover:border-midi-blue/60 hover:bg-[#131c23] focus-visible:outline-2 focus-visible:outline-midi-blue sm:p-8">
                                    <span className="flex size-11 items-center justify-center rounded-lg bg-midi-blue/10 text-midi-blue"><Icon className="size-5" aria-hidden="true" /></span>
                                    <h2 className="mt-4 text-2xl font-bold lg:mt-6">{title}</h2>
                                    <p className="mt-2 max-w-sm leading-relaxed text-white/60">{description}</p>
                                    <span className="mt-5 inline-flex w-full lg:mt-8 items-center justify-between border-t border-white/10 pt-4 text-sm font-semibold text-[#70cfff]">{t.open}<ArrowUpRight className="size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" /></span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="max-w-4xl lg:rounded-xl lg:border lg:border-white/10 lg:bg-[#11161a] lg:p-10">
                            {section === "team" ? <GrantAdmin /> : <ResetRulesAcknowledgements />}
                        </div>
                    )}
                    <p className="mt-8 hidden items-center gap-2 text-xs text-white/35 lg:flex"><ShieldCheck className="size-3.5" aria-hidden="true" />{t.access}</p>
                </div>
            </div>
        </div>
    );
}

