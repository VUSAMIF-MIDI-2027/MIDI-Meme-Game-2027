"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type DateTimeInputProps = {
    id: string;
    label: string;
    value: string;
    dateAriaLabel: string;
    timeAriaLabel: string;
    onChange: (nextValue: string) => void;
    onBlur?: () => void;
};

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(dateStr: string): boolean {
    if (!ISO_DATE_PATTERN.test(dateStr)) return false;
    const [year, month, day] = dateStr.split("-").map(Number);
    const candidate = new Date(Date.UTC(year, month - 1, day));
    return (
        candidate.getUTCFullYear() === year &&
        candidate.getUTCMonth() === month - 1 &&
        candidate.getUTCDate() === day
    );
}

function formatIsoDate(year: number, monthIndex: number, day: number): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

function getMonthGrid(year: number, monthIndex: number) {
    const firstDayOfMonth = new Date(year, monthIndex, 1);
    // Monday = 0 ... Sunday = 6
    const leadingBlanks = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const cells: { day: number | null; iso: string | null }[] = [];
    for (let i = 0; i < leadingBlanks; i++) {
        cells.push({ day: null, iso: null });
    }
    for (let day = 1; day <= daysInMonth; day++) {
        cells.push({ day, iso: formatIsoDate(year, monthIndex, day) });
    }
    return cells;
}

export function DateTimeInput({
    id,
    label,
    value,
    dateAriaLabel,
    timeAriaLabel,
    onChange,
    onBlur,
}: DateTimeInputProps) {
    const { lang } = useLanguage();
    const [datePart = "", timePart = ""] = value.split("T");
    const [open, setOpen] = useState(false);

    const initialDate = isValidIsoDate(datePart) ? new Date(`${datePart}T00:00:00`) : new Date();
    const [viewYear, setViewYear] = useState(initialDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

    const containerRef = useRef<HTMLDivElement>(null);
    const [previousDatePart, setPreviousDatePart] = useState(datePart);

    if (datePart !== previousDatePart) {
        setPreviousDatePart(datePart);
        if (isValidIsoDate(datePart)) {
            const parsed = new Date(`${datePart}T00:00:00`);
            setViewYear(parsed.getFullYear());
            setViewMonth(parsed.getMonth());
        }
    }

    useEffect(() => {
        if (!open) return;
        function handleOutsideClick(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [open]);

    function handleDateChange(nextDate: string) {
        if (!nextDate) {
            onChange("");
            return;
        }
        onChange(`${nextDate}T${timePart || "00:00"}`);
    }

    function handleTimeChange(nextTime: string) {
        if (!datePart && !nextTime) {
            onChange("");
            return;
        }
        const now = new Date();
        const fallbackDate = formatIsoDate(now.getFullYear(), now.getMonth(), now.getDate());
        const activeDate = isValidIsoDate(datePart) ? datePart : fallbackDate;
        onChange(`${activeDate}T${nextTime || "00:00"}`);
    }

    function shiftMonth(delta: number) {
        const next = new Date(viewYear, viewMonth + delta, 1);
        setViewYear(next.getFullYear());
        setViewMonth(next.getMonth());
    }

    const locale = lang === "lt" ? "lt-LT" : "en-GB";
    const monthTitle = new Intl.DateTimeFormat("lt-LT", {
        year: "numeric",
        month: "long",
    }).format(new Date(viewYear, viewMonth, 1));

    // Mon..Sun short weekday labels in Lithuanian
    const weekdays = Array.from({ length: 7 }, (_, idx) => {
        // 2026-11-16 is a Monday
        const d = new Date(Date.UTC(2026, 10, 16 + idx));
        return new Intl.DateTimeFormat("lt-LT", { weekday: "short", timeZone: "UTC" }).format(d);
    });

    const cells = getMonthGrid(viewYear, viewMonth);
    const inputClasses =
        "min-h-11 rounded-lg border border-white/15 bg-[#0b0f12] px-3.5 py-2.5 text-sm text-white tabular-nums placeholder:text-white/35 focus:border-midi-blue focus:outline-none";

    return (
        <div ref={containerRef} className="relative space-y-1.5">
            <label htmlFor={`${id}-date`} className="block text-sm font-medium text-white/85">
                {label}
            </label>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[1fr_160px]" onBlur={onBlur}>
                <div className="relative flex items-center">
                    <input
                        id={`${id}-date`}
                        type="text"
                        inputMode="numeric"
                        placeholder="YYYY-MM-DD"
                        maxLength={10}
                        lang={locale}
                        aria-label={dateAriaLabel}
                        value={datePart}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className={`${inputClasses} w-full pr-11`}
                    />
                    <button
                        type="button"
                        aria-label={dateAriaLabel}
                        aria-expanded={open}
                        onClick={() => setOpen((prev) => !prev)}
                        className="absolute right-1.5 flex size-8 cursor-pointer items-center justify-center rounded-md text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-midi-blue"
                    >
                        <Calendar className="size-4" aria-hidden="true" />
                    </button>
                </div>

                <input
                    id={`${id}-time`}
                    type="time"
                    step={60}
                    lang={locale}
                    aria-label={timeAriaLabel}
                    value={timePart}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className={`${inputClasses} [color-scheme:dark]`}
                />
            </div>

            {open && (
                <div
                    role="dialog"
                    aria-label={dateAriaLabel}
                    className="z-20 w-full max-w-xs rounded-xl border border-white/15 bg-[#0d1013] p-4 shadow-2xl"
                >
                    <div className="mb-3 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => shiftMonth(-1)}
                            className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-white/15 bg-[#0b0f12] text-white/80 hover:border-midi-blue hover:text-white"
                        >
                            <ChevronLeft className="size-4" aria-hidden="true" />
                        </button>
                        <span className="text-sm font-semibold capitalize text-white">
                            {monthTitle}
                        </span>
                        <button
                            type="button"
                            onClick={() => shiftMonth(1)}
                            className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-white/15 bg-[#0b0f12] text-white/80 hover:border-midi-blue hover:text-white"
                        >
                            <ChevronRight className="size-4" aria-hidden="true" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-white/50">
                        {weekdays.map((dayName) => (
                            <span key={dayName} className="py-1">
                                {dayName}
                            </span>
                        ))}
                    </div>

                    <div className="mt-1 grid grid-cols-7 gap-1 text-center text-xs">
                        {cells.map((cell, index) => {
                            if (!cell.day || !cell.iso) {
                                return <span key={`blank-${index}`} className="h-8" />;
                            }
                            const isSelected = datePart === cell.iso;
                            return (
                                <button
                                    key={cell.iso}
                                    type="button"
                                    onClick={() => {
                                        handleDateChange(cell.iso!);
                                        setOpen(false);
                                    }}
                                    className={`h-8 cursor-pointer rounded-lg font-medium tabular-nums transition-colors ${
                                        isSelected
                                            ? "bg-midi-blue font-bold text-white"
                                            : "text-white/85 hover:bg-white/10"
                                    }`}
                                >
                                    {cell.day}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}