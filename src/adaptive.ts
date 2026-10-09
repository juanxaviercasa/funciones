import { Progress } from "./persistence";
import { Exercise } from "./exercises";
export function chooseExercise(
  bank: Exercise[],
  progress: Progress,
  excluded: string[] = [],
  now = Date.now(),
  random = Math.random,
): Exercise {
  const candidates = bank.filter((e) => !excluded.includes(e.id));
  const available = candidates.length ? candidates : bank;
  if (!available.length) throw Error("No hay ejercicios disponibles");
  const weighted = available.map((ex) => {
    const history = (progress.evidence ?? []).filter(
      (e) => e.exerciseId === ex.id,
    );
    const previous = history.at(-1);
    const mastery = progress.mastery[ex.skill] ?? 40;
    const desired =
      mastery < 45 ? "Básica" : mastery < 75 ? "Intermedia" : "Avanzada";
    let weight = 1 + (100 - mastery) / 25;
    if (ex.difficulty === desired) weight *= 3;
    if (previous && previous.nextReview <= now)
      weight *= previous.correct ? 4 : 8;
    if (previous && previous.nextReview > now) weight *= 0.1;
    return { ex, weight };
  });
  let cursor = random() * weighted.reduce((sum, item) => sum + item.weight, 0);
  return (
    weighted.find((item) => (cursor -= item.weight) <= 0)?.ex ??
    weighted.at(-1)!.ex
  );
}
export function shuffledChoices<
  T extends { options: string[]; correct: number },
>(exercise: T, random = Math.random): T {
  const options = exercise.options.map((text, index) => ({
    text,
    correct: index === exercise.correct,
  }));
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return {
    ...exercise,
    options: options.map((o) => o.text),
    correct: options.findIndex((o) => o.correct),
  };
}
