import { describe, expect, it } from "vitest";
import katex from "katex";
import {
  evaluate,
  getDomainAndRange,
  getTangentLine,
  functionLatex,
  parameterKey,
  pointSegments,
  points,
  getPointsOfInterest,
  answerMatches,
  masteryAfter,
  type Params,
} from "../src/math";
import { chooseExercise, shuffledChoices } from "../src/adaptive";
import { learningBank, numericAnswer } from "../src/exercises";
import {
  awardOnce,
  completeLesson,
  finishDiagnostic,
  recordEvidence,
  recommendedLesson,
  moduleCompletion,
  recordExerciseAnswer,
} from "../src/learning";
import {
  DEFAULT_PROGRESS,
  createProgressExport,
  parseProgressImport,
  normalizeProgress,
  recordAttempt,
} from "../src/persistence";
import { mergeProgress } from "../src/sync/merge";
import { lessons } from "../src/content";
const p: Params = { a: 2, b: 3, h: 1, k: -2, family: "cuadratica" };
describe("Matemática y banco", () => {
  it("identifica el mismo reto aunque cambie el orden de propiedades", () => {
    expect(parameterKey(p)).toBe(
      parameterKey({ family: p.family, k: p.k, h: p.h, b: p.b, a: p.a }),
    );
  });
  it("cubre puntos notables y raíces de todas las familias y degeneraciones", () => {
    for (const family of [
      "lineal",
      "cuadratica",
      "cubica",
      "absoluto",
      "raiz",
    ] as const) {
      for (const a of [-2, 0, 2])
        for (const b of [-1, 0, 1])
          for (const k of [-2, 0, 2]) {
            const params = { family, a, b, h: 1, k };
            const poi = getPointsOfInterest(params);
            for (const point of poi)
              expect(evaluate(point.x, params)).toBeCloseTo(point.y, 6);
            if (a === 0 || b === 0)
              expect(poi.some((v) => v.type === "vertice")).toBe(false);
            const info = getDomainAndRange(params);
            expect(info.domainLatex.length).toBeGreaterThan(0);
          }
    }
    expect(
      points({ ...p, family: "raiz" }, -2, 2, 0.1).every((v) =>
        Number.isFinite(v.y),
      ),
    ).toBe(true);
    expect(() => pointSegments(p, 3, -3, 0.1)).toThrow(RangeError);
    expect(() => pointSegments(p, 0, 2, -1)).toThrow(RangeError);
    expect(() => pointSegments(p, -100, 100, 0.00001)).toThrow(RangeError);
    expect(evaluate(NaN, p)).toBeNaN();
    expect(evaluate(2, { ...p, a: Infinity })).toBeNaN();
    expect(answerMatches(" 3 ", ["3"])).toBe(true);
    expect(answerMatches("2", ["3"])).toBe(false);
    expect(masteryAfter(98, true, 1)).toBe(100);
    expect(masteryAfter(2, false, 1)).toBe(0);
  });
  it("evalúa y deriva todas las familias", () => {
    for (const family of [
      "lineal",
      "cuadratica",
      "cubica",
      "absoluto",
      "raiz",
    ] as const) {
      const params = { ...p, family };
      const x = 2;
      const d = 0.00001;
      const approx =
        (evaluate(x + d, params) - evaluate(x - d, params)) / (2 * d);
      expect(getTangentLine(x, params)!.slope).toBeCloseTo(approx, 4);
      expect(() =>
        katex.renderToString(functionLatex(params), { throwOnError: true }),
      ).not.toThrow();
    }
  });
  it("no inventa tangentes en esquinas o raíz límite", () => {
    expect(getTangentLine(1, { ...p, family: "absoluto" })).toBeNull();
    expect(getTangentLine(1, { ...p, family: "raiz" })).toBeNull();
    expect(getTangentLine(0, { ...p, family: "raiz" })).toBeNull();
    expect(getTangentLine(2, p, 0)).toBeNull();
  });
  it("respeta dominio de raíz y funciones constantes", () => {
    for (const family of [
      "lineal",
      "cuadratica",
      "cubica",
      "absoluto",
      "raiz",
    ] as const) {
      expect(
        getDomainAndRange({ ...p, family, b: 0 }).rangeInterval,
      ).toMatchObject({ start: -2, end: -2 });
      expect(getTangentLine(2, { ...p, family, b: 0 })!.slope).toBe(0);
    }
    expect(
      getDomainAndRange({ ...p, a: 0, family: "raiz" }).domainInterval.start,
    ).toBe(1);
    expect(
      getDomainAndRange({ ...p, a: 0, family: "cuadratica" }).domainInterval
        .start,
    ).toBeNull();
    expect(
      getDomainAndRange({ ...p, b: -1, family: "raiz" }).domainInterval.end,
    ).toBe(1);
    expect(
      pointSegments({ ...p, family: "raiz" }, -3, 3, 0.05)
        .flat()
        .every((v) => v.x >= 1),
    ).toBe(true);
  });
  it("tiene 243 ejercicios válidos, distintos y renderizables", () => {
    expect(learningBank).toHaveLength(243);
    expect(new Set(learningBank.map((e) => e.id)).size).toBe(243);
    expect(new Set(learningBank.map((e) => e.skill)).size).toBe(11);
    for (const e of learningBank) {
      expect(new Set(e.options).size).toBe(4);
      expect(numericAnswer(e.options[e.correct].replaceAll("$", ""))).toBe(
        e.answer,
      );
      for (const text of [e.q, e.explanation, ...e.options]) {
        expect(text).not.toMatch(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/);
        for (const [, latex] of text.matchAll(/\$([^$]+)\$/g))
          expect(() =>
            katex.renderToString(latex, { throwOnError: true }),
          ).not.toThrow();
      }
    }
  });
  it("analiza números y fracciones sin ejecutar código", () => {
    expect(numericAnswer("−1,5")).toBe(-1.5);
    expect(numericAnswer("3/2")).toBe(1.5);
    expect(numericAnswer("\\frac{3}{2}")).toBe(1.5);
    for (const s of ["1/0", "NaN", "Infinity", "alert(1)", "2+2", ""])
      expect(numericAnswer(s)).toBeNull();
  });
  it("mezcla opciones sin perder la respuesta", () => {
    const e = learningBank[0];
    const shuffled = shuffledChoices(e, () => 0);
    expect(shuffled.options[shuffled.correct]).toBe(e.options[e.correct]);
    expect(e.correct).toBe(0);
  });
});
describe("Evidencia, persistencia y sincronización", () => {
  it("calcula ruta y finalización a partir de prerrequisitos", () => {
    let progress = { ...DEFAULT_PROGRESS };
    for (const lesson of lessons)
      progress = completeLesson(progress, lesson.id).progress;
    expect(recommendedLesson(lessons, progress)).toBeNull();
    expect(moduleCompletion(1, progress)).toBe(100);
    expect(moduleCompletion(99, progress)).toBe(0);
    expect(recordExerciseAnswer(DEFAULT_PROGRESS, "Álgebra", true, 10).xp).toBe(
      10,
    );
    expect(
      recommendedLesson(lessons, {
        ...DEFAULT_PROGRESS,
        mastery: { Dominio: 20, Fundamentos: 100 },
        diagnosticCompleted: true,
      }),
    ).not.toBeNull();
  });
  it("premia una vez lecciones, diagnóstico y ejercicios", () => {
    const a = completeLesson(DEFAULT_PROGRESS, lessons[0].id);
    expect(a.awarded).toBe(true);
    expect(completeLesson(a.progress, lessons[0].id).progress.xp).toBe(80);
    expect(completeLesson(DEFAULT_PROGRESS, "inventada").awarded).toBe(false);
    const d = finishDiagnostic(DEFAULT_PROGRESS, [
      { skill: "Álgebra", correct: true },
    ]);
    expect(finishDiagnostic(d, [{ skill: "Álgebra", correct: false }]).xp).toBe(
      100,
    );
    const one = recordEvidence(
      DEFAULT_PROGRESS,
      "ex",
      "Álgebra",
      true,
      false,
      1000,
      "a",
    );
    expect(
      recordEvidence(one, "ex", "Álgebra", true, false, 2000, "b").xp,
    ).toBe(20);
    expect(recordEvidence(one, "ex", "Álgebra", true, false, 1000, "a")).toBe(
      one,
    );
  });
  it("programa errores y pistas antes que aciertos sin ayuda", () => {
    const wrong = recordEvidence(
      DEFAULT_PROGRESS,
      "ex",
      "Dominio",
      false,
      false,
      0,
      "a",
    );
    expect(wrong.evidence![0].nextReview).toBe(3600000);
    const good = recordEvidence(
      wrong,
      "ex",
      "Dominio",
      true,
      false,
      4000000,
      "b",
    );
    expect(good.evidence![1].intervalDays).toBe(1);
    const next = recordEvidence(
      good,
      "ex",
      "Dominio",
      true,
      false,
      90000000,
      "c",
    );
    expect(next.evidence![2].intervalDays).toBe(3);
  });
  it("elige excluyendo preguntas usadas y soporta bancos vacíos", () => {
    expect(
      chooseExercise(
        learningBank,
        DEFAULT_PROGRESS,
        [learningBank[0].id],
        0,
        () => 0,
      ).id,
    ).not.toBe(learningBank[0].id);
    expect(() => chooseExercise([], DEFAULT_PROGRESS)).toThrow();
    expect(recommendedLesson(lessons, DEFAULT_PROGRESS)).not.toBeNull();
  });
  it("valida copias y fechas, sin perder progreso parcial", () => {
    const data = normalizeProgress({
      ...DEFAULT_PROGRESS,
      mastery: { Álgebra: 60 },
      completed: [lessons[0].id],
    });
    expect(parseProgressImport(createProgressExport(data))).toEqual(data);
    for (const value of [
      { ...data, correct: 2 },
      { ...data, xp: -1 },
      { ...data, completed: ["fake"] },
      {
        ...data,
        studySessions: [
          { date: "2026-02-31", durationSeconds: 0, attempts: 0, correct: 0 },
        ],
      },
    ])
      expect(() =>
        parseProgressImport(
          JSON.stringify({ app: "funciones-lab", version: 1, progress: value }),
        ),
      ).toThrow();
    expect(() => parseProgressImport(" ".repeat(1048577))).toThrow();
  });
  it("fusiona eventos y premios sin duplicarlos", () => {
    const a = recordAttempt(
      recordEvidence(DEFAULT_PROGRESS, "a", "Álgebra", true, false, 1000, "a"),
      "Álgebra",
      true,
    );
    const b = recordAttempt(
      recordEvidence(DEFAULT_PROGRESS, "b", "Dominio", false, false, 2000, "b"),
      "Dominio",
      false,
    );
    const merged = mergeProgress(a, b);
    expect(merged.attempts).toBe(2);
    expect(merged.correct).toBe(1);
    expect(merged.xp).toBe(20);
    expect(mergeProgress(merged, a)).toEqual(merged);
    expect(mergeProgress(a, b)).toEqual(mergeProgress(b, a));
    expect(
      mergeProgress(
        awardOnce(DEFAULT_PROGRESS, "same", 40, 1000),
        awardOnce(DEFAULT_PROGRESS, "same", 40, 1000),
      ).xp,
    ).toBe(40);
  });
});
