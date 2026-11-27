"use client";

import { useEffect, useRef, useState, type PointerEvent, type RefObject } from "react";
import { ImageUp, Loader2, Upload } from "lucide-react";
import { UPLOAD_LIMITS } from "@/lib/admin/api";
import { ErrorNotice, type ErrorScope } from "@/components/ErrorNotice";
import type { photosText } from "./photosText";

type PhotosStrings = (typeof photosText)["en"];

export type NoticeState =
    | { type: "success" | "error"; text: string }
    | { type: "apiError"; error: unknown; scope: ErrorScope }
    | null;

type PhotoUploadSectionProps = {
    t: PhotosStrings;
    inputRef: RefObject<HTMLInputElement | null>;
    file: File | null;
    preview: string | null;
    progress: number | null;
    notice: NoticeState;
    onPick: (file: File | null) => void;
    onUpload: (file: File) => Promise<void>;
};

const ASPECT_RATIO = 4 / 3;
const CENTER = { zoom: 1, x: 0.5, y: 0.5 };
type Crop = typeof CENTER;

function getCrop(image: HTMLImageElement, crop: Crop) {
    const width = Math.min(image.naturalWidth, image.naturalHeight * ASPECT_RATIO) / crop.zoom;
    const height = width / ASPECT_RATIO;
    return {
        width,
        height,
        x: (image.naturalWidth - width) * crop.x,
        y: (image.naturalHeight - height) * crop.y,
    };
}

function drawCrop(canvas: HTMLCanvasElement, image: HTMLImageElement, crop: Crop) {
    const context = canvas.getContext("2d");
    if (!context) return false;

    const { x, y, width, height } = getCrop(image, crop);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.imageSmoothingQuality = "high";
    context.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height);
    return true;
}

async function exportCrop(image: HTMLImageElement, crop: Crop, original: File) {
    const canvas = document.createElement("canvas");
    const cropWidth = getCrop(image, crop).width;
    const name = original.name.replace(/\.[^.]+$/, "");

    for (const maxWidth of [2400, 1600, 1200]) {
        canvas.width = Math.max(4, Math.floor(Math.min(cropWidth, maxWidth) / 4) * 4);
        canvas.height = canvas.width * 3 / 4;
        if (!drawCrop(canvas, image, crop)) return null;

        for (const quality of [0.9, 0.78, 0.64]) {
            const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
            if (blob && blob.size > 0 && blob.size <= UPLOAD_LIMITS.maxBytes) {
                const extension = blob.type === "image/webp" ? "webp" : "png";
                return new File([blob], name + "." + extension, { type: blob.type });
            }
        }
    }

    return null;
}

