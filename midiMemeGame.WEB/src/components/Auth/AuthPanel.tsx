"use client";

import { useState } from "react";
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
                    {lang === "lt" ? "Registruotis" : "Register"}
                </button>

                <button
                    type="button"
                    onClick={() => setMode("login")}
                    className={`border-b-2 py-4 font-semibold ${mode === "login"
                            ? "border-[#0075b5] text-white"
                            : "border-transparent text-[#6f7579]"
                        }`}
                >
                    {lang === "lt" ? "Prisijungti" : "Sign in"}
                </button>
            </div>

            {mode === "register" ? (
                <SignUp routing="hash" appearance={authAppearance} />
            ) : (
                <SignIn routing="hash" appearance={authAppearance} />
            )}
            <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#111111] p-3 text-xs leading-relaxed text-[#898f93]">
                <LockKeyhole aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <p>{t.privacyNotice}</p>
            </div>
        </div>
    );
}

