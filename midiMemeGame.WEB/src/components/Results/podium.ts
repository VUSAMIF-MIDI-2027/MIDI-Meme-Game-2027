// 1st – trophy, 2nd – second trophy cat, 3rd – medal cat.
export const TROPHIES = { 1: "/cats/trofejus1.svg", 2: "/cats/trofejus2.svg", 3: "/cats/medalis.svg" } as const;

// Intrinsic trophy size in pixels.
export const TROPHY_SIZE = 56;

// On narrow screens, the winner sits above the two runner-up cards.
export const PODIUM_POSITION = {
    1: "col-span-2 row-start-1 mx-auto w-full max-w-88 md:col-span-1 md:col-start-2 md:max-w-none",
    2: "col-start-1 row-start-2 md:row-start-1 md:mt-14",
    3: "col-start-2 row-start-2 md:col-start-3 md:row-start-1 md:mt-14",
} as const;
