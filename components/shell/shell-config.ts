// Which shell controls each route shows. Figma has three header layouts
// (back + search, back only, search only) and four bottom-nav states
// (Home, Journey or Companion active, or none active).

export type NavItem = "home" | "foundation" | "journey" | "companion";

export type ShellConfig = {
  header: { back: boolean; search: boolean; title?: string; backHref?: string } | null;
  nav: { active: NavItem | null } | null;
  fullBleed?: boolean; // content fills the frame and the nav floats over it (no bottom spacer)
};

const routes: Record<string, ShellConfig> = {
  // The Homepage draws its own header on top of its illustration.
  "/": { header: null, nav: { active: "home" }, fullBleed: true },
  "/login": { header: null, nav: null },
  "/signup": { header: null, nav: null },
  "/forgot-password": { header: null, nav: null },
  "/reset-password": { header: null, nav: null },
  // CIF screens have no app header or bottom nav in Figma.
  "/cif": { header: null, nav: null },
  "/cif/thanks": { header: null, nav: null },
  "/cif/agreement": { header: null, nav: null },
  // Life Purpose screens draw their own header, and the bottom nav only where Figma has it.
  "/life-purpose": { header: null, nav: null },
  "/life-purpose/stories": { header: null, nav: null },
  "/life-purpose/clustering": { header: null, nav: null },
  "/life-purpose/naming": { header: null, nav: null },
  "/life-purpose/power-words": { header: null, nav: null },
  "/life-purpose/write": { header: null, nav: null },
  "/life-purpose/final": { header: null, nav: null, fullBleed: true },
  "/life-purpose/stories-view": { header: null, nav: null, fullBleed: true },
  "/book-call": { header: null, nav: null },
  "/settings": {
    header: { back: true, search: true, title: "Settings", backHref: "/" },
    nav: { active: null },
  },
  "/settings/personal": {
    header: { back: true, search: false, title: "Personal Details", backHref: "/settings" },
    nav: { active: null },
  },
  "/settings/life-area-images": {
    header: { back: true, search: false, title: "Life Area Images", backHref: "/settings" },
    nav: { active: null },
  },
};

const fallback: ShellConfig = {
  header: { back: true, search: false },
  nav: { active: null },
};

export function getShellConfig(pathname: string): ShellConfig {
  return routes[pathname] ?? fallback;
}
