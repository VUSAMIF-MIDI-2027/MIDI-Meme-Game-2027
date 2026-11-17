"use client"


import { LoadingScreen } from "@/components/Loading/LoadingScreen";
import { useAuth } from "@clerk/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthPanel } from "@/components/Auth/AuthPanel";
import { AuthHero } from "@/components/Auth/AuthHero";

export default function LoginPage() {

    const { isLoaded, isSignedIn } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && isSignedIn) router.replace("/dashboard");
    }, [isLoaded, isSignedIn, router]);

    if (!isLoaded || isSignedIn) {
        return <LoadingScreen />;
    }

    return (
        <section className="grid min-h-[calc(100svh-4.25rem)] items-start lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">

            <AuthHero />

            <div className="flex w-full flex-col items-center justify-center bg-auth-panel-background px-6 py-12 lg:min-h-[calc(100svh-4.25rem)] lg:px-12 lg:py-16">
                <div className="w-full max-w-[440px]">
                    <AuthPanel />
                </div>
            </div>
        </section>
    );
}




