"use client";

import { SignOutButton, useAuth } from "@clerk/react";
import { accountText } from "./pageText";
import { LogOut } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function LogoutButton() {
    const { isLoaded, isSignedIn } = useAuth();
    const { lang } = useLanguage();

    if (!isLoaded || !isSignedIn) return null;

    return (
        <SignOutButton redirectUrl="/">
            <button type="button" aria-label={accountText[lang].signOut} title={accountText[lang].signOut} className="inline-flex min-h-10 items-center gap-2 rounded px-1 py-2 text-sm text-text-muted transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue">
                <LogOut aria-hidden="true" className="size-4" />
                <span className="hidden xl:inline">{accountText[lang].signOut}</span>
            </button>
        </SignOutButton>
    );
}
