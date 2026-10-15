"use client";

// The single place all app data lives. Persisted to localStorage under "bridge-app".
// Screens read state with useApp() and change it only through the named actions below.

import { createContext, createElement, useContext, useSyncExternalStore } from "react";
import {
  AREAS,
  blankAnswers,
  blankProgress,
  nextStep,
  objectivesPrefill,
  toColumns,
  type CifColumns,
  type CifState,
} from "./cif";
import * as data from "./data";
import type {
  CifAnswers,
  CifProgress,
  Cluster,
  KeyResult,
  LifeAreaId,
  LifeCode,
  Outcome,
  PastPeriod,
  PastScores,
  PurposeStatus,
  Story,
  Trait,
  Vision,
} from "./data";

// ---------- State ----------

export type User = {
  name: string;
  email: string;
  token: string;
  phone?: { code: string; number: string };
  // Prototype only: there is no server, so the password lives here in plain text so
  // Change Password has something to check against. Never do this with real auth.
  password?: string;
};

export type AppState = {
  user: User | null;
  cif: {
    answers: CifAnswers;
    lifeAreas: data.LifeArea[]; // the wheel: score + focus per area
    keyResults: KeyResult[];
    agreementSigned: boolean;
    progress: CifProgress;
    // Written on submit: one entry per Notion column (names exactly as in CIF v2 Submissions).
    columns: CifColumns | null;
  };
  lifePurpose: {
    stories: Story[];
    powerWords: string[];
    clusters: Cluster[];
    statement: string;
    status: PurposeStatus;
    drafts: { date: string; text: string }[]; // every saved draft, oldest first
    makeItReal: number[]; // "Make it real" suggestions the client has ticked
    bodyFeel: string; // "I feel this most in my …"
  };
  visions: { byLifeArea: Partial<Record<LifeAreaId, Vision>> };
  values: { selected: Trait[]; final: string[] };
  qualities: { selected: Trait[]; final: string[] };
  outcomes: { currentPeriod: Outcome[]; pastPeriods: PastPeriod[] };
  wellbeing: { scores: Record<string, number | null>; pastScores: PastScores[] };
  lifeCodes: LifeCode[];
  settings: {
    notifications: boolean;
    // Which life areas use an uploaded picture instead of the default. Only this choice is
    // saved; the uploaded image itself lives in memory (lib/media.ts) and is gone after a reload.
    lifeAreaImages: Partial<Record<LifeAreaId, "custom">>;
  };
};

const STORAGE_KEY = "bridge-app";

function emptyLifePurpose(): AppState["lifePurpose"] {
  return { stories: [], powerWords: [], clusters: [], statement: "", status: "empty", drafts: [], makeItReal: [], bodyFeel: "" };
}

function sampleState(): AppState {
  return {
    // The sample client's account exists, but there is no session until she logs in
    // (lib/auth.ts issues the token). Any password works for this email.
    user: { ...data.sampleUser, token: "" },
    cif: {
      answers: data.cifAnswers,
      lifeAreas: data.lifeAreas,
      keyResults: data.keyResults,
      agreementSigned: true,
      progress: data.cifProgress,
      columns: toColumns({ answers: data.cifAnswers, lifeAreas: data.lifeAreas, progress: data.cifProgress }),
    },
    // Life Purpose starts empty: the client adds their own stories, clusters and statement.
    lifePurpose: emptyLifePurpose(),
    visions: {
      byLifeArea: Object.fromEntries(data.visions.map((v) => [v.lifeArea, v])),
    },
    values: { selected: data.values, final: data.finalValueIds },
    qualities: { selected: data.qualities, final: data.finalQualityIds },
    outcomes: { currentPeriod: data.currentOutcomes, pastPeriods: data.pastPeriods },
    wellbeing: { scores: data.wellbeingScores, pastScores: data.pastWellbeingScores },
    lifeCodes: data.lifeCodes,
    settings: { notifications: true, lifeAreaImages: {} },
  };
}

// ---------- Persistence ----------

function read(): AppState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    // Top-level merge so a saved object missing a newer slice still gets it from the sample.
    const saved = JSON.parse(raw) as Partial<AppState>;
    const sample = sampleState();
    // A CIF saved before the live-form shape (no progress, or not the 12 wheel areas) is replaced.
    if (saved.cif && (!saved.cif.progress || saved.cif.lifeAreas?.length !== AREAS.length)) {
      saved.cif = sample.cif;
    }
    // Life Purpose fields added later get empty defaults.
    if (saved.lifePurpose) {
      const lp = saved.lifePurpose as Partial<AppState["lifePurpose"]>;
      saved.lifePurpose = { ...lp, drafts: lp.drafts ?? [], makeItReal: lp.makeItReal ?? [], bodyFeel: lp.bodyFeel ?? "" } as AppState["lifePurpose"];
      // Meera's old sample Life Purpose, still untouched, is cleared so the client starts fresh.
      if (lp.statement === data.lifePurposeStatement && lp.stories?.[0]?.id === "story-1") {
        saved.lifePurpose = emptyLifePurpose();
      }
    }
    return { ...sample, ...saved };
  } catch {
    return null;
  }
}

