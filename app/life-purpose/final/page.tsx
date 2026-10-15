"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import PopUpSheet from "@/components/PopUpSheet";
import { LpHeader, MapNode, StatementGlass } from "@/components/life-purpose/ui";
import { useSwipe } from "@/components/life-purpose/useSwipe";
import BottomNav from "@/components/shell/BottomNav";
import { clusterColour, storiesForCluster } from "@/lib/lifePurpose";
import { useApp } from "@/lib/store";

// Figma "LP - Final State" — the screen the nav's "My Foundation" opens.
// No scrolling: swipe right (or →) for the stories gallery, swipe left (or ←) for Visions.
// Positions are the Figma frame's; anything past the screen's height is cut off, as in the frame.
// Life Purpose flow, step 23: each power word in the statement wears its cluster's colour; tapping
// it opens the phrases in that cluster and the stories they came from.
export default function FinalPage() {
  const router = useRouter();
  const { lifePurpose: lp } = useApp();
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (lp.status !== "final") router.replace("/life-purpose");
  }, [lp.status, router]);

  const toStories = useCallback(() => router.push("/life-purpose/stories-view"), [router]);
  const toVisions = useCallback(() => router.push("/visions"), [router]);
  const swipe = useSwipe({ onSwipeRight: toStories, onSwipeLeft: toVisions });

  if (lp.status !== "final") return null;

  return (
    <main {...swipe} className="relative h-[100dvh] w-full touch-pan-y overflow-hidden">
      <div className="absolute inset-x-32 top-0">
        <LpHeader search />
      </div>

      {/* My Life Stories */}
      <Image src="/images/life-purpose/connector-final-top.svg" alt="" width={111} height={84} className="absolute left-0 top-[164px] -scale-y-100" />
      <div className="absolute left-32 top-[130px]">
        <MapNode href="/life-purpose/stories-view" icon="/icons/book-open-green.svg" label="My Life Stories" />
      </div>
      <p className="absolute left-[108px] top-[135px] font-heading text-h4 text-black">My Life Stories</p>
      <p className="absolute left-[108px] top-[161px] w-[155px] text-caption text-ink-50">Situations from where you get through your life</p>

      {lp.bodyFeel && (
        <div className="absolute left-32 top-[222px] flex w-content items-center justify-center gap-12 rounded-pill bg-primary-600 px-12 py-8">
          <span className="size-12 rounded-pill bg-white" />
          <span className="text-body-medium text-white">I feel this most in my {lp.bodyFeel}.</span>
        </div>
      )}

      {/* The statement on its photo */}
      <div className="absolute left-32 top-[285px] h-purpose-card w-content overflow-hidden rounded-24 shadow-image">
        <Image src="/images/life-purpose/purpose-sky.png" alt="" fill sizes="329px" className="object-cover object-[50%_20%]" />
        <div className="absolute inset-x-16 top-16">
          <h1 className="font-heading text-h1 text-white">My Life Purpose</h1>
          <p className="mt-4 text-caption text-white">The thread through every moment when I’m most alive</p>
        </div>
        {/* Figma places this at y 173; anchored to the bottom so longer statements still fit. */}
        <div className="absolute inset-x-16 bottom-16">
          <StatementGlass statement={lp.statement} powerWords={lp.clusters.map((c) => c.name)} onWord={setOpen} />
        </div>
      </div>
      {/* Not on the Figma frame (it appeared on an earlier version): the swipe hint. */}
      <p className="absolute inset-x-0 top-[622px] text-center text-caption text-ink-50">Swipe right for stories, left for visions</p>

      {/* My Visions / My Values & Qualities, joined by the dashed path */}
      <Image src="/images/life-purpose/connector-final-bottom.svg" alt="" width={229} height={261} className="absolute left-[72px] top-[604px]" />
      <div className="absolute left-[64px] top-[655px]">
        <MapNode href="/visions" icon="/icons/eye-green.svg" label="My Visions" />
      </div>
      <p className="absolute right-[233px] top-[731px] whitespace-nowrap font-heading text-h4 text-black">My Visions</p>
      <p className="absolute left-[64px] top-[757px] w-[154px] text-caption text-ink-50">My Life Purpose, expressed in each area of my life</p>
      <div className="absolute right-[64px] top-[828px]">
        <MapNode href="/values" icon="/icons/star-green.svg" label="My Values & Qualities" />
      </div>

      <BottomNav active="foundation" />

      {open !== null && lp.clusters[open] && (
        <PopUpSheet title={lp.clusters[open].name} radius="md" onClose={() => setOpen(null)}>
          <div className="flex flex-wrap gap-8">
            {lp.clusters[open].words.map((w) => (
              <span key={w} className={`rounded-pill px-12 py-4 text-body-small text-white ${clusterColour(open).solid}`}>
                {w}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-8">
            <p className="text-body-medium text-black">From your stories</p>
            {storiesForCluster(lp.stories, lp.clusters[open].words).map((st) => (
              <p key={st.id} className="text-body-small text-black">
                {st.title}
              </p>
            ))}
          </div>
        </PopUpSheet>
      )}
    </main>
  );
}
