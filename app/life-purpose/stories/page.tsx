"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Actions, ErrorText, FieldLabel, QuestionHead, TextArea, TextInput } from "@/components/cif/ui";
import { LpHeader, PrimaryButton } from "@/components/life-purpose/ui";
import { MIN_STORIES, STORY_QUESTIONS, TAG_COLOURS, storyImage } from "@/lib/lifePurpose";
import { addStory, setBodyFeel, useApp } from "@/lib/store";

// Life stories. No Figma frame for this step: the list uses the Figma story card front
// (photo, title, keyword tags) and adding a story uses the CIF question screens' parts.
// A story = title + the story itself, then Dinesh's three questions (one per screen), then
// the key words that later feed the clustering board.
export default function StoriesPage() {
  const router = useRouter();
  const { lifePurpose: lp } = useApp();
  const [adding, setAdding] = useState(false);
  const enough = lp.stories.length >= MIN_STORIES;

  if (adding) return <AddStory onDone={() => setAdding(false)} />;

  return (
    <main className="flex min-h-screen flex-col px-32 pb-40">
      <LpHeader backHref="/life-purpose" />
      <h1 className="mt-24 font-heading text-h1 text-black">My Life Stories</h1>
      {/* Dinesh's opening prompt for the stories, from the Life Purpose workflow. */}
      <p className="mt-4 text-body-small text-black">
        Think of a time in your life when you did something that left you feeling truly fulfilled or satisfied.
      </p>
      <p className="mt-8 text-caption text-ink-50">
        {enough
          ? `${lp.stories.length} stories · add more any time`
          : `${lp.stories.length} of ${MIN_STORIES} stories to continue`}
      </p>

      <div className="mt-16 flex flex-col gap-12">
        {lp.stories.map((story, i) => (
          <article key={story.id} className="relative flex h-area-card w-full flex-col justify-end overflow-hidden rounded-24 border-2 border-white p-16 shadow-card">
            <Image src={storyImage(i)} alt="" fill sizes="329px" className="object-cover" />
            <span aria-hidden className="absolute inset-0 bg-black/10" />
            <div className="relative flex flex-col gap-8">
              <h2 className="font-heading text-h4 text-white">{story.title}</h2>
              <div className="flex flex-wrap gap-x-4 gap-y-6">
                {story.keywords.map((k, j) => (
                  <span key={k} className={`rounded-pill px-8 py-4 text-caption text-white ${TAG_COLOURS[j % TAG_COLOURS.length]}`}>
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex h-[64px] w-full items-center justify-center rounded-24 border border-dashed border-primary-600 text-body-medium text-primary-600"
        >
          + Add a story
        </button>
      </div>

      {enough && (
        // Life Purpose flow, step 8: one word, shown only on the final screen.
        <label className="mt-24 flex flex-col gap-8">
          <span className="text-body-small text-black">Where in your body do you feel this most?</span>
          <TextInput
            placeholder="One word"
            value={lp.bodyFeel}
            onChange={(e) => setBodyFeel(e.target.value.replace(/\s+/g, ""))}
          />
        </label>
      )}

      <div className="mt-auto pt-40">
        <PrimaryButton disabled={!enough} onClick={() => router.push("/life-purpose/clustering")}>
          Continue
        </PrimaryButton>
      </div>
    </main>
  );
}

function AddStory({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [answers, setAnswers] = useState(["", "", ""]);
  const [keywords, setKeywords] = useState(["", "", ""]);
  const [error, setError] = useState("");
  const filled = (s: string) => s.trim().length > 0;

  function next() {
    setError("");
    if (step === 0 && (!filled(title) || !filled(text))) return setError("Give your story a title and a few words.");
    if (step >= 1 && step <= 3 && !filled(answers[step - 1])) return setError("A few words is plenty.");
    if (step === 4) {
      const words = keywords.map((k) => k.trim()).filter(Boolean);
      if (!words.length) return setError("Add at least one word or phrase.");
      addStory({ title: title.trim(), text: text.trim(), doing: answers[0].trim(), value: answers[1].trim(), feeling: answers[2].trim(), keywords: words });
      return onDone();
    }
    setStep(step + 1);
  }

  return (
    <main className="min-h-screen px-32 pb-40">
      <div className="pt-header-top">
        <button
          type="button"
          aria-label="Back"
          onClick={() => (step === 0 ? onDone() : setStep(step - 1))}
          className="flex size-icon-button items-center justify-center rounded-pill bg-white"
        >
          <Image src="/icons/arrow-left.svg" alt="" width={24} height={24} />
        </button>
      </div>
      <div className="mt-24">
        {step === 0 && (
          <>
            <QuestionHead title="Tell me about a moment that mattered" helper="Think of a time you felt truly fulfilled or satisfied." />
            <div className="mt-16 flex flex-col gap-16">
              <label className="flex flex-col gap-8">
                <FieldLabel>Story title</FieldLabel>
                <TextInput placeholder="My answer" value={title} onChange={(e) => setTitle(e.target.value)} />
              </label>
              <label className="flex flex-col gap-8">
                <FieldLabel>The story</FieldLabel>
                <TextArea placeholder="My answer" value={text} onChange={(e) => setText(e.target.value)} />
              </label>
            </div>
          </>
        )}
        {step >= 1 && step <= 3 && (
          <>
            <QuestionHead meta={title} title={STORY_QUESTIONS[step - 1]} />
            <div className="mt-16">
              <TextArea
                aria-labelledby="qtitle"
                placeholder="My answer"
                value={answers[step - 1]}
                onChange={(e) => setAnswers(answers.map((a, i) => (i === step - 1 ? e.target.value : a)))}
              />
            </div>
          </>
        )}
        {step === 4 && (
          <>
            <QuestionHead meta={title} title="Which words sum up this moment for you?" helper="Up to three words or short phrases, in your own words." />
            <div className="mt-16 flex flex-col gap-8">
              {keywords.map((k, i) => (
                <TextInput
                  key={i}
                  large
                  aria-label={`Key word ${i + 1}`}
                  placeholder="e.g. Brave"
                  value={k}
                  onChange={(e) => setKeywords(keywords.map((x, j) => (j === i ? e.target.value : x)))}
                />
              ))}
            </div>
          </>
        )}
        <div className="mt-8">
          <ErrorText message={error} />
        </div>
        <Actions onNext={next} label={step === 4 ? "Save story" : "Continue"} />
      </div>
    </main>
  );
}
