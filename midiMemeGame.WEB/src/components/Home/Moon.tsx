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
      className="pointer-events-none absolute top-[-20px] -right-[390px] z-0 h-auto w-[620px] max-w-none opacity-[0.18] sm:top-[-130px] sm:-right-[420px] sm:w-[min(950px,85vw)] sm:opacity-[0.24]"
    />
  );
}
