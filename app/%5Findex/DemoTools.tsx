"use client";

import { clearLifePurpose, loadSampleLifePurpose, useApp } from "@/lib/store";

// Internal demo controls (not part of the product): Life Purpose starts empty for real
// clients, so these load Meera's sample to preview the draft and final screens.
export default function DemoTools() {
  const { lifePurpose } = useApp();
  return (
    <section>
      <h2>Life Purpose demo data</h2>
      <p>Now: {lifePurpose.status} · {lifePurpose.stories.length} stories</p>
      <p>
        <button type="button" className="underline" onClick={() => loadSampleLifePurpose("draft")}>
          Load Meera&apos;s sample as a draft
        </button>
        {" · "}
        <button type="button" className="underline" onClick={() => loadSampleLifePurpose("final")}>
          Load as final
        </button>
        {" · "}
        <button type="button" className="underline" onClick={clearLifePurpose}>
          Clear (empty state)
        </button>
      </p>
    </section>
  );
}
