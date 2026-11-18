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
  image: StaticImageData;
  imageAlt: string;
  caption: string;
  selected?: boolean;
  status?: MemeCardStatus;
  metaLabel?: string;
  button?: MemeCardButton;
};

export default function MemeCard({
  image,
  imageAlt,
  caption,
  selected = false,
  status,
  metaLabel,
  button,
}: MemeCardProps) {
  const borderStyle = selected ? "border-midi-blue" : "border-white/15";
  const buttonStyle = button?.pressed
    ? "border-midi-blue bg-midi-blue text-white"
    : "border-white/20 bg-transparent text-white/80 hover:border-midi-blue hover:text-white";

  return (
    <article
      className={`flex min-w-0 flex-col overflow-hidden rounded-xl border bg-[#0a0a0a] transition-colors ${borderStyle}`}
    >
      <figure className="flex flex-1 flex-col">
        <div className="relative aspect-[3/2]">
          <Image
            src={image}
            alt={imageAlt}
            fill
            loading="eager"
            sizes="(min-width: 1024px) 360px, (min-width: 480px) 440px, 90vw"
            className="object-cover"
          />
        </div>
        <figcaption className="flex min-h-20 flex-1 items-center justify-center bg-white px-5 py-4 text-center text-base font-semibold leading-snug text-black">
          {caption}
        </figcaption>
      </figure>
      {(status || metaLabel || button) && (
        <div className="flex flex-col gap-2 p-3">
          {(status || metaLabel) && (
            <p className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-widest">
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
        </div>
      )}
    </article>
  );
}
