"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./CatReaction.module.css";

const reactions = [
  { sound: "/cats/meow-soft.mp3", lt: "Miau!", en: "Meow!" },
  { sound: "/cats/purr-1.mp3", lt: "Brrr!", en: "Brrr!" },
  { sound: "/cats/meow-long.mp3", lt: "Miaaau!", en: "Meeow!" },
] as const;

type Reaction = (typeof reactions)[number];

const BUBBLE_DURATION_MS = 1800;
const INVITATION_DELAY_MS = 5000;
const invitation = { lt: "Paglostyk mane!", en: "Pet me!" };

function createSoundPlayer() {
  const context = typeof AudioContext === "function" ? new AudioContext() : null;
  const preload = new AbortController();
  const buffers = new Map<Reaction["sound"], AudioBuffer>();
  let stopPlaying: (() => void) | undefined;

  if (context) {
    for (const { sound } of reactions) {
      void fetch(sound, { signal: preload.signal })
        .then((response) => {
          if (!response.ok) throw new Error("Cat sound unavailable");
          return response.arrayBuffer();
        })
        .then((bytes) => context.decodeAudioData(bytes))
        .then((buffer) => {
          if (!preload.signal.aborted) buffers.set(sound, buffer);
        })
        .catch(() => {
          // A tap can still use the media element if preloading fails.
        });
    }
  }

  return {
    play(sound: Reaction["sound"]) {
      stopPlaying?.();
      const buffer = buffers.get(sound);
      if (context && buffer) {
        if (context.state !== "running") {
          // Unlock audio inside the button's user gesture.
          void context.resume().catch(() => {});
        }
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.onended = () => source.disconnect();
        source.start();
        stopPlaying = () => source.stop();
      } else {
        const clip = new Audio(sound);
        void clip.play().catch(() => {});
        stopPlaying = () => clip.pause();
      }
    },
    dispose() {
      preload.abort();
      stopPlaying?.();
      if (context) void context.close().catch(() => {});
    },
  };
}

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
  const nextReaction = useRef(0);
  const invitationTimeout = useRef<number | undefined>(undefined);
  const reactionTimeout = useRef<number | undefined>(undefined);
  const player = useRef<ReturnType<typeof createSoundPlayer> | null>(null);

  useEffect(() => {
    invitationTimeout.current = window.setTimeout(() => setShowInvitation(true), INVITATION_DELAY_MS);
    const soundPlayer = createSoundPlayer();
    player.current = soundPlayer;

    return () => {
      window.clearTimeout(invitationTimeout.current);
      window.clearTimeout(reactionTimeout.current);
      soundPlayer.dispose();
      player.current = null;
    };
  }, []);

  function react() {
    const next = reactions[nextReaction.current];
    nextReaction.current = (nextReaction.current + 1) % reactions.length;

    player.current?.play(next.sound);
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
        {reaction && <span key={reaction.sound} className={styles.cloud}>{reaction[lang]}</span>}
      </span>
    </div>
  );
}
