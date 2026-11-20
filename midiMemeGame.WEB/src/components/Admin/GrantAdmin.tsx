"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "@clerk/react";
import { useLanguage } from "@/context/LanguageContext";
import { AdminUserError, lookupAdminUser, grantAdminRole, type AdminUser } from "@/services/userService";

import { grantAdminText } from "@/app/admin/pageText";

type ErrorKey = "notFound" | "invalid" | "ambiguous" | "denied" | "error";
function errorKey(error: unknown): ErrorKey {
    if (!(error instanceof AdminUserError)) return "error";
    if (error.status === 404) return "notFound";
    if (error.status === 400) return "invalid";
    if (error.status === 409) return "ambiguous";
    if (error.status === 401 || error.status === 403) return "denied";
    return "error";
}
export function GrantAdmin() {
    const { getToken } = useAuth();
    const { lang } = useLanguage();
    const t = grantAdminText[lang];
    const [email, setEmail] = useState("");
    const [user, setUser] = useState<AdminUser | null>(null);
    const [busy, setBusy] = useState<"search" | "grant" | null>(null);
    const [error, setError] = useState<ErrorKey | null>(null);
    const [success, setSuccess] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const request = useRef<AbortController | null>(null);
    const dialog = useRef<HTMLDialogElement>(null);
    useEffect(() => () => { request.current?.abort(); }, []);

    async function run(action: "search" | "grant") {
        if (request.current || (action === "grant" && !user)) return;
        const selectedUser = user;
        const controller = new AbortController();
        request.current = controller;
        setBusy(action); setError(null); setSuccess(false);
        if (action === "search") setUser(null);
        try {
            const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(20_000)]);
            const token = await getToken();
            signal.throwIfAborted();
            if (!token) throw new AdminUserError(401);
            if (action === "search") {
                const found = await lookupAdminUser(email, token, signal);
                if (!controller.signal.aborted) setUser(found);
            } else {
                await grantAdminRole(selectedUser!.userId, token, signal);
                if (!controller.signal.aborted) { setSuccess(true); dialog.current?.close(); }
            }
        } catch (cause) {
            if (!controller.signal.aborted) setError(errorKey(cause));
        } finally {
            if (request.current === controller) request.current = null;
            if (!controller.signal.aborted) setBusy(null);
        }
    }
    function search(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void run("search"); }
    const button = "min-h-11 rounded bg-midi-blue px-5 py-3 font-semibold text-white disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue";
    return (
        <section aria-labelledby="grant-admin-title" className="w-full">
            <h2 id="grant-admin-title" className="sr-only text-2xl font-bold text-white lg:not-sr-only">{t.title}</h2>
            <p className="mt-3 hidden text-white/75 lg:block">{t.description}</p>
            <form onSubmit={search} className="lg:mt-5">
                <label htmlFor="admin-email" className="mb-2 block text-sm text-white">{t.email}</label>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <input id="admin-email" type="email" required maxLength={254} autoComplete="off" disabled={busy !== null} value={email}
                        onChange={event => { setEmail(event.target.value); setUser(null); setError(null); setSuccess(false); }}
                        className="min-h-11 min-w-0 flex-1 rounded border border-white/25 bg-black px-3 text-white focus:outline-2 focus:outline-midi-blue" />
                    <button type="submit" disabled={busy !== null} className={button}>{busy === "search" ? t.searching : t.search}</button>
                </div>
            </form>
            {error && !confirmOpen && <p role="alert" className="mt-4 text-red-300">{t[error]}</p>}
            {user && <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded border border-white/15 p-4">
                <div className="min-w-0"><p className="font-semibold text-white">{user.firstName} {user.lastName}</p><p className="break-all text-white/70">{user.email}</p></div>
                {!success && <button type="button" disabled={busy !== null} onClick={() => { setError(null); setConfirmOpen(true); dialog.current?.showModal(); }} className={button}>{t.grant}</button>}
            </div>}
            {success && <p role="status" className="mt-4 text-[#70cfff]">{t.success}</p>}
            <dialog ref={dialog} onClose={() => setConfirmOpen(false)} aria-labelledby="grant-confirm-title" onCancel={event => { if (busy === "grant") event.preventDefault(); }} className="fixed inset-0 m-auto max-h-[85svh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl border border-white/20 bg-[#090d10] p-6 text-white backdrop:bg-black/80 sm:p-8">
                <h2 id="grant-confirm-title" className="text-2xl font-bold">{t.confirm}</h2>
                <p className="mt-4 font-semibold">{user?.firstName} {user?.lastName}</p><p className="break-all text-[#70cfff]">{user?.email}</p>
                <p className="mt-4 text-white/80">{t.warning}</p>
                {error && <p role="alert" className="mt-4 text-red-300">{t[error]}</p>}
                <div className="mt-6 flex flex-wrap justify-end gap-3">
                    <button type="button" disabled={busy !== null} onClick={() => { dialog.current?.close(); setError(null); }} className="min-h-11 rounded border border-white/20 px-4 py-2">{t.cancel}</button>
                    <button type="button" disabled={busy !== null} aria-busy={busy === "grant"} onClick={() => void run("grant")} className={button}>{busy === "grant" ? t.granting : t.grant}</button>
                </div>
            </dialog>
        </section>
    );
}
