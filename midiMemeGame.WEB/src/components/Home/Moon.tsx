import Image from "next/image";

export function Moon() {
  return (
    <Image
      src="/images/moon-hd.webp"
      width={3240}
      height={3240}
      unoptimized
      alt=""
      aria-hidden="true"
      priority
      sizes="(max-width: 640px) 300px, 760px"
      className="pointer-events-none absolute top-24 -right-30 z-0 h-auto w-75 max-w-none opacity-30 contrast-125 sm:top-10 sm:-right-57.5 sm:w-190 sm:opacity-40 mask-[linear-gradient(to_right,transparent_0%,black_65%,black_100%)]"
    />
  );
}



