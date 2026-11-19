"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@clerk/react";
import { useLanguage } from "@/context/LanguageContext";
import { LoadingScreen } from "@/components/Loading/LoadingScreen";
import { LogoutButton } from "./LogoutButton";
import { accountText } from "./pageText";
import { syncUser } from "@/services/userService";
import { FirstVisitRules } from "./FirstVisitRules";

export function UserSync() {
    const { isLoaded, isSignedIn, sessionId } = useAuth();

    if (!isLoaded || !isSignedIn || !sessionId) return null;

    return <SignedInUserSync key={sessionId} />;
}

function SignedInUserSync() {
    const { getToken } = useAuth();
    const { lang } = useLanguage();
    const t = accountText[lang];
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        const signal = AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(20_000),
        ]);

        async function synchronize() {
            try {
                const token = await getToken();
                signal.throwIfAborted();
                if (!token) throw new Error("Clerk session token is unavailable.");

                await syncUser(token, signal);
                if (!controller.signal.aborted) {
                    setStatus("success");

                }
            } catch {
                if (!controller.signal.aborted) setStatus("error");
            }
        }

        void synchronize();
        return () => controller.abort();
    }, [getToken, attempt]);

    if (status === "loading") return <LoadingScreen message="preparingAccount" overlay />;
    if (status === "success") return <FirstVisitRules />;

    return (
        <div role="alert" className="fixed inset-x-0 bottom-0 top-17 z-40 flex flex-col items-center justify-center gap-5 bg-page-background px-6 text-center text-white">
            <p>
                {t.syncFailed}
            </p>
            <button
                type="button"
                className="shrink-0 rounded-lg bg-[#0075b5] px-4 py-2 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                onClick={() => {
                    setStatus("loading");
                    setAttempt(value => value + 1);
                }}
            >
                {t.retry}
            </button>
            <LogoutButton />
        </div>
    );
}
