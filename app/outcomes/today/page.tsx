"use client";

import Image from "next/image";
import Link from "next/link";
import { DotTags, OutOfTen, PurposeGoals, ScoreBoxes, SectionHead } from "@/components/engine/ui";
import { PrimaryButton } from "@/components/life-purpose/ui";
import { useHydrated } from "@/components/values/ui";
import type { Outcome, Period } from "@/lib/data";
import { openCompanion } from "@/lib/companion";
import { addDays, byPriority, dateOf, isoDate, periodDays, today } from "@/lib/outcomes";
import { setOutcomeScore, toggleTick, useApp } from "@/lib/store";
import { areaColour, areaName } from "@/lib/visions";

// Figma "RG - Today": the tab My Journey opens on. "My Game · N days left" leads to the current
// period; My Life Codes leads to the list; then today's tracking for the outcomes the client
// chose to track. A Doing outcome is ticked once a day, and its bar has one part per day of the
// period, filled for the days ticked (never marked against the others). A Being outcome is
// scored out of 10. Ticking one opens the companion with "I just completed: …".

export default function TodayPage() {
  const hydrated = useHydrated();
  const { outcomes } = useApp();
  const period = outcomes.period;
  const days = period ? periodDays(period) : null;
  const tracked = byPriority(outcomes.currentPeriod).filter((o) => o.track);
  const todayIso = isoDate(today());

  return (
    <main className="flex flex-col gap-20 px-32 pb-40">
      <div className="flex justify-end pt-[82px]">
        <Link href="/outcomes/period" className="flex items-center gap-4 rounded-24 bg-white px-16 py-8 text-body-medium text-black">
          My Game
          {days && (
            <>
              <span className="size-2 rounded-2 bg-ink-60" />
              {days.left > 0 ? `${days.left} day${days.left === 1 ? "" : "s"} left` : "Ready to close"}
            </>
          )}
          <Image src="/icons/chevron-right-20.svg" alt="" width={20} height={20} />
        </Link>
      </div>
      <div className="-mt-4">
        <PurposeGoals />
      </div>

      <Link href="/life-code" className="relative flex items-center justify-end gap-4 overflow-hidden rounded-24 px-16 pb-40 pt-16">
        <Image src="/images/engine/life-codes-banner.jpg" alt="" fill sizes="329px" className="object-cover object-[50%_45%]" />
        <span className="relative font-heading text-h3 text-black">My Life Codes</span>
        <Image src="/icons/chevron-right-24.svg" alt="" width={24} height={24} className="relative" />
      </Link>

      <div className="flex flex-col gap-16">
        <SectionHead title="My Today’s Outcomes Tracking" />
        {!hydrated ? null : !period ? (
          <div className="flex flex-col gap-12 rounded-24 bg-white px-16 py-12">
            <p className="text-body-small text-black">No period yet. Set one up to start tracking.</p>
            <PrimaryButton href="/outcomes/period">Go to My Current Period</PrimaryButton>
          </div>
        ) : tracked.length === 0 ? (
          <p className="text-body-small text-ink-60">
            Nothing to track today. Outcomes you choose to track when you set up a period show here.
          </p>
        ) : (
          <div className="flex flex-col gap-8">
            {tracked.map((o) =>
              o.type === "Doing" ? (
                <DoingRow key={o.id} outcome={o} period={period} today={todayIso} />
              ) : (
                <BeingRow key={o.id} outcome={o} />
              ),
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function Head({ outcome, right }: { outcome: Outcome; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-8">
      <div className="flex flex-col gap-4">
        <p className="text-body text-black">{outcome.text}</p>
        <span className="flex items-center gap-8">
          <span className={`size-8 shrink-0 rounded-4 ${areaColour(outcome.lifeArea).solid}`} />
          <DotTags tags={[areaName(outcome.lifeArea), outcome.type]} />
        </span>
      </div>
      {right}
    </div>
  );
}

function DoingRow({ outcome, period, today: todayIso }: { outcome: Outcome; period: Period; today: string }) {
  const { solid, soft } = areaColour(outcome.lifeArea);
  const ticked = outcome.ticks.includes(todayIso);
  const total = periodDays(period).total;
  const start = dateOf(period.start);
  return (
    <section className="flex flex-col gap-8 rounded-24 bg-white px-16 py-12">
      <Head
        outcome={outcome}
        right={
          <button
            type="button"
            role="checkbox"
            aria-checked={ticked}
            aria-label={`Done today: ${outcome.text}`}
            onClick={() => {
              toggleTick(outcome.id, todayIso);
              // A tick leads straight into the conversation about it.
              if (!ticked) openCompanion("outcomes", `I just completed: ${outcome.text}`);
            }}
            className={`flex h-[32px] w-[33px] shrink-0 items-center justify-center rounded-pill border p-4 ${ticked ? solid : "bg-white"} ${solid.replace("bg-", "border-")}`}
          >
            <Image src="/icons/check-circle-white.svg" alt="" width={24} height={24} />
          </button>
        }
      />
      <div className="flex w-full gap-2" aria-label={`${outcome.ticks.length} of ${total} days ticked`}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`h-4 flex-1 rounded-4 ${outcome.ticks.includes(isoDate(addDays(start, i))) ? solid : soft}`} />
        ))}
      </div>
    </section>
  );
}

function BeingRow({ outcome }: { outcome: Outcome }) {
  const { solid, soft } = areaColour(outcome.lifeArea);
  return (
    <section className="flex flex-col gap-8 rounded-24 bg-white px-16 py-12">
      <Head outcome={outcome} right={<OutOfTen score={outcome.score} />} />
      <ScoreBoxes score={outcome.score} colours={{ on: solid, off: soft }} label={`${outcome.text}, out of 10`} onPick={(n) => setOutcomeScore(outcome.id, n)} />
    </section>
  );
}
