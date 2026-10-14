import Link from "next/link";
import { screens, type Screen } from "@/lib/screens";

// Internal navigation for demos — not part of the product, deliberately plain.
// (Folder is "%5Findex" because Next.js treats "_index" as a private folder.)
export default function ScreenIndex() {
  const modules = new Map<string, Screen[]>();
  for (const screen of screens) {
    modules.set(screen.module, [...(modules.get(screen.module) ?? []), screen]);
  }

  return (
    <main className="p-16">
      <h1>Screens</h1>
      {Array.from(modules, ([module, items]) => (
        <section key={module}>
          <h2>{module}</h2>
          <ul>
            {items
              .sort((a, b) => a.step - b.step)
              .map((screen) => (
                <li key={screen.path}>
                  <Link href={screen.path} className="underline">
                    {screen.step}. {screen.title}
                  </Link>
                  {screen.built && " ✓"}
                </li>
              ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
