"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./CatReaction.module.css";

const reactions = [
  { id: "meow", lt: "Miau!", en: "Meow!" },
  { id: "brrr", lt: "Brrr!", en: "Brrr!" },
  { id: "longMeow", lt: "Miaaau!", en: "Meeow!" },
] as const;

type Reaction = (typeof reactions)[number];

const sounds: Partial<Record<Reaction["id"], string>> = {
  meow: "/cats/meow-soft.mp3",
  brrr: "/cats/purr-1.mp3",
  longMeow: "/cats/meow-long.mp3",
};
const BUBBLE_DURATION_MS = 1800;
const INVITATION_DELAY_MS = 5000;
const invitation = { lt: "Paglostyk mane!", en: "Pet me!" };

export function CatReaction({
  className = "",
  hovering = false,
}: {
  className?: string;
  hovering?: boolean;
}) {
  const { lang } = useLanguage();
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [showInvitation, setShowInvitation] = useState(false);
  const catImage = useRef<HTMLImageElement>(null);
  const nextReaction = useRef(0);
  const invitationTimeout = useRef<number | undefined>(undefined);
  const reactionTimeout = useRef<number | undefined>(undefined);
  const clips = useRef<Partial<Record<Reaction["id"], HTMLAudioElement>>>({});
  const playing = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    invitationTimeout.current = window.setTimeout(() => setShowInvitation(true), INVITATION_DELAY_MS);
    const preloaded: typeof clips.current = {};
    for (const { id } of reactions) {
      const url = sounds[id];
      if (!url) continue;

      const clip = new Audio();
      clip.preload = "auto";
      clip.src = url;
      preloaded[id] = clip;
    }
    clips.current = preloaded;

    return () => {
      window.clearTimeout(invitationTimeout.current);
      window.clearTimeout(reactionTimeout.current);
      for (const clip of Object.values(preloaded)) {
        clip.pause();
        clip.removeAttribute("src");
        clip.load();
      }
      clips.current = {};
      playing.current = null;
    };
  }, []);

  function react() {
    const next = reactions[nextReaction.current];
    nextReaction.current = (nextReaction.current + 1) % reactions.length;

    playing.current?.pause();
    const clip = clips.current[next.id];
    playing.current = clip ?? null;
    if (clip) {
      if (clip.currentTime > 0) clip.currentTime = 0;
      void clip.play().catch(() => {
        // Keep the speech bubble available when audio cannot play.
      });
    }

    if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
      catImage.current?.animate([{ scale: "0.92" }, { scale: "1" }], {
        duration: 180,
        easing: "ease-out",
      });
    }
    window.clearTimeout(invitationTimeout.current);
    setShowInvitation(false);

    setReaction(next);
    window.clearTimeout(reactionTimeout.current);
    reactionTimeout.current = window.setTimeout(() => setReaction(null), BUBBLE_DURATION_MS);
  }

  return (
    <div className={`${styles.reaction} ${hovering ? styles.hovering : ""} ${className}`}>
      <button
        type="button"
        aria-label={lang === "lt" ? "MIDI katinas: pamiauk" : "MIDI cat: meow"}
        className={styles.button}
        onClick={react}
      >
        <Image
          ref={catImage}
          src="/cats/kosmonautas.svg"
          alt=""
          width={160}
          height={160}
          draggable={false}
          className={styles.cat}
        />
      </button>
      <span role="status" className={styles.status}>
        {showInvitation && <span key="invitation" className={styles.cloud}>{invitation[lang]}</span>}
        {reaction && <span key={reaction.id} className={styles.cloud}>{reaction[lang]}</span>}
      </span>
    </div>
  );
}
