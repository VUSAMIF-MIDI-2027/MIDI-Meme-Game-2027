import Image from "next/image";
import { Check, MousePointer2 } from "lucide-react";
import type { Lang } from "@/context/LanguageContext";
import { demoPhotos, type DemoPhoto } from "./demoPhotos";
import { howItWorksText } from "./howItWorksText";

type PhotoPickerProps = {
    selectedPhoto: DemoPhoto;
    onSelect: (photo: DemoPhoto) => void;
    lang: Lang;
};

export default function PhotoPicker({ selectedPhoto, onSelect, lang }: PhotoPickerProps) {
    const t = howItWorksText[lang];

    return (
        <div className="flex aspect-[4/3] flex-col gap-2 rounded-xl border border-white/20 bg-[#0a0a0a] p-2">
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-md">
                <Image
                    src={selectedPhoto.image}
                    alt={selectedPhoto.text[lang].alt}
                    fill
                    loading="eager"
                    sizes="(min-width: 768px) 360px, 90vw"
                    className="object-contain"
                />
            </div>
            <p className="flex shrink-0 items-center justify-center gap-2 text-xs font-semibold text-white">
                <MousePointer2 aria-hidden="true" className="size-3.5 text-midi-blue" />
                {t.choosePhotoHint}
            </p>
            <div className="grid shrink-0 grid-cols-4 gap-2" role="group" aria-label={t.choosePhotoHint}>
                {demoPhotos.map((photo) => {
                    const isSelected = selectedPhoto.id === photo.id;
                    const selectionStyle = isSelected
                        ? "border-midi-blue ring-1 ring-midi-blue"
                        : "border-white/30 hover:border-white";

                    return (
                        <button
                            key={photo.id}
                            type="button"
                            aria-label={photo.text[lang].alt}
                            aria-pressed={isSelected}
                            onClick={() => onSelect(photo)}
                            className={`relative aspect-[2/1] cursor-pointer overflow-hidden rounded-md border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midi-blue ${selectionStyle}`}
                        >
                            <Image
                                src={photo.image}
                                alt=""
                                fill
                                loading="eager"
                                sizes="140px"
                                className="object-cover"
                            />
                            {isSelected && (
                                <span className="absolute right-1 bottom-1 rounded-full bg-midi-blue p-1 text-white">
                                    <Check aria-hidden="true" className="size-3" />
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
