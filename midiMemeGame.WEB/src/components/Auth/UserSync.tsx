"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@clerk/react";
import { useLanguage } from "@/context/LanguageContext";
import { syncUser } from "@/services/userService";

export function UserSync() {
    const { isLoaded, isSignedIn, sessionId } = useAuth();

    if (!isLoaded || !isSignedIn || !sessionId) return null;

    return <SignedInUserSync key={sessionId} />;
}

function SignedInUserSync() {
    const { getToken } = useAuth();
    const { lang } = useLanguage();
    const [failed, setFailed] = useState(false);


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
                    setFailed(false);

                }
            } catch {
                if (!controller.signal.aborted) setFailed(true);
            }
        }

        void synchronize();
        return () => controller.abort();
    }, [getToken, attempt]);

    if (!failed) return null;

    return (
        <div role="alert" className="fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-xl items-center justify-between gap-4 rounded-xl border border-[#0075b5] bg-[#171717] p-4 text-sm text-white shadow-lg">
            <p>
                {lang === "lt"
                    ? "Nepavyko paruošti tavo paskyros. Pabandyk dar kartą."
                    : "We couldn't prepare your account. Please try again."}
            </p>
            <button
                type="button"
                className="shrink-0 rounded-lg bg-[#0075b5] px-4 py-2 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                onClick={() => {
                    setFailed(false);
                    setAttempt(value => value + 1);
                }}
            >
                {lang === "lt" ? "Bandyti dar kartą" : "Try again"}
            </button>
        </div>
    );
}