function write(next: AppState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Blocked or full storage: keep working in memory.
  }
}

// ---------- Store ----------

const serverState = sampleState();
let state: AppState = serverState;
let loaded = false;
const listeners = new Set<() => void>();

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  state = read() ?? state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  ensureLoaded();
  return state;
}

function update(change: (s: AppState) => AppState) {
  ensureLoaded();
  state = change(state);
  write(state);
  listeners.forEach((l) => l());
}

function newId(prefix: string) {
  // crypto.randomUUID needs a secure context, which a phone on the LAN over http doesn't have.
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

// ---------- Actions ----------

// User
export function signIn(user: User) {
  update((s) => ({ ...s, user }));
}
export function signOut() {
  update((s) => ({ ...s, user: null }));
}
export function updateUser(patch: Partial<Omit<User, "token" | "password">>) {
  update((s) => (s.user ? { ...s, user: { ...s.user, ...patch } } : s));
}
export function setPassword(password: string) {
  update((s) => (s.user ? { ...s, user: { ...s.user, password } } : s));
}

// Settings
export function setNotifications(notifications: boolean) {
  update((s) => ({ ...s, settings: { ...s.settings, notifications } }));
}
export function setLifeAreaImageChoice(id: LifeAreaId, choice: "custom" | "default") {
  update((s) => {
    const lifeAreaImages = { ...s.settings.lifeAreaImages };
    if (choice === "custom") lifeAreaImages[id] = "custom";
    else delete lifeAreaImages[id];
    return { ...s, settings: { ...s.settings, lifeAreaImages } };
  });
}

// CIF — answers save on every change, so the client can leave and resume at the exact question.
const cifState = (s: AppState): CifState => ({
  answers: s.cif.answers,
  lifeAreas: s.cif.lifeAreas,
  progress: s.cif.progress,
});
const withProgress = (s: AppState, patch: Partial<CifProgress>): AppState => ({
  ...s,
  cif: { ...s.cif, progress: { ...s.cif.progress, ...patch } },
});

export function setCifAnswers(answers: Partial<CifAnswers>) {
  update((s) => ({ ...s, cif: { ...s.cif, answers: { ...s.cif.answers, ...answers } } }));
}
export function setLifeAreaScore(id: LifeAreaId, score: number) {
  update((s) => ({
    ...s,
    cif: { ...s.cif, lifeAreas: s.cif.lifeAreas.map((a) => (a.id === id ? { ...a, score } : a)) },
  }));
}
/** Set the 1–3 focus areas (the client has now chosen, so the lowest-three default no longer applies). */
export function setFocusAreas(ids: LifeAreaId[]) {
  update((s) =>
    withProgress(
      { ...s, cif: { ...s.cif, lifeAreas: s.cif.lifeAreas.map((a) => ({ ...a, focus: ids.includes(a.id) })) } },
      { focusChosen: true },
    ),
  );
}
/** Go to a step. `push` records where we came from, for Back. */
export function cifGo(step: string, push = true) {
  update((s) => {
    const { current, history } = s.cif.progress;
    const startedAt = s.cif.progress.startedAt ?? (step !== "welcome" ? new Date().toISOString() : null);
    let next = withProgress(s, {
      current: step,
      history: push && current !== step ? [...history, current] : history,
      startedAt,
    });
    // 3.2 opens pre-filled from the goal picks; it follows the picks until the client edits it.
    if (step === "objectives") {
      const pre = objectivesPrefill(cifState(next));
      const a = next.cif.answers;
      if (!a.objectives.trim() || a.objectives === a.objectivesPrefill) {
        next = { ...next, cif: { ...next.cif, answers: { ...a, objectives: pre, objectivesPrefill: pre } } };
      }
    }
    return next;
  });
}
export function cifNext() {
  ensureLoaded();
  const { step, stopEditing } = nextStep(cifState(state));
  if (stopEditing) update((s) => withProgress(s, { editing: false }));
  cifGo(step);
}
export function cifBack(flowSteps: string[]) {
  update((s) => {
    const history = [...s.cif.progress.history];
    let previous = history.pop();
    while (previous && !flowSteps.includes(previous)) previous = history.pop();
    if (!previous) {
      const i = flowSteps.indexOf(s.cif.progress.current);
      previous = flowSteps[Math.max(0, i - 1)];
    }
    return withProgress(s, { current: previous, history });
  });
}
/** Edit link on the summary: jump to a screen, then come back to the summary. */
export function cifEdit(step: string) {
  update((s) => withProgress(s, { editing: true }));
  cifGo(step);
}
/** Writes everything (and the Notion columns) into store.cif. */
export function submitCif() {
  update((s) => {
    const submitted = withProgress(s, { submittedAt: new Date().toISOString(), editing: false, current: "summary" });
    return { ...submitted, cif: { ...submitted.cif, columns: toColumns(cifState(submitted)) } };
  });
}
/** Clears the CIF so the client can start again. */
export function resetCif() {
  update((s) => ({
    ...s,
    cif: {
      ...s.cif,
      answers: blankAnswers(),
      lifeAreas: s.cif.lifeAreas.map((a) => ({ ...a, score: null, focus: false })),
      progress: blankProgress(),
      columns: null,
    },
  }));
}
/** Nothing is ever unsaved (every answer writes straight away); this re-writes to be certain. */
export function saveCifProgress() {
  update((s) => s);
}
export function addKeyResult(keyResult: Omit<KeyResult, "id">) {
  update((s) => ({
    ...s,
    cif: { ...s.cif, keyResults: [...s.cif.keyResults, { ...keyResult, id: newId("kr") }] },
  }));
}
export function updateKeyResult(id: string, patch: Partial<Omit<KeyResult, "id">>) {
  update((s) => ({
    ...s,
    cif: { ...s.cif, keyResults: s.cif.keyResults.map((k) => (k.id === id ? { ...k, ...patch } : k)) },
  }));
}
export function removeKeyResult(id: string) {
  update((s) => ({ ...s, cif: { ...s.cif, keyResults: s.cif.keyResults.filter((k) => k.id !== id) } }));
}
export function signAgreement() {
  update((s) => ({ ...s, cif: { ...s.cif, agreementSigned: true } }));
}

// Life Purpose
export function addStory(story: Omit<Story, "id">) {
  update((s) => ({
    ...s,
    lifePurpose: { ...s.lifePurpose, stories: [...s.lifePurpose.stories, { ...story, id: newId("story") }] },
  }));
}
export function updateStory(id: string, patch: Partial<Omit<Story, "id">>) {
  update((s) => ({
    ...s,
    lifePurpose: {
      ...s.lifePurpose,
      stories: s.lifePurpose.stories.map((st) => (st.id === id ? { ...st, ...patch } : st)),
    },
  }));
}
export function removeStory(id: string) {
  update((s) => ({
    ...s,
    lifePurpose: { ...s.lifePurpose, stories: s.lifePurpose.stories.filter((st) => st.id !== id) },
  }));
}
export function setClusters(clusters: Cluster[]) {
  update((s) => ({ ...s, lifePurpose: { ...s.lifePurpose, clusters } }));
}
export function setPowerWords(powerWords: string[]) {
  update((s) => ({ ...s, lifePurpose: { ...s.lifePurpose, powerWords } }));
}
export function setStatement(statement: string) {
  update((s) => ({
    ...s,
    lifePurpose: {
      ...s.lifePurpose,
      statement,
      status: s.lifePurpose.status === "empty" ? "draft" : s.lifePurpose.status,
    },
  }));
}
/** Internal demo only (/_index): load Meera's sample Life Purpose, as a draft or final. */
export function loadSampleLifePurpose(status: "draft" | "final") {
  update((s) => ({
    ...s,
    lifePurpose: {
      stories: data.stories,
      powerWords: data.powerWords,
      clusters: data.clusters,
      statement: data.lifePurposeStatement,
      status,
      drafts: [...data.purposeDrafts, { date: "2026-09-30", text: data.lifePurposeStatement }],
      makeItReal: [0, 1],
      bodyFeel: data.purposeBodyFeel,
    },
  }));
}
/** Internal demo only (/_index): back to an empty Life Purpose. */
export function clearLifePurpose() {
  update((s) => ({ ...s, lifePurpose: emptyLifePurpose() }));
}
/** "Draft Feels True": keeps the client's own words as the current draft and in the history. */
export function saveDraft(text: string) {
  update((s) => {
    const lp = s.lifePurpose;
    const last = lp.drafts[lp.drafts.length - 1];
    const drafts =
      last?.text === text ? lp.drafts : [...lp.drafts, { date: new Date().toISOString().slice(0, 10), text }];
    return { ...s, lifePurpose: { ...lp, statement: text, status: "draft", drafts } };
  });
}
/** "I feel this most in my ___" — one word, exactly as the client says it. */
export function setBodyFeel(bodyFeel: string) {
  update((s) => ({ ...s, lifePurpose: { ...s.lifePurpose, bodyFeel } }));
}
export function toggleMakeItReal(index: number) {
  update((s) => {
    const done = s.lifePurpose.makeItReal;
    const makeItReal = done.includes(index) ? done.filter((i) => i !== index) : [...done, index];
    return { ...s, lifePurpose: { ...s.lifePurpose, makeItReal } };
  });
}
export function setPurposeStatus(status: PurposeStatus) {
  update((s) => ({ ...s, lifePurpose: { ...s.lifePurpose, status } }));
}

// Visions
export function setVision(lifeArea: LifeAreaId, patch: Partial<Omit<Vision, "lifeArea">>) {
  update((s) => {
    const current: Vision = s.visions.byLifeArea[lifeArea] ?? {
      lifeArea,
      answers: { livedOnPurpose: "", doOrBe: "", energizingValues: "", lifetime: "" },
      statement: "",
      byPowerWord: {},
    };
    return {
      ...s,
      visions: { byLifeArea: { ...s.visions.byLifeArea, [lifeArea]: { ...current, ...patch } } },
    };
  });
}
export function removeVision(lifeArea: LifeAreaId) {
  update((s) => {
    const byLifeArea = { ...s.visions.byLifeArea };
    delete byLifeArea[lifeArea];
    return { ...s, visions: { byLifeArea } };
  });
}

// Values & Qualities
export function setSelectedValues(selected: Trait[]) {
  update((s) => ({ ...s, values: { ...s.values, selected } }));
}
export function setFinalValues(ids: string[]) {
  update((s) => ({ ...s, values: { ...s.values, final: ids } }));
}
export function setSelectedQualities(selected: Trait[]) {
  update((s) => ({ ...s, qualities: { ...s.qualities, selected } }));
}
export function setFinalQualities(ids: string[]) {
  update((s) => ({ ...s, qualities: { ...s.qualities, final: ids } }));
}

// Outcomes
export function addOutcome(outcome: Omit<Outcome, "id" | "done" | "score">) {
  update((s) => ({
    ...s,
    outcomes: {
      ...s.outcomes,
      currentPeriod: [...s.outcomes.currentPeriod, { ...outcome, id: newId("o"), done: false, score: null }],
    },
  }));
}
export function updateOutcome(id: string, patch: Partial<Omit<Outcome, "id">>) {
  update((s) => ({
    ...s,
    outcomes: {
      ...s.outcomes,
      currentPeriod: s.outcomes.currentPeriod.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    },
  }));
}
export function removeOutcome(id: string) {
  update((s) => ({
    ...s,
    outcomes: { ...s.outcomes, currentPeriod: s.outcomes.currentPeriod.filter((o) => o.id !== id) },
  }));
}
export function toggleOutcomeDone(id: string) {
  update((s) => ({
    ...s,
    outcomes: {
      ...s.outcomes,
      currentPeriod: s.outcomes.currentPeriod.map((o) => (o.id === id ? { ...o, done: !o.done } : o)),
    },
  }));
}
export function setOutcomeScore(id: string, score: number | null) {
  updateOutcome(id, { score });
}
export function setOutcomePriorities(orderedIds: string[]) {
  update((s) => ({
    ...s,
    outcomes: {
      ...s.outcomes,
      currentPeriod: s.outcomes.currentPeriod.map((o) => {
        const rank = orderedIds.indexOf(o.id);
        return { ...o, priority: rank === -1 ? null : rank + 1 };
      }),
    },
  }));
}

// Well-being
export function setQualityScore(quality: string, score: number | null) {
  update((s) => ({ ...s, wellbeing: { ...s.wellbeing, scores: { ...s.wellbeing.scores, [quality]: score } } }));
}

// Life Codes
export function addLifeCode(lifeCode: Omit<LifeCode, "id" | "status">) {
  update((s) => ({ ...s, lifeCodes: [...s.lifeCodes, { ...lifeCode, id: newId("lc"), status: "active" }] }));
}
export function updateLifeCode(id: string, patch: Partial<Omit<LifeCode, "id">>) {
  update((s) => ({ ...s, lifeCodes: s.lifeCodes.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
}
export function archiveLifeCode(id: string) {
  updateLifeCode(id, { status: "archived" });
}
export function restoreLifeCode(id: string) {
  updateLifeCode(id, { status: "active" });
}

// Demo
export function resetToSample() {
  update(() => sampleState());
}

// ---------- React ----------

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const value = useSyncExternalStore(subscribe, getSnapshot, () => serverState);
  return createElement(AppContext.Provider, { value }, children);
}

export function useApp(): AppState {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp() must be used inside <AppProvider>");
  return value;
}
