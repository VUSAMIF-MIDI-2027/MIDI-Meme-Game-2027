// All admin times are shown/entered in Europe/Vilnius; the API gets UTC ISO strings.
const TZ = "Europe/Vilnius";

function parts(d: Date) {
    const f = new Intl.DateTimeFormat("en-CA", {
        timeZone: TZ, hourCycle: "h23",
        year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
    });
    const o: Record<string, string> = {};
    for (const p of f.formatToParts(d)) o[p.type] = p.value;
    return o;
}

/** ISO (UTC) -> value for <input type="datetime-local"> in Vilnius time */
export function toInputValue(iso: string | null | undefined): string {
    if (!iso) return "";
    const p = parts(new Date(iso));
    return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** ISO (UTC) -> "2026-11-27 20:00" in Vilnius time */
export function formatDisplay(iso: string | null | undefined): string {
    return iso ? toInputValue(iso).replace("T", " ") : "—";
}

/** datetime-local value (Vilnius wall time) -> UTC ISO string for the API */
export function fromInputValue(value: string): string {
    const [y, mo, d, h, mi] = value.split(/[-T:]/).map(Number);
    const wanted = Date.UTC(y, mo - 1, d, h, mi);
    let ts = wanted;
    for (let i = 0; i < 2; i++) {
        const p = parts(new Date(ts));
        const shown = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute);
        ts += wanted - shown;
    }
    return new Date(ts).toISOString();
}