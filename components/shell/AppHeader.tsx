"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

// Figma "Frame 366": 329 × 40 at (32, 70); 40px white pill buttons, 24px icons.
export default function AppHeader({
  back,
  search,
}: {
  back: boolean;
  search: boolean;
}) {
  const router = useRouter();

  return (
    <header
      className={`mx-auto flex h-icon-button w-content items-center ${
        back ? "justify-between" : "justify-end"
      }`}
    >
      {back && (
        <button
          type="button"
          aria-label="Back"
          onClick={() => router.back()}
          className="flex size-icon-button items-center justify-center rounded-pill bg-white"
        >
          <Image src="/icons/arrow-left.svg" alt="" width={24} height={24} />
        </button>
      )}
      {search && (
        <button
          type="button"
          aria-label="Search"
          className="flex size-icon-button items-center justify-center rounded-pill bg-white"
        >
          <Image src="/icons/search.svg" alt="" width={24} height={24} />
        </button>
      )}
    </header>
  );
}
