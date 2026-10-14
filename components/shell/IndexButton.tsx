import Link from "next/link";
import { INDEX_PATH } from "@/lib/screens";

// Demo helper, not in the design: jumps to the internal screen index.
// Sits top-right in the empty strip above the header (where the iOS status bar is in Figma),
// pinned to the frame so it stays reachable while scrolling.
export default function IndexButton() {
  return (
    <div className="pointer-events-none fixed left-1/2 top-0 z-20 flex w-full max-w-frame -translate-x-1/2 justify-end p-8">
      <Link
        href={INDEX_PATH}
        className="pointer-events-auto rounded-pill px-8 text-caption text-ink-25"
      >
        Screens
      </Link>
    </div>
  );
}
