"use client";

import { useState } from "react";
import { AreaChips, Chip, ChoiceCard, EngineFrame, EngineTop, FieldLabel } from "@/components/engine/ui";
import { PrimaryButton } from "@/components/life-purpose/ui";
import { FlowHeader, GreenButton, GreyButton, SplitButtons } from "@/components/visions/ui";
import { lifeAreas, type LifeAreaId, type LifeCodeType } from "@/lib/data";
import type { LifeCodeInput } from "@/lib/store";

// Adding a life code: one flow, five steps, one per screen. The same component runs when a life
// code is added by hand (/life-code/new), edited, or captured from the companion chat, so every
// life code lands in the same shape (lib/data.ts LifeCode).
//
//   1. Statement       "What would you tell your future self? Start with 'I'."  → statement
//   2. Read it out loud "How does it feel in your body?" Light and open / Tight  → nothing saved;
//                       Tight goes back to step 1 to reword. It is the client's own confirmation.
//   3. Question 1      Which life areas? "All life areas" first, then the 12      → lifeAreas, allLifeAreas
//   4. Question 2      One situation (Micro) / Many situations (Macro), pre-filled
//                       from step 3: one area suggests Micro, several or all Macro → type
//   5. Question 3      How or when will you use this Life Code?                    → howOrWhenToUse
//
// HARD RULE: the app never writes or tidies a life code. Every word is the client's, saved as typed.

const STEPS = 5;
const ALL = lifeAreas.map((a) => a.id);

export default function LifeCodeFlow({
  title = "New Life Code",
  initial,
  onSave,
  onCancel,
}: {
  title?: string;
  initial?: LifeCodeInput;
  onSave: (input: LifeCodeInput) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(0);
  const [statement, setStatement] = useState(initial?.statement ?? "");
  const [areas, setAreas] = useState<LifeAreaId[]>(initial?.allLifeAreas ? [] : initial?.lifeAreas ?? []);
  const [all, setAll] = useState(initial?.allLifeAreas ?? false);
  const [type, setType] = useState<LifeCodeType | null>(initial?.type ?? null);
  const [typeChosen, setTypeChosen] = useState(!!initial); // once the client picks, step 3 stops suggesting
  const [how, setHow] = useState(initial?.howOrWhenToUse ?? "");

  const hasAreas = all || areas.length > 0;
  const complete = statement.trim().length > 0 && hasAreas && type !== null;
  const input = (): LifeCodeInput => ({
    statement: statement.trim(),
    lifeAreas: all ? ALL : areas,
    allLifeAreas: all,
    type: type ?? "micro",
    howOrWhenToUse: how.trim(),
  });
  const save = () => complete && onSave(input());

  function toQuestion2() {
    // Pre-fill from Question 1 until the client chooses for themselves.
    if (!typeChosen) setType(all || areas.length > 1 ? "macro" : "micro");
    setStep(3);
  }

  return (
    <EngineFrame top={<EngineTop onBack={step > 0 ? () => setStep(step - 1) : onCancel} />}>
      <div className="flex flex-col gap-12">
        <FlowHeader title={title} onCancel={onCancel} onSave={save} saveDisabled={!complete} />
        <div className="flex w-full gap-4" aria-label={`Step ${step + 1} of ${STEPS}`}>
          {Array.from({ length: STEPS }, (_, i) => (
            <span key={i} className={`h-4 flex-1 rounded-pill ${i <= step ? "bg-black" : "bg-ink-25"}`} />
          ))}
        </div>
      </div>

      {step === 0 && (
        <>
          <Card>
            <FieldLabel required>What would you tell your future self? Start with ‘I’.</FieldLabel>
            <Answer value={statement} onChange={setStatement} placeholder="e.g. I pause for one breath before I reply" autoFocus />
          </Card>
          <PrimaryButton disabled={!statement.trim()} onClick={() => setStep(1)}>
            Next
          </PrimaryButton>
        </>
      )}

      {step === 1 && (
        <>
          <Card>
            <FieldLabel>Read it out loud. How does it feel in your body?</FieldLabel>
            <p className="font-heading text-h4 text-black">{statement.trim()}</p>
          </Card>
          <SplitButtons>
            <GreyButton onClick={() => setStep(0)}>Tight</GreyButton>
            <GreenButton onClick={() => setStep(2)}>Light and open</GreenButton>
          </SplitButtons>
        </>
      )}

      {step === 2 && (
        <>
          <Card>
            <FieldLabel required>Which life areas does this Life Code apply to?</FieldLabel>
            <div className="flex flex-col gap-8">
              <div className="flex">
                <Chip
                  label="All life areas"
                  on={all}
                  onClick={() => {
                    setAll(!all);
                    setAreas([]);
                  }}
                />
              </div>
              <AreaChips
                selected={all ? [] : areas}
                onToggle={(id) => {
                  setAll(false);
                  setAreas(areas.includes(id) ? areas.filter((a) => a !== id) : [...areas, id]);
                }}
              />
            </div>
          </Card>
          <PrimaryButton disabled={!hasAreas} onClick={toQuestion2}>
            Next
          </PrimaryButton>
        </>
      )}

      {step === 3 && (
        <>
          <Card>
            <FieldLabel required>Does this Life Code fit one situation, or many situations in your life?</FieldLabel>
            <div className="flex gap-8">
              {(["micro", "macro"] as const).map((t) => (
                <ChoiceCard
                  key={t}
                  title={t === "micro" ? "One situation (Micro)" : "Many situations (Macro)"}
                  on={type === t}
                  onClick={() => {
                    setType(t);
                    setTypeChosen(true);
                  }}
                />
              ))}
            </div>
          </Card>
          <PrimaryButton disabled={!type} onClick={() => setStep(4)}>
            Next
          </PrimaryButton>
        </>
      )}

      {step === 4 && (
        <>
          <Card>
            <FieldLabel>How or when will you use this Life Code?</FieldLabel>
            <Answer value={how} onChange={setHow} placeholder="My answer" rows={2} autoFocus />
          </Card>
          <PrimaryButton disabled={!complete} onClick={save}>
            Save
          </PrimaryButton>
        </>
      )}
    </EngineFrame>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <section className="flex flex-col gap-12 rounded-24 bg-white p-16">{children}</section>;
}

function Answer({
  value,
  onChange,
  placeholder,
  rows = 3,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  rows?: number;
  autoFocus?: boolean;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      autoFocus={autoFocus}
      className="w-full resize-none rounded-12 border-hairline border-background-600 bg-white p-12 text-body text-black outline-none placeholder:text-body-small placeholder:text-ink-50"
    />
  );
}