export function PhotoUploadSection({
    t,
    inputRef,
    file,
    preview,
    progress,
    notice,
    onPick,
    onUpload,
}: PhotoUploadSectionProps) {
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [crop, setCrop] = useState(CENTER);
    const [error, setError] = useState<string | null>(null);
    const [preparing, setPreparing] = useState(false);
    const editor = useRef<HTMLCanvasElement>(null);
    const livePreview = useRef<HTMLCanvasElement>(null);
    const drag = useRef<{ pointer: number; x: number; y: number } | null>(null);
    const uploading = progress !== null;
    const busy = uploading || preparing;

    useEffect(() => {
        if (!preview) return;

        let active = true;
        const source = new window.Image();
        source.onload = () => {
            if (active) setImage(source);
        };
        source.onerror = () => {
            if (active) setError(t.decodeError);
        };
        source.src = preview;
        return () => {
            active = false;
        };
    }, [preview, t.decodeError]);

    useEffect(() => {
        if (!image || !editor.current || !livePreview.current) return;
        drawCrop(editor.current, image, crop);
        drawCrop(livePreview.current, image, crop);
    }, [image, crop]);

    function movePhoto(event: PointerEvent<HTMLCanvasElement>) {
        const pointer = drag.current;
        if (!image || busy || pointer?.pointer !== event.pointerId) return;

        const bounds = event.currentTarget.getBoundingClientRect();
        const dx = (event.clientX - pointer.x) / bounds.width;
        const dy = (event.clientY - pointer.y) / bounds.height;
        drag.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY };

        setCrop((current) => {
            const { width, height } = getCrop(image, current);
            const availableX = image.naturalWidth - width;
            const availableY = image.naturalHeight - height;
            return {
                ...current,
                x: availableX > 0 ? Math.max(0, Math.min(1, current.x - dx * width / availableX)) : current.x,
                y: availableY > 0 ? Math.max(0, Math.min(1, current.y - dy * height / availableY)) : current.y,
            };
        });
    }

    async function submit() {
        if (!file || !image || busy) return;

        setPreparing(true);
        setError(null);
        try {
            const output = await exportCrop(image, crop, file);
            if (!output) {
                setError(t.tooBig);
                return;
            }
            await onUpload(output);
        } catch {
            setError(t.prepareError);
        } finally {
            setPreparing(false);
        }
    }

    const frame = image ? getCrop(image, crop) : null;

    return (
        <section className="rounded-xl border-2 border-dashed border-white/20 bg-[#0d1013] p-5 sm:p-6">
            <div className="flex items-center gap-3">
                <ImageUp className="size-6 shrink-0 text-midi-blue" aria-hidden="true" />
                <div>
                    <h2 className="text-xl font-bold">{t.uploadTitle}</h2>
                    <p className="mt-1 text-sm text-white/55">
                        {t.formats(UPLOAD_LIMITS.labels, UPLOAD_LIMITS.maxBytes / 1024 / 1024)}
                    </p>
                </div>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept={UPLOAD_LIMITS.types.join(",")}
                disabled={busy}
                onChange={(event) => onPick(event.target.files?.[0] ?? null)}
                aria-label={t.chooseLabel}
                className="mt-4 block w-full rounded-lg border border-white/15 bg-[#0b0f12] p-2 text-sm text-white/70 file:mr-4 file:min-h-10 file:cursor-pointer file:rounded-md file:border-0 file:bg-white/15 file:px-4 file:font-semibold file:text-white"
            />

            {file && <p className="mt-2 break-all text-sm text-white/70">{file.name}</p>}

            {preview && !image && !error && (
                <p role="status" className="mt-4 text-sm text-white/60">{t.loadingImage}</p>
            )}

            {image && frame && (
                <div className="mt-5 space-y-5">
                    <div>
                        <h3 className="font-semibold">{t.cropTitle}</h3>
                        <p className="mt-1 text-sm text-white/60">{t.cropHint}</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                        <div className="relative max-w-xl self-start overflow-hidden rounded-lg border border-white/20 bg-neutral-900">
                            <canvas
                                ref={editor}
                                width={640}
                                height={480}
                                aria-hidden="true"
                                className="block aspect-[4/3] w-full touch-none cursor-grab active:cursor-grabbing"
                                onPointerDown={(event) => {
                                    if (busy || !event.isPrimary || event.button !== 0) return;
                                    event.currentTarget.setPointerCapture(event.pointerId);
                                    drag.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY };
                                }}
                                onPointerMove={movePhoto}
                                onLostPointerCapture={() => { drag.current = null; }}
                            />
                            <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                                {Array.from({ length: 9 }, (_, index) => (
                                    <span key={index} className="border border-white/20" />
                                ))}
                            </div>
                        </div>

                        <fieldset disabled={busy} className="space-y-4 rounded-lg border border-white/10 bg-black/20 p-4">
                            <label className="block space-y-1 text-sm">
                                <span>{t.zoom} · {Math.round(crop.zoom * 100)}%</span>
                                <input className="block w-full accent-midi-blue" type="range" min={1} max={4} step={0.01} value={crop.zoom}
                                    onChange={(event) => setCrop({ ...crop, zoom: event.target.valueAsNumber })} />
                            </label>
                            <label className="block space-y-1 text-sm">
                                <span>{t.horizontal}</span>
                                <input className="block w-full accent-midi-blue" type="range" min={0} max={1} step={0.01} value={crop.x}
                                    disabled={image.naturalWidth - frame.width < 1}
                                    onChange={(event) => setCrop({ ...crop, x: event.target.valueAsNumber })} />
                            </label>
                            <label className="block space-y-1 text-sm">
                                <span>{t.vertical}</span>
                                <input className="block w-full accent-midi-blue" type="range" min={0} max={1} step={0.01} value={crop.y}
                                    disabled={image.naturalHeight - frame.height < 1}
                                    onChange={(event) => setCrop({ ...crop, y: event.target.valueAsNumber })} />
                            </label>
                            <button type="button" onClick={() => setCrop(CENTER)}
                                className="min-h-10 rounded-md border border-white/20 px-3 text-sm hover:bg-white/10">
                                {t.resetCrop}
                            </button>
                        </fieldset>
                    </div>
                    <figure className="max-w-xs">
                        <figcaption className="mb-2 font-semibold">{t.previewTitle}</figcaption>
                        <canvas ref={livePreview} width={320} height={240} role="img" aria-label={t.previewAlt}
                            className="block aspect-[4/3] w-full rounded-lg border-2 border-white/15 bg-neutral-900" />
                    </figure>
                </div>
            )}

            {uploading && (
                <div
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={t.uploading}
                    className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"
                >
                    <div className="h-full bg-midi-blue transition-[width]" style={{ width: progress + "%" }} />
                </div>
            )}

            <button
                type="button"
                onClick={() => void submit()}
                disabled={!image || busy}
                aria-busy={busy}
                className="mt-4 inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg bg-midi-blue px-5 text-sm font-semibold text-white transition-colors hover:bg-midi-blue/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue disabled:cursor-not-allowed disabled:opacity-50"
            >
                {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Upload className="size-4" aria-hidden="true" />}
                {uploading ? t.uploading + " " + progress + "%" : preparing ? t.preparing : t.uploadButton}
            </button>

            {error && <p role="alert" className="mt-4 text-sm text-red-200">{error}</p>}
            {notice?.type === "apiError" ? (
                <ErrorNotice error={notice.error} scope={notice.scope} />
            ) : notice && (
                <p role={notice.type === "success" ? "status" : "alert"}
                    className={"mt-4 rounded-lg border px-4 py-3 text-sm " + (notice.type === "success"
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                        : "border-red-400/30 bg-red-400/10 text-red-200")}>
                    {notice.text}
                </p>
            )}
        </section>
    );
}
