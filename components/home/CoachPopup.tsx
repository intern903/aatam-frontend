"use client";

import { useEffect } from "react";

// Shown when a not-started module is tapped. Not in Figma: it reuses the
// design's Check Mail card (cream, 16px radius, 40px padding, Body Large).
// Tap anywhere or press Escape to close.
export default function CoachPopup({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Not open yet"
      onClick={onClose}
      className="absolute inset-0 z-20 flex items-center justify-center"
    >
      <div className="flex w-content items-center justify-center rounded-16 bg-background p-check-mail">
        <p className="text-center text-body-large text-black">
          Your coach will open this when you are ready.
        </p>
      </div>
    </div>
  );
}
