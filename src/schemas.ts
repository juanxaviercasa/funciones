import { z } from "zod";
import { lessons } from "./content";
export const skillNames = [
  "Álgebra",
  "Fundamentos",
  "Notación",
  "Dominio",
  "Rango",
  "Gráficas",
  "Lineales",
  "Cuadráticas",
  "Transformaciones",
  "Composición",
  "Modelación",
] as const;
const lessonIds = new Set(lessons.map((l) => l.id));
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T12:00:00Z`);
    return (
      Number.isFinite(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  });
const counter = z.number().finite().int().min(0).max(10_000_000);
export const evidenceSchema = z.object({
  id: z.string().min(1).max(100),
  exerciseId: z.string().min(1).max(100),
  skill: z.enum(skillNames),
  correct: z.boolean(),
  hinted: z.boolean(),
  at: z.number().int().nonnegative().max(8_640_000_000_000_000),
  nextReview: z.number().int().nonnegative().max(8_640_000_000_000_000),
  intervalDays: z.number().min(0).max(365),
});
export const rewardSchema = z.object({
  id: z.string().min(1).max(200),
  amount: z.number().int().min(0).max(100),
  at: z.number().int().nonnegative().max(8_640_000_000_000_000),
});
export const progressSchema = z
  .object({
    xp: counter,
    streak: z.number().int().min(0).max(90),
    completed: z
      .array(
        z.string().refine((id) => lessonIds.has(id), "Lección desconocida"),
      )
      .max(lessons.length),
    mastery: z.partialRecord(
      z.enum(skillNames),
      z.number().finite().min(0).max(100),
    ),
    attempts: counter,
    correct: counter,
    studySessions: z
      .array(
        z.object({
          date: dateSchema,
          durationSeconds: counter,
          attempts: counter,
          correct: counter,
        }),
      )
      .max(90),
    evidence: z.array(evidenceSchema).max(2000).optional(),
    rewards: z.array(rewardSchema).max(2000).optional(),
    diagnosticCompleted: z.boolean().optional(),
    weeklyGoal: z.number().int().min(1).max(100).optional(),
  })
  .refine(
    (p) =>
      p.correct <= p.attempts &&
      p.studySessions.every((s) => s.correct <= s.attempts),
    "Los aciertos no pueden superar los intentos",
  );
export const exportSchema = z.object({
  app: z.literal("funciones-lab"),
  version: z.literal(1),
  progress: progressSchema,
});
export const preferencesSchema = z.object({
  theme: z.enum(["light", "dark"]),
  motion: z.boolean(),
  captions: z.boolean(),
  textSize: z.enum(["1", "1.125", "1.25"]),
});
export type Evidence = z.infer<typeof evidenceSchema>;
export type Reward = z.infer<typeof rewardSchema>;
