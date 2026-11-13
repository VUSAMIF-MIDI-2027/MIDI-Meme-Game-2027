import Image from "next/image";
import moon from "#/public/images/moon-current.webp";

export function Moon() {
  return (
    <Image
      loading="eager"
      src={moon}
      alt=""
      aria-hidden="true"
      priority
      sizes="(min-width: 640px) 760px, 300px"
      className={`
        pointer-events-none absolute top-24 -right-30 z-0
        h-auto w-75 max-w-none opacity-30 contrast-125
        mask-[linear-gradient(to_right,transparent_0%,black_65%,black_100%)]
        sm:top-1/2 sm:-translate-y-1/2 sm:w-190 sm:opacity-40
        sm:right-[max(-230px,calc((100vw-1800px)/2-230px))]
      `}
    />
  );
}



