"use client";

import Image from "next/image";
import { useRef } from "react";
import { lifeAreaImageDefaults, type LifeAreaId } from "@/lib/data";
import { setAreaImage, useMedia } from "@/lib/media";
import { setLifeAreaImageChoice, useApp } from "@/lib/store";
import BottomSheet from "./BottomSheet";
import { OutlineButton } from "./Form";

// Chip colours from Figma (Career Primary/500, Health Pink/500, Family Blue/500,
// Personal Development Yellow/500); areas reusing one of those images reuse its colour.
const chipColour: Record<string, string> = {
  "/images/life-areas/career.png": "bg-primary-500",
  "/images/life-areas/health.png": "bg-pink-500",
  "/images/life-areas/family.png": "bg-blue-500",
  "/images/life-areas/personal-development.png": "bg-yellow-500",
};

/** The picture an area shows: an uploaded one (this session only) or its default. */
export function useAreaImage(id: LifeAreaId) {
  const media = useMedia();
  const { settings } = useApp();
  const uploaded = settings.lifeAreaImages[id] === "custom" ? media.areas[id] : undefined;
  return uploaded ?? lifeAreaImageDefaults[id];
}

function AreaPicture({ id }: { id: LifeAreaId }) {
  const src = useAreaImage(id);
  return src.startsWith("blob:") ? (
    // Uploaded photo held as an object URL, so next/image can't optimise it.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="absolute inset-0 size-full object-cover" />
  ) : (
    <Image src={src} alt="" fill sizes="353px" className="object-cover" />
  );
}

// Figma image card: 150px tall, 24px radius, name chip bottom-left, edit control top-right.
export function LifeAreaCard({ id, name, onOpen }: { id: LifeAreaId; name: string; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Change the ${name} picture`}
      className="relative h-area-card w-full shrink-0 overflow-hidden rounded-24"
    >
      <AreaPicture id={id} />
      <span
        className={`absolute bottom-16 left-16 whitespace-nowrap rounded-pill px-12 py-4 text-body text-white ${
          chipColour[lifeAreaImageDefaults[id]]
        }`}
      >
        {name}
      </span>
      <span className="absolute right-16 top-16 flex rounded-pill bg-background p-8">
        <Image src="/icons/edit-2.svg" alt="" width={12} height={12} />
      </span>
    </button>
  );
}

export function LifeAreaImageSheet({ id, name, onClose }: { id: LifeAreaId; name: string; onClose: () => void }) {
  const fileInput = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAreaImage(id, URL.createObjectURL(file));
    // Only the choice is saved to localStorage; the uploaded image does not persist in this prototype.
    setLifeAreaImageChoice(id, "custom");
    e.target.value = "";
  }

  function reset() {
    setAreaImage(id, null);
    setLifeAreaImageChoice(id, "default");
  }

  return (
    <BottomSheet title={`${name} image`} onClose={onClose}>
      <div className="relative h-area-card w-full overflow-hidden rounded-24">
        <AreaPicture id={id} />
      </div>
      <div className="flex gap-12">
        <OutlineButton icon="/icons/upload.svg" label="Upload Photo" onClick={() => fileInput.current?.click()} />
        <OutlineButton icon="/icons/refresh-cw.svg" label="Reset to default" onClick={reset} />
      </div>
      <input ref={fileInput} type="file" accept="image/*" hidden onChange={handleFile} />
    </BottomSheet>
  );
}
