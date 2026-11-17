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
            <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue">
                <LogOut aria-hidden="true" className="size-4" />
                {accountText[lang].signOut}
            </button>
        </SignOutButton>
    );
}
