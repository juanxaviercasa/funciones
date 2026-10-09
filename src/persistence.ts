import {
  exportSchema,
  skillNames,
  dateSchema,
  evidenceSchema,
  rewardSchema,
} from "./schemas";
import type { Evidence, Reward } from "./schemas";
import { lessons } from "./content";
export type Progress = {
  xp: number;
  streak: number;
  completed: string[];
  mastery: Record<string, number>;
  attempts: number;
  correct: number;
  studySessions: StudySession[];
  evidence?: Evidence[];
  rewards?: Reward[];
  diagnosticCompleted?: boolean;
  weeklyGoal?: number;
};
export type StudySession = {
  date: string;
  durationSeconds: number;
  attempts: number;
  correct: number;
};

export type Preferences = {
  theme: "light" | "dark";
  motion: boolean;
  captions: boolean;
  textSize: TextSize;
};
export type TextSize = "1" | "1.125" | "1.25";

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type LoadStatus =
  "fresh" | "loaded" | "migrated" | "recovered" | "unavailable";
export type LoadResult<T> = { value: T; status: LoadStatus };

export const PROGRESS_KEY = "funciones-progress-v3";
export const PREVIOUS_PROGRESS_KEY = "funciones-progress-v2";
export const PREFERENCES_KEY = "funciones-preferences-v1";
export const LEGACY_PROGRESS_KEY = "funciones-progress";
export const DEFAULT_PROGRESS: Progress = {
  xp: 0,
  streak: 0,
  completed: [],
  mastery: {},
  attempts: 0,
  correct: 0,
  studySessions: [],
};
export const DEFAULT_PREFERENCES: Preferences = {
  theme: "light",
  motion: true,
  captions: true,
  textSize: "1",
};

export function getBrowserStorage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function finiteNonNegative(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : fallback;
}

export function normalizeProgress(value: unknown): Progress {
  if (!value || typeof value !== "object") return { ...DEFAULT_PROGRESS };
  const input = value as Partial<Progress>;
  const attempts = finiteNonNegative(input.attempts);
  const correct = Math.min(attempts, finiteNonNegative(input.correct));
  const mastery: Record<string, number> = {};
  if (input.mastery && typeof input.mastery === "object") {
    for (const [skill, score] of Object.entries(input.mastery)) {
      if (
        skillNames.includes(skill as (typeof skillNames)[number]) &&
        typeof score === "number" &&
        Number.isFinite(score)
      ) {
        mastery[skill] = Math.max(0, Math.min(100, score));
      }
    }
  }
  return {
    xp: Math.min(10_000_000, finiteNonNegative(input.xp)),
    streak: Math.min(90, finiteNonNegative(input.streak)),
    evidence: Array.isArray(input.evidence)
      ? input.evidence.slice(-2000).flatMap((item) => {
          const parsed = evidenceSchema.safeParse(item);
          return parsed.success ? [parsed.data] : [];
        })
      : [],
    rewards: Array.isArray(input.rewards)
      ? input.rewards.slice(-2000).flatMap((item) => {
          const parsed = rewardSchema.safeParse(item);
          return parsed.success ? [parsed.data] : [];
        })
      : [],
    diagnosticCompleted: input.diagnosticCompleted === true,
    weeklyGoal: Math.min(
      100,
      Math.max(1, finiteNonNegative(input.weeklyGoal, 20)),
    ),
    completed: Array.isArray(input.completed)
      ? [
          ...new Set(
            input.completed.filter(
              (id): id is string =>
                typeof id === "string" && lessons.some((l) => l.id === id),
            ),
          ),
        ]
      : [],
    mastery,
    attempts: Math.min(10_000_000, attempts),
    correct: Math.min(10_000_000, correct),
    studySessions: Array.isArray(input.studySessions)
      ? input.studySessions
          .filter(
            (session): session is StudySession =>
              !!session &&
              typeof session.date === "string" &&
              dateSchema.safeParse(session.date).success,
          )
          .map((session) => {
            const sessionAttempts = finiteNonNegative(session.attempts);
            return {
              date: session.date,
              durationSeconds: finiteNonNegative(session.durationSeconds),
              attempts: sessionAttempts,
              correct: Math.min(
                sessionAttempts,
                finiteNonNegative(session.correct),
              ),
            };
          })
          .slice(-90)
      : [],
  };
}

