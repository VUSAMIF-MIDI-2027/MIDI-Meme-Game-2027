import type { FormEvent } from "react";
import type { eventScheduleText } from "@/app/admin/pageText";
import { eventScheduleFields, type EventSchedule, type EventScheduleField } from "@/services/eventScheduleService";

type Props = {
    copy: typeof eventScheduleText.lt;
    values: EventSchedule;
    isNew: boolean;
    isDirty: boolean;
    saving: boolean;
    feedback: { type: "error" | "success"; message: string } | null;
    invalidField: EventScheduleField | null;
    onChange: (field: EventScheduleField, value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const inputClass = "block min-h-12 w-full min-w-0 rounded-lg border border-white/20 bg-black px-3 py-2 text-base text-white scheme-dark focus-visible:outline-2 focus-visible:outline-midi-blue aria-invalid:border-red-300";

function normalizeTime(value: string): string {
    const typedTime = /^(\d{1,2}):(\d{0,2})$/.exec(value);
    if (typedTime) return `${typedTime[1].padStart(2, "0")}:${typedTime[2]}`;

    const digits = value.replace(/\D/g, "").slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
}

function joinDateAndTime(date: string, time: string): string {
    return date || time ? `${date}T${time}` : "";
}

export function EventScheduleForm({
    copy, values, isNew, isDirty, saving, feedback, invalidField, onChange, onSubmit,
}: Props) {
    return (
        <form onSubmit={onSubmit} aria-busy={saving}>
            <p id="schedule-time-zone" className="text-sm text-white/75">{copy.timeZone}</p>
            {isNew && (
                <p className="mt-2 text-sm text-[#70cfff]">
                    {copy.empty}
                </p>
            )}
            <fieldset disabled={saving} aria-describedby="schedule-time-zone" className="mt-5 grid gap-5">
                {eventScheduleFields.map(field => {
                    const [date, time = ""] = values[field].split("T");
                    const invalid = invalidField === field;
                    return (
                        <fieldset key={field} className="min-w-0 sm:max-w-sm">
                            <legend className="mb-2 text-sm font-semibold">{copy[field]}</legend>
                            <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-3">
                                <label className="min-w-0 text-xs text-white/70">
                                    {copy.date}
                                    <input
                                        id={`${field}-date`}
                                        type="date"
                                        value={date}
                                        required
                                        aria-invalid={invalid || undefined}
                                        aria-describedby={invalid ? "schedule-feedback" : undefined}
                                        onChange={event => onChange(field, joinDateAndTime(event.target.value, time))}
                                        className={`mt-1 ${inputClass}`}
                                    />
                                </label>
                                <label className="text-xs text-white/70">
                                    {copy.time}
                                    <input
                                        id={`${field}-time`}
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="HH:MM"
                                        value={time}
                                        required
                                        aria-invalid={invalid || undefined}
                                        aria-describedby={invalid ? "schedule-feedback" : undefined}
                                        onChange={event => onChange(field, joinDateAndTime(date, normalizeTime(event.target.value)))}
                                        className={`mt-1 tabular-nums ${inputClass}`}
                                    />
                                </label>
                            </div>
                        </fieldset>
                    );
                })}
            </fieldset>
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
                <button
                    type="submit"
                    disabled={!isDirty || saving}
                    className="min-h-11 rounded-lg bg-midi-blue px-5 py-3 font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue disabled:opacity-50"
                >
                    {saving ? copy.saving : copy.save}
                </button>
                {feedback && (
                    <p
                        id="schedule-feedback"
                        role={feedback.type === "error" ? "alert" : "status"}
                        className={feedback.type === "error" ? "text-sm text-red-300" : "text-sm text-[#70cfff]"}
                    >
                        {feedback.message}
                    </p>
                )}
            </div>
        </form>
    );
}
