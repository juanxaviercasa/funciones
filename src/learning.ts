import { lessons, type Lesson } from "./content";
import { masteryAfter } from "./math";
import type { Progress } from "./persistence";

export type LessonCompletion = { progress: Progress; awarded: boolean };

export function completeLesson(
  progress: Progress,
  lessonId: string,
): LessonCompletion {
  if (
    !lessons.some((l) => l.id === lessonId) ||
    progress.completed.includes(lessonId)
  )
    return { progress, awarded: false };
  return {
    awarded: true,
    progress: {
      ...progress,
      ...awardOnce(progress, `lesson:${lessonId}`, 80),
      completed: [...progress.completed, lessonId],
    },
  };
}

export function recordExerciseAnswer(
  progress: Progress,
  skill: string,
  wasCorrect: boolean,
  xpAward: number,
): Progress {
  return {
    ...progress,
    xp: progress.xp + xpAward,
    mastery: {
      ...progress.mastery,
      [skill]: masteryAfter(progress.mastery[skill] ?? 0, wasCorrect, 1),
    },
  };
}

export function recommendedLesson(
  lessons: Lesson[],
  progress: Progress,
): Lesson | null {
  const available = lessons.filter(
    (lesson) =>
      !progress.completed.includes(lesson.id) &&
      lesson.prerequisites.every(
        (id) =>
          progress.completed.includes(id) ||
          (progress.diagnosticCompleted &&
            (progress.mastery[lessons.find((l) => l.id === id)?.skill ?? ""] ??
              0) >= 75),
      ),
  );
  if (available.length === 0) return null;
  return available.reduce((weakest, lesson) => {
    const lessonMastery = progress.mastery[lesson.skill] ?? 50;
    const weakestMastery = progress.mastery[weakest.skill] ?? 50;
    return lessonMastery < weakestMastery ? lesson : weakest;
  });
}

export function moduleCompletion(moduleIndex: number, progress: Progress) {
  const items = lessons.filter((l) => l.module === moduleIndex);
  return items.length
    ? Math.round(
        (items.filter((l) => progress.completed.includes(l.id)).length /
          items.length) *
          100,
      )
    : 0;
}

export function awardOnce(
  progress: Progress,
  id: string,
  amount: number,
  at = Date.now(),
): Progress {
  if ((progress.rewards ?? []).some((r) => r.id === id)) return progress;
  return {
    ...progress,
    xp: progress.xp + amount,
    rewards: [...(progress.rewards ?? []), { id, amount, at }],
  };
}

export function recordEvidence(
  progress: Progress,
  exerciseId: string,
  skill: string,
  correct: boolean,
  hinted: boolean,
  at = Date.now(),
  id: string = crypto.randomUUID(),
): Progress {
  if ((progress.evidence ?? []).some((e) => e.id === id)) return progress;
  const previous = [...(progress.evidence ?? [])]
    .reverse()
    .find((e) => e.exerciseId === exerciseId);
  const intervalDays =
    correct && !hinted
      ? Math.min(90, Math.max(1, (previous?.intervalDays ?? 0) * 2 + 1))
      : 0;
  const evidence = [
    ...(progress.evidence ?? []),
    {
      id,
      exerciseId,
      skill: skill as import("./schemas").Evidence["skill"],
      correct,
      hinted,
      at,
      intervalDays,
      nextReview: at + (intervalDays || 1 / 24) * 86_400_000,
    },
  ].slice(-2000);
  const recent = evidence.filter((e) => e.skill === skill).slice(-20);
  // Beta posterior with two successes/two failures; hint credit is halved.
  const successes = recent.reduce(
    (sum, e) => sum + (e.correct ? (e.hinted ? 0.5 : 1) : 0),
    0,
  );
  const mastery = Math.round(((successes + 2) / (recent.length + 4)) * 100);
  const rewarded =
    correct && !previous?.correct
      ? awardOnce(progress, `exercise:${exerciseId}`, hinted ? 10 : 20, at)
      : progress;
  return {
    ...rewarded,
    evidence,
    mastery: { ...progress.mastery, [skill]: mastery },
  };
}

export function finishDiagnostic(
  progress: Progress,
  results: { skill: string; correct: boolean }[],
): Progress {
  const mastery = { ...progress.mastery };
  for (const skill of new Set(results.map((r) => r.skill))) {
    const answers = results.filter((r) => r.skill === skill);
    mastery[skill] = Math.round(
      (answers.filter((r) => r.correct).length / answers.length) * 100,
    );
  }
  return {
    ...awardOnce(progress, "diagnostic:initial", 100),
    diagnosticCompleted: true,
    mastery,
  };
}
