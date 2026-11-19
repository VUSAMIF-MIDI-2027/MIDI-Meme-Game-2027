"use client";

import { useEffect, useSyncExternalStore } from "react";
import { UserProfile, useAuth } from "@clerk/react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/Loading/LoadingScreen";
import { authAppearance } from "@/components/Auth/authAppearance";
import styles from "./account.module.css";
import { useLanguage } from "@/context/LanguageContext";

function subscribeToHash(callback: () => void) {
    window.addEventListener("hashchange", callback);
    return () => window.removeEventListener("hashchange", callback);
}

export default function AccountPage() {
    const { isLoaded, isSignedIn } = useAuth();
    const router = useRouter();
    const { lang } = useLanguage();
    const hash = useSyncExternalStore(subscribeToHash, () => window.location.hash, () => "");
    const securityActive = hash.includes("security");

    useEffect(() => {
        if (isLoaded && !isSignedIn) router.replace("/login");
    }, [isLoaded, isSignedIn, router]);

    if (!isLoaded || !isSignedIn) return <LoadingScreen />;

    return (
        <div className={`${styles.page} flex-1 text-midi-gray`}>
            <div className={styles.settings}>
                <nav aria-label={lang === "lt" ? "Paskyros nustatymai" : "Account settings"} className={styles.tabs}>
                    <a href="#/" aria-current={!securityActive ? "page" : undefined}>{lang === "lt" ? "Profilis" : "Profile"}</a>
                    <a href="#/security" aria-current={securityActive ? "page" : undefined}>{lang === "lt" ? "Saugumas" : "Security"}</a>
                </nav>
                <UserProfile routing="hash" fallback={<LoadingScreen />} appearance={{
                    variables: authAppearance.variables,
                    elements: {
                        rootBox: styles.profile,
                        cardBox: styles.card,
                        navbar: styles.sidebar,
                        navbarMobileMenuButton: styles.mobileMenuButton,
                        navbarMobileMenuRow: styles.mobileMenuButton,
                        navbarButton: { color: "#a3a3a3" },
                        "navbarButton__active": { color: "#70cfff", background: "#0075b51a" },
                        pageScrollBox: styles.content,
                        profileSection: { borderColor: "#2c2c2c" },
                        profileSectionPrimaryButton: styles.editButton,
                        profileSectionPrimaryButton__emailAddresses: { display: "none" },
                        badge: { color: "#c5c5c5", background: "#222", borderColor: "#383838" },
                        formButtonPrimary: { background: "#0075b5", color: "#ffffff" },
                    },
                }} />
            </div>
        </div>
    );
}
