"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { UserPlus } from "lucide-react";
import { useAuth } from "@clerk/react";
import { useLanguage } from "@/context/LanguageContext";
import {
    AdminUserError,
    lookupAdminUser,
    grantAdminRole,
    type AdminUser,
} from "@/services/adminService";

const text = {
    lt: {
        title: "Pridėti administratorių",
        description: "Rask žmogų pagal el. paštą ir suteik jam administratoriaus teises.",
        email: "El. paštas",
        search: "Rasti vartotoją",
        searching: "Ieškoma…",
        grant: "Suteikti teises",
        granting: "Suteikiama…",
        confirm: "Suteikti administratoriaus teises?",
        warning: "Šis žmogus gaus prieigą prie administravimo funkcijų.",
        cancel: "Atšaukti",
        success: "Administratoriaus teisės suteiktos. Vartotojas turėtų atsijungti ir prisijungti iš naujo.",
        notFound: "Vartotojas nerastas. Paprašyk jo pirmiausia prisijungti prie svetainės.",
        invalid: "Patikrink el. pašto adresą.",
        ambiguous: "Šį el. paštą turi keli vartotojai. Teisės nesuteiktos — patikrink vartotojų duomenis.",
        denied: "Neturi administratoriaus teisių arba sesija nebegalioja.",
        error: "Nepavyko gauti atsakymo. Pabandyk dar kartą.",
    },
    en: {
        title: "Add an administrator",
        description: "Find a person by email and grant them administrator access.",
        email: "Email address",
        search: "Find user",
        searching: "Searching…",
        grant: "Grant access",
        granting: "Granting…",
        confirm: "Grant administrator access?",
        warning: "This person will gain access to administration features.",
        cancel: "Cancel",
        success: "Administrator access granted. The user should sign out and sign in again.",
        notFound: "User not found. Ask them to sign in to the website first.",
        invalid: "Check the email address.",
        ambiguous: "Multiple users have this email. Access was not granted — check the user records.",
        denied: "You do not have administrator access or your session has expired.",
        error: "Could not receive a response. Please try again.",
    },
};

type ErrorKey = "notFound" | "invalid" | "ambiguous" | "denied" | "error";

function errorKey(error: unknown): ErrorKey {
    if (!(error instanceof AdminUserError)) return "error";
    if (error.status === 404) return "notFound";
    if (error.status === 400) return "invalid";
    if (error.status === 409) return "ambiguous";
    if (error.status === 401 || error.status === 403) return "denied";
    return "error";
}

