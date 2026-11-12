export function Moon() {
  return (
    <picture>
      <source media="(width < 40rem)" srcSet="/images/moon-600.webp" />
      {/* Static hosting: picture selects the prepared mobile asset without an image server. */}
      
      <img
        src="/images/moon-1600.webp"
        width={1600}
        height={1600}
        alt=""
        aria-hidden="true"
        loading="eager"
        fetchPriority="high"
        className="pointer-events-none absolute top-24 -right-30 z-0 h-auto w-75 max-w-none opacity-30 contrast-125 sm:top-10 sm:-right-57.5 sm:w-190 sm:opacity-40 mask-[linear-gradient(to_right,transparent_0%,black_65%,black_100%)]"
      />
    </picture>
  );
}


