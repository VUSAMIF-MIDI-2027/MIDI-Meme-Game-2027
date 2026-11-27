"use client";

import { useState } from "react";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { SignIn, SignUp } from "@clerk/react";
import { useLanguage } from "@/context/LanguageContext";
import { authText } from "@/app/login/pageText";
import { authAppearance } from "./authAppearance";

export function AuthPanel() {
    const { lang } = useLanguage();
    const t = authText[lang];
    const [mode, setMode] = useState<"register" | "login">("register");

    return (
        <div className="w-full">
            <div className="mb-8 grid grid-cols-2 border-b border-[#2c2c2c]">
                <button
                    type="button"
                    onClick={() => setMode("register")}
                    className={`border-b-2 py-4 font-semibold ${mode === "register"
                            ? "border-[#0075b5] text-white"
                            : "border-transparent text-[#6f7579]"
                        }`}
                >
                    {t.registerTab}
                </button>

                <button
                    type="button"
                    onClick={() => setMode("login")}
                    className={`border-b-2 py-4 font-semibold ${mode === "login"
                            ? "border-[#0075b5] text-white"
                            : "border-transparent text-[#6f7579]"
                        }`}
                >
                    {t.loginTab}
                </button>
            </div>

            <div className="mb-5 flex items-start gap-3 rounded-xl bg-[#111111] p-3 text-sm leading-relaxed text-white/80">
                <LockKeyhole aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <div>
                    {mode === "register" && <p className="mb-1">{t.privacyNotice}</p>}
                    <Link href="/privacy" className="font-semibold text-[#70cfff] underline underline-offset-4">
                        {t.privacyLink}
                    </Link>
                </div>
            </div>
            {mode === "register" ? (
                <SignUp routing="hash" forceRedirectUrl="/dashboard" appearance={authAppearance} />
            ) : (
                <SignIn routing="hash" forceRedirectUrl="/dashboard" appearance={authAppearance} />
            )}
        </div>
    );
}