function isLegacyDemo(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const input = value as Partial<Progress>;
  const mastery = input.mastery;
  return (
    input.xp === 1240 &&
    input.streak === 7 &&
    input.attempts === 18 &&
    input.correct === 13 &&
    Array.isArray(input.completed) &&
    input.completed.length === 1 &&
    input.completed[0] === "que-es" &&
    !!mastery &&
    mastery.Fundamentos === 72 &&
    mastery.Dominio === 58 &&
    mastery.Gráficas === 46 &&
    mastery.Lineales === 81 &&
    mastery.Cuadráticas === 39 &&
    mastery.Transformaciones === 24
  );
}

export function loadProgress(
  storage: StorageLike | null,
): LoadResult<Progress> {
  if (!storage)
    return { value: { ...DEFAULT_PROGRESS }, status: "unavailable" };
  try {
    const current = storage.getItem(PROGRESS_KEY);
    if (current !== null) {
      const envelope = JSON.parse(current) as {
        version?: unknown;
        data?: unknown;
      };
      if (envelope?.version === 3) {
        return { value: normalizeProgress(envelope.data), status: "loaded" };
      }
      if (envelope?.version === 2) {
        return { value: normalizeProgress(envelope.data), status: "migrated" };
      }
      return { value: { ...DEFAULT_PROGRESS }, status: "recovered" };
    }
    const previous = storage.getItem(PREVIOUS_PROGRESS_KEY);
    if (previous !== null) {
      const envelope = JSON.parse(previous) as {
        version?: unknown;
        data?: unknown;
      };
      if (envelope?.version === 2) {
        return { value: normalizeProgress(envelope.data), status: "migrated" };
      }
      return { value: { ...DEFAULT_PROGRESS }, status: "recovered" };
    }
    const legacy = storage.getItem(LEGACY_PROGRESS_KEY);
    if (legacy === null)
      return { value: { ...DEFAULT_PROGRESS }, status: "fresh" };
    const oldValue: unknown = JSON.parse(legacy);
    if (isLegacyDemo(oldValue)) {
      return { value: { ...DEFAULT_PROGRESS }, status: "migrated" };
    }
    return { value: normalizeProgress(oldValue), status: "migrated" };
  } catch {
    return { value: { ...DEFAULT_PROGRESS }, status: "recovered" };
  }
}

export function saveProgress(
  storage: StorageLike | null,
  progress: Progress,
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(
      PROGRESS_KEY,
      JSON.stringify({ version: 3, data: normalizeProgress(progress) }),
    );
    return true;
  } catch {
    return false;
  }
}

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftDate(key: string, days: number): string {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day + days);
  return dateKey(date);
}

function withStudyDay(progress: Progress, date: Date): Progress {
  const key = dateKey(date);
  const previous = progress.studySessions.find(
    (session) => session.date === key,
  );
  const studySessions = previous
    ? progress.studySessions.map((session) =>
        session.date === key
          ? { ...session, durationSeconds: previous.durationSeconds }
          : session,
      )
    : [
        ...progress.studySessions,
        { date: key, durationSeconds: 0, attempts: 0, correct: 0 },
      ];
  const byDate = new Map(
    studySessions.map((session) => [session.date, session]),
  );
  let streak = 0;
  let cursor = key;
  while (byDate.has(cursor)) {
    streak += 1;
    cursor = shiftDate(cursor, -1);
  }
  return { ...progress, streak, studySessions: studySessions.slice(-90) };
}

export function recordStudyTime(
  progress: Progress,
  seconds: number,
  date = new Date(),
): Progress {
  if (!Number.isFinite(seconds) || seconds <= 0) return progress;
  const marked = withStudyDay(progress, date);
  const key = dateKey(date);
  return {
    ...marked,
    studySessions: marked.studySessions.map((session) =>
      session.date === key
        ? {
            ...session,
            durationSeconds: session.durationSeconds + Math.floor(seconds),
          }
        : session,
    ),
  };
}

export function markStudyDay(progress: Progress, date = new Date()): Progress {
  return withStudyDay(progress, date);
}

