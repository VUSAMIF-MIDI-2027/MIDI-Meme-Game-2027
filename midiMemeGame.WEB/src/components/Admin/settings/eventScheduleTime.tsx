const DAY_MS = 24 * 60 * 60 * 1000;

const vilniusFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Vilnius",
    calendar: "iso8601",
    numberingSystem: "latn",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
});

function vilniusWallTime(instant: number): string {
    const parts = Object.fromEntries(
        vilniusFormatter.formatToParts(instant).map(({ type, value }) => [type, value]),
    );
    return `${parts.year.padStart(4, "0")}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}

export function formatVilniusInput(iso: string | null | undefined): string {
    if (!iso) return "";
    const ms = Date.parse(iso);
    if (!Number.isFinite(ms)) return "";
    return vilniusWallTime(ms).slice(0, 16);
}

export function parseVilniusInput(input: string): string | null {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input)) return null;

    const local = `${input}:00`;
    const wallTime = Date.parse(`${local}Z`);
    if (!Number.isFinite(wallTime) || new Date(wallTime).toISOString().slice(0, 19) !== local) {
        return null;
    }

    // Check offsets on both sides of a possible DST clock change.
    const matches = new Set<number>();
    for (const probe of [wallTime - DAY_MS, wallTime + DAY_MS]) {
        const offset = Date.parse(`${vilniusWallTime(probe)}Z`) - probe;
        const instant = wallTime - offset;
        if (Number.isFinite(instant) && vilniusWallTime(instant) === local) {
            matches.add(instant);
        }
    }

    const [instant] = matches;
    return matches.size === 1 ? new Date(instant).toISOString() : null;
}