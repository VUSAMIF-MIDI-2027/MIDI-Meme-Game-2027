"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoadingScreen } from "@/components/Loading/LoadingScreen";
import { useLanguage } from "@/context/LanguageContext";
import MemeCreationFlow from "@/components/MemeCreation/MemeCreationFlow";
import { memeCreationText } from "@/components/MemeCreation/memeCreationText";

export default function CreateMemePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { lang } = useLanguage();
  const router = useRouter();
  const t = memeCreationText[lang];

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.replace("/login");
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) return <LoadingScreen />;

  return (
    <div className="flex flex-1 flex-col text-midi-gray">
      <div className="mx-auto w-full max-w-2xl px-5 pt-12 pb-16 sm:px-8 sm:pt-16">
        <Link
          href="/dashboard"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-midi-blue"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {t.backToDashboard}
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-white">{t.pageTitle}</h1>
        <div className="mt-4">
          <MemeCreationFlow
            onViewMemes={() => router.push("/dashboard#your-memes")}
          />
        </div>
      </div>
    </div>
  );
}
