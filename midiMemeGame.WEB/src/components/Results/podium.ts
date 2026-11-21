// 1st – trophy, 2nd – second trophy cat, 3rd – medal cat.
export const trophies = { 1: "/cats/trofejus1.svg", 2: "/cats/trofejus2.svg", 3: "/cats/medalis.svg" } as const;

// Podium on desktop: 2nd – 1st – 3rd with the winner raised. Mobile keeps 1st, 2nd, 3rd.
export const podiumPosition = {
    1: "md:order-2",
    2: "md:order-1 md:mt-14",
    3: "md:order-3 md:mt-14",
} as const;