export function GrantAdminSection() {
    const { getToken } = useAuth();
    const { lang } = useLanguage();
    const t = text[lang];

    const [email, setEmail] = useState("");
    const [user, setUser] = useState<AdminUser | null>(null);
    const [busy, setBusy] = useState<"search" | "grant" | null>(null);
    const [error, setError] = useState<ErrorKey | null>(null);
    const [success, setSuccess] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const request = useRef<AbortController | null>(null);
    const dialog = useRef<HTMLDialogElement>(null);

    useEffect(() => () => {
        request.current?.abort();
    }, []);

    async function run(action: "search" | "grant") {
        if (request.current || (action === "grant" && !user)) return;
        const selectedUser = user;
        const controller = new AbortController();
        request.current = controller;
        setBusy(action);
        setError(null);
        setSuccess(false);
        if (action === "search") setUser(null);

        try {
            const signal = AbortSignal.any([
                controller.signal,
                AbortSignal.timeout(20_000),
            ]);
            const token = await getToken();
            signal.throwIfAborted();
            if (!token) throw new AdminUserError(401);

            if (action === "search") {
                const found = await lookupAdminUser(email, token, signal);
                if (!controller.signal.aborted) setUser(found);
            } else {
                await grantAdminRole(selectedUser!.userId, token, signal);
                if (!controller.signal.aborted) {
                    setSuccess(true);
                    dialog.current?.close();
                }
            }
        } catch (cause) {
            if (!controller.signal.aborted) setError(errorKey(cause));
        } finally {
            if (request.current === controller) request.current = null;
            if (!controller.signal.aborted) setBusy(null);
        }
    }

    function search(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        void run("search");
    }

    const primaryButton =
        "min-h-11 cursor-pointer rounded-lg bg-midi-blue px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue";

    return (
        <section
            aria-labelledby="grant-admin-title"
            className="rounded-xl border border-white/15 bg-[#0d1013] p-5 sm:p-6"
        >
            <div className="flex items-center gap-2.5">
                <UserPlus className="size-5 text-midi-blue" aria-hidden="true" />
                <h2 id="grant-admin-title" className="text-xl font-bold text-white">
                    {t.title}
                </h2>
            </div>
            <p className="mt-1.5 text-sm text-white/60">{t.description}</p>

            <form onSubmit={search} className="mt-5 space-y-1.5">
                <label
                    htmlFor="admin-email"
                    className="block text-sm font-medium text-white/85"
                >
                    {t.email}
                </label>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                        id="admin-email"
                        type="email"
                        required
                        maxLength={254}
                        autoComplete="off"
                        disabled={busy !== null}
                        value={email}
                        onChange={(event) => {
                            setEmail(event.target.value);
                            setUser(null);
                            setError(null);
                            setSuccess(false);
                        }}
                        className="min-h-11 min-w-0 flex-1 rounded-lg border border-white/15 bg-[#0b0f12] px-3.5 py-2.5 text-sm text-white focus:border-midi-blue focus:outline-none"
                    />
                    <button
                        type="submit"
                        disabled={busy !== null}
                        className={primaryButton}
                    >
                        {busy === "search" ? t.searching : t.search}
                    </button>
                </div>
            </form>

            {error && !confirmOpen && (
                <p role="alert" className="mt-4 text-sm font-medium text-rose-400">
                    {t[error]}
                </p>
            )}

            {user && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/10 bg-[#0b0f12] p-4">
                    <div className="min-w-0">
                        <p className="font-semibold text-white">
                            {user.firstName} {user.lastName}
                        </p>
                        <p className="break-all text-sm text-white/65">{user.email}</p>
                    </div>
                    {!success && (
                        <button
                            type="button"
                            disabled={busy !== null}
                            onClick={() => {
                                setError(null);
                                setConfirmOpen(true);
                                dialog.current?.showModal();
                            }}
                            className={primaryButton}
                        >
                            {t.grant}
                        </button>
                    )}
                </div>
            )}

            {success && (
                <p role="status" className="mt-4 text-sm font-medium text-emerald-300">
                    {t.success}
                </p>
            )}

            <dialog
                ref={dialog}
                onClose={() => setConfirmOpen(false)}
                aria-labelledby="grant-confirm-title"
                onCancel={(event) => {
                    if (busy === "grant") event.preventDefault();
                }}
                className="fixed inset-0 m-auto max-h-[85svh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl border border-white/15 bg-[#0d1013] p-6 text-white backdrop:bg-black/80 sm:p-8"
            >
                <h2 id="grant-confirm-title" className="text-2xl font-bold">
                    {t.confirm}
                </h2>
                <p className="mt-4 font-semibold">
                    {user?.firstName} {user?.lastName}
                </p>
                <p className="break-all text-sm text-[#70cfff]">{user?.email}</p>
                <p className="mt-4 text-sm leading-relaxed text-white/75">
                    {t.warning}
                </p>
                {error && (
                    <p role="alert" className="mt-4 text-sm font-medium text-rose-400">
                        {t[error]}
                    </p>
                )}
                <div className="mt-6 flex flex-wrap justify-end gap-3">
                    <button
                        type="button"
                        disabled={busy !== null}
                        onClick={() => {
                            dialog.current?.close();
                            setError(null);
                        }}
                        className="min-h-11 cursor-pointer rounded-lg border border-white/15 bg-[#0b0f12] px-4 py-2 text-sm font-semibold text-white/85 transition-colors hover:border-white/30 disabled:opacity-50"
                    >
                        {t.cancel}
                    </button>
                    <button
                        type="button"
                        disabled={busy !== null}
                        aria-busy={busy === "grant"}
                        onClick={() => void run("grant")}
                        className={primaryButton}
                    >
                        {busy === "grant" ? t.granting : t.grant}
                    </button>
                </div>
            </dialog>
        </section>
    );
}