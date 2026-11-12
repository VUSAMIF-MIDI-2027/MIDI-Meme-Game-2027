import Image from "next/image";
import moon from "#/public/images/moon.webp";

export function Moon() {
  return (
    <Image
      src={moon}
      alt=""
      aria-hidden="true"
      priority
      sizes="(max-width: 640px) 620px, 950px"
      className="pointer-events-none absolute -top-5 -right-97.5 z-0 h-auto w-155 max-w-none opacity-[0.18] sm:-top-32.5 sm:-right-105 sm:w-[min(950px,85vw)] sm:opacity-[0.24]"
    />
  );
}
