"use client";

import { useLanguage } from "@/context/LanguageContext";
import Image, { type StaticImageData } from "next/image";
import type { ReactNode } from "react";

export type MemeCardStatus = {
  label: string;
  className?: string;
};

export type MemeCardButton = {
  label: string;
  onClick: () => void;
  ariaLabel?: string;
  pressed?: boolean;
  icon?: ReactNode;
};

type MemeCardProps = {
  image: string | StaticImageData;
  imageAlt: string;
  caption: string;
  selected?: boolean;
  status?: MemeCardStatus;
  metaLabel?: string;
  button?: MemeCardButton;
  footer?: ReactNode;
  layout?: "stacked" | "meta-footer";
};

export default function MemeCard({
  image,
  imageAlt,
  caption,
  selected = false,
  status,
  metaLabel,
  button,
  footer,
  layout = "stacked",
}: MemeCardProps) {
  const { lang } = useLanguage();
  const metaFooter = layout === "meta-footer";
  const borderStyle = selected ? "border-midi-blue" : "border-white/15";
  const buttonStyle = button?.pressed
    ? "border-midi-blue bg-midi-blue text-white"
    : "border-white/20 bg-transparent text-white/80 hover:border-midi-blue hover:text-white";

  return (
    <article
      className={`flex min-w-0 flex-col overflow-hidden rounded-xl border transition-colors ${metaFooter ? "bg-[#1d1d1d]" : "bg-[#0a0a0a]"} ${borderStyle}`}
    >
      <figure className="flex min-w-0 flex-1 flex-col">
        <div className="relative aspect-[3/2]">
          {image ? (
            <Image
              src={image}
              alt={imageAlt}
              fill
              unoptimized={typeof image === "string"}
              loading="eager"
              decoding={typeof image === "string" && image.startsWith("blob:") ? "sync" : "async"}
              sizes="(min-width: 1024px) 360px, (min-width: 480px) 440px, 90vw"
              className="object-cover"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center px-4 text-center text-sm text-white/70">
              {lang === "lt" ? "Nepavyko įkelti nuotraukos" : "Photo could not be loaded"}
            </span>
          )}
        </div>
        <figcaption
          className={`flex min-h-20 flex-1 items-center justify-center px-5 py-4 text-center text-base font-semibold leading-snug text-black ${metaFooter ? "bg-midi-gray" : "bg-white"}`}
        >
          {caption}
        </figcaption>
      </figure>
      {(status || metaLabel || button || footer) && (
        <div
          className={`flex flex-col gap-2 p-3 ${metaFooter ? "sm:p-4" : ""}`}
        >
          {(status || metaLabel) && (
            <p
              className={`flex gap-3 text-xs ${metaFooter ? "flex-row flex-wrap items-center justify-between" : "items-center justify-between font-semibold uppercase tracking-widest"}`}
            >
              {metaLabel && (
                <span className="text-text-muted">{metaLabel}</span>
              )}
              {status && (
                <span className={status.className ?? "text-text-muted"}>
                  {status.label}
                </span>
              )}
            </p>
          )}
          {button && (
            <button
              type="button"
              aria-pressed={button.pressed}
              aria-label={button.ariaLabel ?? button.label}
              onClick={button.onClick}
              className={`flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-midi-blue ${buttonStyle}`}
            >
              {button.icon}
              {button.label}
            </button>
          )}
          {footer}
        </div>
      )}
    </article>
  );
}
