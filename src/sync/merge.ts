import { normalizeProgress, type Progress } from "../persistence";
export function mergeProgress(local: Progress, remote: Progress): Progress {
  const unique = <T extends { id: string; at: number }>(a: T[], b: T[]) =>
    Array.from(
      new Map(
        [...a, ...b]
          .sort(
            (x, y) =>
              x.at - y.at ||
              x.id.localeCompare(y.id) ||
              JSON.stringify(x).localeCompare(JSON.stringify(y)),
          )
          .map((e) => [e.id, e]),
      ).values(),
    ).sort((a, b) => a.at - b.at || a.id.localeCompare(b.id));
  const evidence = unique(local.evidence ?? [], remote.evidence ?? []);
  const rewards = unique(local.rewards ?? [], remote.rewards ?? []);
  const baselineXP = Math.max(
    local.xp - (local.rewards ?? []).reduce((s, r) => s + r.amount, 0),
    remote.xp - (remote.rewards ?? []).reduce((s, r) => s + r.amount, 0),
    0,
  );
  const sessions = new Map(local.studySessions.map((s) => [s.date, s]));
  remote.studySessions.forEach((s) => {
    const existing = sessions.get(s.date);
    sessions.set(
      s.date,
      existing
        ? {
            date: s.date,
            durationSeconds: Math.max(
              s.durationSeconds,
              existing.durationSeconds,
            ),
            attempts: Math.max(s.attempts, existing.attempts),
            correct: Math.max(s.correct, existing.correct),
          }
        : s,
    );
  });
  const mastery = { ...local.mastery };
  for (const [skill, score] of Object.entries(remote.mastery))
    mastery[skill] = Math.max(mastery[skill] ?? 0, score);
  for (const skill of new Set(evidence.map((e) => e.skill))) {
    const recent = evidence.filter((e) => e.skill === skill).slice(-20);
    mastery[skill] = Math.round(
      ((2 +
        recent.reduce(
          (sum, e) => sum + (e.correct ? (e.hinted ? 0.5 : 1) : 0),
          0,
        )) /
        (recent.length + 4)) *
        100,
    );
  }
  const attemptsBaseline = Math.max(
    local.attempts - (local.evidence?.length ?? 0),
    remote.attempts - (remote.evidence?.length ?? 0),
    0,
  );
  const correctBaseline = Math.max(
    local.correct - (local.evidence ?? []).filter((e) => e.correct).length,
    remote.correct - (remote.evidence ?? []).filter((e) => e.correct).length,
    0,
  );
  return normalizeProgress({
    ...local,
    completed: [...new Set([...local.completed, ...remote.completed])].sort(),
    xp: baselineXP + rewards.reduce((s, r) => s + r.amount, 0),
    evidence,
    rewards,
    mastery,
    attempts: attemptsBaseline + evidence.length,
    correct: correctBaseline + evidence.filter((e) => e.correct).length,
    diagnosticCompleted:
      local.diagnosticCompleted || remote.diagnosticCompleted,
    streak: Math.max(local.streak, remote.streak),
    studySessions: [...sessions.values()].sort((a, b) =>
      a.date.localeCompare(b.date),
    ),
  });
}
