import Image from "next/image";
import moon from "#/public/images/moon-current.webp";

export function Moon() {
  return (<>
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
    <Image
      src="/cats/kosmonautas.svg"
      alt=""
      aria-hidden="true"
      width={180}
      height={180}
      className="pointer-events-none absolute top-24 right-0 z-0 h-auto w-20 -rotate-12 select-none sm:top-[28%] sm:right-2 sm:w-36 lg:right-8 lg:w-44"
    />
    </>
  );
}



