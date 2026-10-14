import Image from "next/image";
import Link from "next/link";
import type { NavItem } from "./shell-config";

// Figma "BNB-21": 329 × 75 pill, Primary/600, fixed 20px above the bottom of the frame.
// The active item shows its label with an underline; the others show their icon.

const items: { key: NavItem; label: string; icon: string; href?: string }[] = [
  { key: "home", label: "My Home", icon: "/icons/home.svg", href: "/" },
  { key: "journey", label: "My Journey", icon: "/icons/compass.svg", href: "/journey" },
  // Companion will open the CCA chat; no action yet.
  { key: "companion", label: "My Companion", icon: "/icons/companion.svg" },
];

export default function BottomNav({ active }: { active: NavItem | null }) {
  return (
    <nav
      aria-label="Main"
      className="fixed bottom-20 left-1/2 z-10 flex h-nav w-content -translate-x-1/2 items-center justify-center gap-16 rounded-pill bg-primary-600 px-20"
    >
      {items.map((item) =>
        item.key === active ? (
          <div
            key={item.key}
            aria-current="page"
            className="flex shrink-0 flex-col items-center justify-center gap-nav-underline px-nav-item py-20"
          >
            <span className="whitespace-nowrap text-body-medium text-white">
              {item.label}
            </span>
            <Image src="/icons/nav-underline.svg" alt="" width={17} height={2} />
          </div>
        ) : item.href ? (
          <Link
            key={item.key}
            href={item.href}
            aria-label={item.label}
            className="flex shrink-0 items-center justify-center p-nav-item"
          >
            <Image src={item.icon} alt="" width={24} height={24} />
          </Link>
        ) : (
          <button
            key={item.key}
            type="button"
            aria-label={item.label}
            className="flex shrink-0 items-center justify-center p-nav-item"
          >
            {/* Exported with stroke bounds (24px); the logo's own box in Figma is 21.9 × 22. */}
            <Image src={item.icon} alt="" width={24} height={24} className="-m-[1px]" />
          </button>
        ),
      )}
    </nav>
  );
}