export function recordAttempt(
  progress: Progress,
  skill: string,
  wasCorrect: boolean,
  date = new Date(),
): Progress {
  const marked = withStudyDay(progress, date);
  const key = dateKey(date);
  return {
    ...marked,
    attempts: marked.attempts + 1,
    correct: marked.correct + (wasCorrect ? 1 : 0),
    studySessions: marked.studySessions.map((session) =>
      session.date === key
        ? {
            ...session,
            attempts: session.attempts + 1,
            correct: session.correct + (wasCorrect ? 1 : 0),
          }
        : session,
    ),
  };
}

export function studyTimeLabel(totalSeconds: number): string {
  const minutes = Math.floor(finiteNonNegative(totalSeconds) / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours > 0 ? `${hours} h ${remainingMinutes} min` : `${minutes} min`;
}

export function createProgressExport(
  progress: Progress,
  exportedAt = new Date(),
): string {
  return JSON.stringify(
    {
      app: "funciones-lab",
      version: 1,
      exportedAt: exportedAt.toISOString(),
      progress: normalizeProgress(progress),
    },
    null,
    2,
  );
}

export function parseProgressImport(contents: string): Progress {
  if (contents.length > 1_000_000) throw new Error("La copia supera 1 MB.");
  const envelope = exportSchema.safeParse(JSON.parse(contents));
  if (!envelope.success) {
    throw new Error(
      "El archivo no es una exportación válida de Funciones Lab.",
    );
  }
  return normalizeProgress(envelope.data.progress);
}

function normalizePreferences(value: unknown): Preferences {
  if (!value || typeof value !== "object") return { ...DEFAULT_PREFERENCES };
  const input = value as Partial<Preferences>;
  return {
    theme: input.theme === "dark" ? "dark" : "light",
    motion: typeof input.motion === "boolean" ? input.motion : true,
    captions: typeof input.captions === "boolean" ? input.captions : true,
    textSize:
      input.textSize === "1.125" || input.textSize === "1.25"
        ? input.textSize
        : "1",
  };
}

export function loadPreferences(
  storage: StorageLike | null,
): LoadResult<Preferences> {
  if (!storage)
    return { value: { ...DEFAULT_PREFERENCES }, status: "unavailable" };
  try {
    const current = storage.getItem(PREFERENCES_KEY);
    if (current !== null) {
      const envelope = JSON.parse(current) as {
        version?: unknown;
        data?: unknown;
      };
      if (envelope?.version === 1) {
        return { value: normalizePreferences(envelope.data), status: "loaded" };
      }
      return { value: { ...DEFAULT_PREFERENCES }, status: "recovered" };
    }
    const legacyTheme = storage.getItem("funciones-theme");
    const legacyMotion = storage.getItem("funciones-motion");
    const legacyCaptions = storage.getItem("funciones-captions");
    const legacyTextSize = storage.getItem("funciones-text-size");
    const hasLegacy = [
      legacyTheme,
      legacyMotion,
      legacyCaptions,
      legacyTextSize,
    ].some((value) => value !== null);
    if (!hasLegacy)
      return { value: { ...DEFAULT_PREFERENCES }, status: "fresh" };
    return {
      value: normalizePreferences({
        theme: legacyTheme,
        motion: legacyMotion === null ? true : legacyMotion !== "false",
        captions: legacyCaptions === null ? true : legacyCaptions !== "false",
        textSize: legacyTextSize,
      }),
      status: "migrated",
    };
  } catch {
    return { value: { ...DEFAULT_PREFERENCES }, status: "recovered" };
  }
}

export function savePreferences(
  storage: StorageLike | null,
  preferences: Preferences,
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({ version: 1, data: normalizePreferences(preferences) }),
    );
    return true;
  } catch {
    return false;
  }
}

export function clearStoredData(storage: StorageLike | null): boolean {
  if (!storage) return false;
  try {
    for (const key of [
      PROGRESS_KEY,
      PREVIOUS_PROGRESS_KEY,
      PREFERENCES_KEY,
      LEGACY_PROGRESS_KEY,
      "funciones-theme",
      "funciones-motion",
      "funciones-captions",
      "funciones-text-size",
    ]) {
      storage.removeItem(key);
    }
    return true;
  } catch {
    return false;
  }
}
