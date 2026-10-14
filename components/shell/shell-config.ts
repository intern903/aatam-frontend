// Which shell controls each route shows. Figma has three header layouts
// (back + search, back only, search only) and four bottom-nav states
// (Home, Journey or Companion active, or none active).

export type NavItem = "home" | "journey" | "companion";

export type ShellConfig = {
  header: { back: boolean; search: boolean } | null;
  nav: { active: NavItem | null } | null;
};

const routes: Record<string, ShellConfig> = {
  // The Homepage has its own header on top of its hero image, built with that screen.
  "/": { header: null, nav: { active: "home" } },
  "/login": { header: null, nav: null },
  "/signup": { header: null, nav: null },
  "/forgot-password": { header: null, nav: null },
  "/reset-password": { header: null, nav: null },
};

const fallback: ShellConfig = {
  header: { back: true, search: false },
  nav: { active: null },
};

export function getShellConfig(pathname: string): ShellConfig {
  return routes[pathname] ?? fallback;
}
