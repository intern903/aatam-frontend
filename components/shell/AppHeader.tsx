"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

// Figma "Frame 366": 329 × 40 at (32, 70); 40px white pill buttons, 24px icons,
// optional H3 title between them (Settings screens).
export default function AppHeader({
  back,
  search,
  title,
  backHref,
}: {
  back: boolean;
  search: boolean;
  title?: string;
  backHref?: string; // fixed destination; without it, back goes to the previous page
}) {
  const router = useRouter();

  return (
    <header
      className={`mx-auto flex h-icon-button w-content items-center ${
        back || title ? "justify-between" : "justify-end"
      }`}
    >
      {back && (
        <button
          type="button"
          aria-label="Back"
          onClick={() => (backHref ? router.push(backHref) : router.back())}
          className="flex size-icon-button items-center justify-center rounded-pill bg-white"
        >
          <Image src="/icons/arrow-left.svg" alt="" width={24} height={24} />
        </button>
      )}
      {title && <h1 className="whitespace-nowrap font-heading text-h3 text-black">{title}</h1>}
      {search ? (
        <button
          type="button"
          aria-label="Search"
          className="flex size-icon-button items-center justify-center rounded-pill bg-white"
        >
          <Image src="/icons/search.svg" alt="" width={24} height={24} />
        </button>
      ) : (
        // Empty 40px slot, as in Figma, so the title stays centred
        title && <span aria-hidden className="size-icon-button" />
      )}
    </header>
  );
}
