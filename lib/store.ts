"use client";

// The single place all app data lives. Persisted to localStorage under "bridge-app".
// Screens read state with useApp() and change it only through the named actions below.

import { createContext, createElement, useContext, useSyncExternalStore } from "react";
import * as data from "./data";
import type {
  CifAnswers,
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

export type User = { name: string; email: string; token: string };

export type AppState = {
  user: User | null;
  cif: {
    answers: CifAnswers;
    lifeAreas: data.LifeArea[];
    keyResults: KeyResult[];
    agreementSigned: boolean;
  };
  lifePurpose: {
    stories: Story[];
    powerWords: string[];
    clusters: Cluster[];
    statement: string;
    status: PurposeStatus;
  };
  visions: { byLifeArea: Partial<Record<LifeAreaId, Vision>> };
  values: { selected: Trait[]; final: string[] };
  qualities: { selected: Trait[]; final: string[] };
  outcomes: { currentPeriod: Outcome[]; pastPeriods: PastPeriod[] };
  wellbeing: { scores: Record<string, number | null>; pastScores: PastScores[] };
  lifeCodes: LifeCode[];
};

const STORAGE_KEY = "bridge-app";

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
    },
    lifePurpose: {
      stories: data.stories,
      powerWords: data.powerWords,
      clusters: data.clusters,
      statement: data.lifePurposeStatement,
      status: "final",
    },
    visions: {
      byLifeArea: Object.fromEntries(data.visions.map((v) => [v.lifeArea, v])),
    },
    values: { selected: data.values, final: data.finalValueIds },
    qualities: { selected: data.qualities, final: data.finalQualityIds },
    outcomes: { currentPeriod: data.currentOutcomes, pastPeriods: data.pastPeriods },
    wellbeing: { scores: data.wellbeingScores, pastScores: data.pastWellbeingScores },
    lifeCodes: data.lifeCodes,
  };
}

// ---------- Persistence ----------

function read(): AppState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    // Top-level merge so a saved object missing a newer slice still gets it from the sample.
    return { ...sampleState(), ...(JSON.parse(raw) as Partial<AppState>) };
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

// CIF
export function setCifAnswers(answers: Partial<CifAnswers>) {
  update((s) => ({ ...s, cif: { ...s.cif, answers: { ...s.cif.answers, ...answers } } }));
}
export function setLifeAreaScore(id: LifeAreaId, score: number) {
  update((s) => ({
    ...s,
    cif: { ...s.cif, lifeAreas: s.cif.lifeAreas.map((a) => (a.id === id ? { ...a, score } : a)) },
  }));
}
export function toggleFocusArea(id: LifeAreaId) {
  update((s) => ({
    ...s,
    cif: { ...s.cif, lifeAreas: s.cif.lifeAreas.map((a) => (a.id === id ? { ...a, focus: !a.focus } : a)) },
  }));
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
