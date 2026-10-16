"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { StatementText } from "@/components/life-purpose/ui";
import { LifeAreaCard } from "@/components/settings/LifeAreaImage";
import type { LifeAreaId, Vision } from "@/lib/data";
import { useApp } from "@/lib/store";
import { areaColour, areaName } from "@/lib/visions";

// Building blocks for the Vision screens (Figma "Vision - Flow Screen 1–12", "Vision - Final Screen").

/**
 * The Life Purpose card at the top of every Vision screen: 329 × 244, the sky photo, "My Life
 * Purpose" (H3) and the client's statement in the glass panel. Tapping it opens the final screen.
 */
export function PurposeBanner() {
  const { lifePurpose: lp } = useApp();
  return (
    <Link
      href="/life-purpose/final"
      aria-label="My Life Purpose"
      className="relative block h-purpose-banner w-content shrink-0 overflow-hidden rounded-24 shadow-image"
    >
      <Image src="/images/life-purpose/purpose-sky.png" alt="" fill sizes="329px" className="object-cover object-[50%_20%]" />
      <div className="absolute inset-x-16 top-16">
        <p className="font-heading text-h3 text-white">My Life Purpose</p>
        <p className="mt-4 text-caption text-white">The thread through every moment when I’m most alive</p>
      </div>
      {/* Figma places the panel at y 87; anchored to the bottom so longer statements still fit. */}
      <div className="absolute inset-x-16 bottom-16 rounded-12 bg-white/10 p-16 backdrop-blur-[2px]">
        {lp.statement.trim() ? (
          <StatementText statement={lp.statement} />
        ) : (
          <p className="text-body text-white">Your life purpose will appear here once you have written it.</p>
        )}
      </div>
    </Link>
  );
}

/** Cancel (outline) · area name (H3) · Save (Primary/600) — the row above each Vision step. */
export function FlowHeader({
  title,
  onCancel,
  onSave,
  saveDisabled,
}: {
  title: string;
  onCancel: () => void;
  onSave: () => void;
  saveDisabled?: boolean;
}) {
  return (
    <div className="flex w-full items-center justify-between">
      <button type="button" onClick={onCancel} className="rounded-8 border border-background-700 px-12 py-8 text-button-cta text-background-700">
        Cancel
      </button>
      <h1 className="font-heading text-h3 text-black">{title}</h1>
      <button
        type="button"
        onClick={onSave}
        disabled={saveDisabled}
        className="rounded-8 bg-primary-600 px-12 py-8 text-button-cta text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        Save
      </button>
    </div>
  );
}

/** Two equal buttons side by side (Vision - Flow Screen 6: "Feels True" grey, "Go Deeper" green). */
export function SplitButtons({ children }: { children: React.ReactNode }) {
  return <div className="flex w-full gap-8">{children}</div>;
}
export function GreyButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-1 items-center justify-center rounded-8 bg-cancel py-16 text-button-cta text-cancel-text disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}
export function GreenButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-1 items-center justify-center rounded-8 bg-primary-600 py-16 text-button-cta text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

/**
 * An area with a vision (Vision - Flow Screen 11 / Final Screen): the wide LifeAreaCard. Tap the
 * photo to turn it over and read the vision; the arrow opens the area to edit it.
 */
export function VisionCard({ vision, onArrow }: { vision: Vision; onArrow: () => void }) {
  const [flipped, setFlipped] = useState(false);
  const id = vision.lifeArea;
  const name = areaName(id);
  return (
    <div className="h-area-card w-full [perspective:1000px]">
      <div
        className="relative size-full transition-transform duration-500 [transform-style:preserve-3d]"
        style={{ transform: flipped ? "rotateY(180deg)" : undefined }}
      >
        <div className="absolute inset-0 [backface-visibility:hidden]">
          <LifeAreaCard id={id} name={name} variant="vision" onOpen={() => setFlipped(true)} onArrow={onArrow} />
        </div>
        <VisionBack id={id} vision={vision} onClose={() => setFlipped(false)} />
      </div>
    </div>
  );
}

function VisionBack({ id, vision, onClose }: { id: LifeAreaId; vision: Vision; onClose: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col gap-12 overflow-y-auto rounded-24 bg-white p-16 [backface-visibility:hidden] [transform:rotateY(180deg)]">
      <div className="flex items-center justify-between">
        <span className={`rounded-pill px-8 text-caption text-white ${areaColour(id).solid}`}>{areaName(id)}</span>
        <button type="button" aria-label="Close" onClick={onClose} className="flex size-icon items-center justify-center">
          <Image src="/icons/x.svg" alt="" width={20} height={20} />
        </button>
      </div>
      <p className="text-body text-black">{vision.statement}</p>
    </div>
  );
}
