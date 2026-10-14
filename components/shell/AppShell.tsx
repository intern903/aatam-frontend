"use client";

import { usePathname } from "next/navigation";
import { INDEX_PATH } from "@/lib/screens";
import AppHeader from "./AppHeader";
import AuthGuard from "./AuthGuard";
import BottomNav from "./BottomNav";
import IndexButton from "./IndexButton";
import { getShellConfig } from "./shell-config";

// Holds every screen at the 393px design width, centred on wider viewports.
// The header scrolls with the content; the bottom nav is fixed (as in Figma).
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { header, nav } = getShellConfig(pathname);

  // The internal screen index sits outside the product shell.
  if (pathname === INDEX_PATH) return <AuthGuard>{children}</AuthGuard>;

  return (
    <AuthGuard>
      <div
        className={`relative mx-auto min-h-screen w-full max-w-frame bg-background ${
          nav ? "pb-nav-clearance" : ""
        }`}
      >
        {header && (
          <div className="pt-header-top">
            <AppHeader back={header.back} search={header.search} />
          </div>
        )}
        {children}
        {nav && <BottomNav active={nav.active} />}
        <IndexButton />
      </div>
    </AuthGuard>
  );
}
