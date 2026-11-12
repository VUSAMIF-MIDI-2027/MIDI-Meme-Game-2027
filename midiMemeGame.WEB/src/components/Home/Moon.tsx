import Image from "next/image";

export function Moon() {
  return (
    <Image
      src="/images/moon.svg"
      width={1000}
      height={1000}
      unoptimized
      alt=""
      aria-hidden="true"
      priority
      sizes="(max-width: 640px) 620px, 950px"
      className="pointer-events-none absolute -top-5 -right-97.5 z-0 h-auto w-155 max-w-none opacity-18 sm:-top-32.5 sm:-right-105 sm:w-[min(950px,85vw)] sm:opacity-24"
    />
  );
}
