// Every screen in the app, in flow order. Drives the internal /_index page.
// Placeholders for now: one entry per module, to be split into steps as screens are built.

export type Screen = {
  module: string;
  step: number;
  title: string;
  path: string;
  built: boolean;
};

export const INDEX_PATH = "/_index";

export const screens: Screen[] = [
  { module: "Auth", step: 1, title: "Login", path: "/login", built: true },
  { module: "Auth", step: 2, title: "Sign up", path: "/signup", built: true },
  { module: "Auth", step: 3, title: "Forgot Password + Check Mail", path: "/forgot-password", built: true },
  { module: "Auth", step: 4, title: "Reset Password", path: "/reset-password?email=meera.krishnan%40example.com", built: true },
  { module: "Home", step: 1, title: "Home", path: "/", built: false },
  { module: "CIF", step: 1, title: "CIF", path: "/cif", built: false },
  { module: "Life Purpose", step: 1, title: "Life Purpose", path: "/life-purpose", built: false },
  { module: "Visions", step: 1, title: "Visions", path: "/visions", built: false },
  { module: "Values", step: 1, title: "Values", path: "/values", built: false },
  { module: "Qualities", step: 1, title: "Qualities", path: "/qualities", built: false },
  { module: "My Outcomes", step: 1, title: "My Outcomes", path: "/my-outcomes", built: false },
  { module: "My Well-Being", step: 1, title: "My Well-Being", path: "/my-well-being", built: false },
  { module: "My Life Code", step: 1, title: "My Life Code", path: "/my-life-code", built: false },
  { module: "Profile", step: 1, title: "Profile", path: "/profile", built: false },
];
