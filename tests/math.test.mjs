import assert from "node:assert/strict";
import { build } from "esbuild";
import katex from "katex";

const loadModule = async (entryPoint) => {
  const result = await build({
    entryPoints: [entryPoint],
    bundle: true,
    format: "esm",
    platform: "node",
    write: false,
  });
  return import(
    `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`
  );
};

const math = await loadModule("src/math.ts");
const { evaluate, points, pointSegments, answerMatches, masteryAfter } = math;
const base = { a: 2, b: 1, h: 0, k: 1 };
assert.equal(evaluate(2, { ...base, family: "lineal" }), 5);
assert.equal(evaluate(3, { ...base, h: 1, k: -2, family: "cuadratica" }), 6);
assert.equal(evaluate(2, { ...base, family: "cubica" }), 17);
assert.equal(evaluate(-1, { ...base, family: "raiz" }), Number.NaN);
assert.equal(
  points({ ...base, family: "raiz" }).some(({ y }) => Number.isNaN(y)),
  false,
);
assert.equal(
  evaluate(0, { ...base, a: Number.POSITIVE_INFINITY, family: "lineal" }),
  Number.NaN,
);
assert.equal(evaluate(0, { ...base, family: "unsupported" }), Number.NaN);
const rootSegments = pointSegments(
  { ...base, a: 1, b: 1, h: 0, k: 0, family: "raiz" },
  -2,
  2,
  0.25,
);
assert.equal(rootSegments.length, 1);
assert.ok(
  rootSegments[0][0].x >= 0,
  "La curva raíz no debe dibujarse fuera del dominio",
);
const clippedSegments = pointSegments(
  { ...base, a: 1, b: 1, h: 0, k: -1, family: "cuadratica" },
  -2,
  2,
  0.25,
  0.5,
);
assert.ok(
  clippedSegments.length >= 2,
  "Los valores recortados deben separar segmentos",
);
assert.throws(() => pointSegments(base, -1, 1, 0), RangeError);
assert.throws(() => pointSegments(base, -1, 1, 0.00001), RangeError);
assert.throws(() => pointSegments(base, Number.NaN, 1), RangeError);
assert.equal(answerMatches(" −3 ", ["-3"]), true);
assert.equal(answerMatches("[2, 5)", ["[2, 5)"]), true);
assert.equal(masteryAfter(98, true, 1), 100);
assert.equal(masteryAfter(2, false, 1), 0);

const learning = await loadModule("src/learning.ts");
const emptyProgress = {
  xp: 0,
  streak: 0,
  completed: [],
  mastery: {},
  attempts: 0,
  correct: 0,
  studySessions: [],
};
const firstCompletion = learning.completeLesson(emptyProgress, "que-es");
assert.equal(firstCompletion.awarded, true);
assert.equal(firstCompletion.progress.xp, 80);
assert.deepEqual(learning.completeLesson(firstCompletion.progress, "que-es"), {
  progress: firstCompletion.progress,
  awarded: false,
});

const content = await loadModule("src/content.ts");
assert.equal(
  learning.recommendedLesson(content.lessons, emptyProgress).id,
  "que-es",
);
assert.equal(
  learning.recommendedLesson(content.lessons, firstCompletion.progress).id,
  "dominio",
);
const weakProgress = {
  ...firstCompletion.progress,
  mastery: { Dominio: 20, Gráficas: 80 },
};
assert.equal(
  learning.recommendedLesson(content.lessons, weakProgress).id,
  "dominio",
);
const lessonIds = new Set(content.lessons.map((lesson) => lesson.id));
assert.equal(lessonIds.size, content.lessons.length, "IDs de lección únicos");
for (const lesson of content.lessons) {
  assert.ok(lesson.skill && lesson.level && lesson.tags.length > 0);
  assert.ok(lesson.durationMinutes > 0);
  assert.ok(
    lesson.prerequisites.every((id) => lessonIds.has(id)),
    `${lesson.id} contiene un prerrequisito inexistente`,
  );
  for (const [index, question] of [
    lesson.challenge,
    lesson.secondChallenge,
  ].entries()) {
    assert.equal(
      new Set(question.options).size,
      question.options.length,
      `${lesson.id} pregunta ${index + 1}: opciones repetidas`,
    );
    assert.ok(
      question.correct >= 0 && question.correct < question.options.length,
    );
  }
}
for (const [moduleIndex, module] of content.modules.entries()) {
  if (moduleIndex > 0)
    assert.ok(
      content.lessons.some((lesson) => lesson.module === moduleIndex),
      `Módulo sin contenido: ${module[0]}`,
    );
}
for (const question of [...content.diagnostic, ...content.exerciseBank]) {
  assert.equal(
    new Set(question.options).size,
    question.options.length,
    `${question.id ?? question.q} tiene opciones duplicadas`,
  );
  assert.ok(
    question.correct >= 0 && question.correct < question.options.length,
  );
}
assert.equal(content.diagnostic.length, 20);
for (const question of content.diagnostic) {
  const index = Number(question.id.slice(1)) - 1;
  const n = (Math.floor(index / 8) % 7) + 1;
  const skillIndex = index % 8;
  const expectedSkill = [
    "Álgebra",
    "Notación",
    "Dominio",
    "Rango",
    "Gráficas",
    "Lineales",
    "Cuadráticas",
    "Transformaciones",
  ][skillIndex];
  assert.equal(
    question.skill,
    expectedSkill,
    `${question.id}: habilidad incorrecta`,
  );
  const expectedAnswer = [
    "3",
    String(2 * n + 2),
    String(n),
    "$y\\geq0$",
    `$x=${n}$`,
    `$${n}$`,
    `$(${n},2)$`,
    `Derecha ${n}`,
  ][skillIndex];
  assert.equal(
    question.options[question.correct],
    expectedAnswer,
    `${question.id}: respuesta incorrecta`,
  );
}
assert.equal(content.exerciseBank.length, 120);
for (const exercise of content.exerciseBank) {
  const item = Number(exercise.id.slice(exercise.id.lastIndexOf("E") + 1)) - 1;
  const moduleIndex = item % 8;
  const n = (item % 7) + 1;
  const quadratic = moduleIndex === 4 && Math.floor(item / 8) % 2 === 1;
  const expectedSkill =
    moduleIndex === 4
      ? quadratic
        ? "Cuadráticas"
        : "Lineales"
      : [
          "Álgebra",
          "Notación",
          "Dominio",
          "Rango",
          "Lineales",
          "Transformaciones",
          "Composición",
          "Modelación",
        ][moduleIndex];
  assert.equal(
    exercise.skill,
    expectedSkill,
    `${exercise.id}: habilidad incorrecta`,
  );
  const expectedAnswer =
    moduleIndex === 2
      ? String(n)
      : moduleIndex === 3
        ? "$y\\geq 0$"
        : moduleIndex === 5
          ? `Derecha ${n}`
          : moduleIndex === 6
            ? String(n + 2)
            : moduleIndex === 0
              ? "3"
              : moduleIndex === 4 && quadratic
                ? `$(${n},2)$`
                : moduleIndex === 4
                  ? `$${n}$`
                  : String(3 * n + 2);
  assert.equal(
    exercise.options[exercise.correct],
    expectedAnswer,
    `${exercise.id}: respuesta incorrecta`,
  );
}

const mathText = content.lessons
  .flatMap((lesson) => [
    lesson.intuition,
    lesson.formal,
    lesson.mistake,
    lesson.example.question,
    ...lesson.example.steps,
    lesson.challenge.q,
    ...lesson.challenge.options,
    lesson.challenge.why,
    lesson.secondChallenge.q,
    ...lesson.secondChallenge.options,
    lesson.secondChallenge.hint,
    lesson.secondChallenge.why,
  ])
  .concat(
    content.exerciseBank.flatMap((exercise) => [
      exercise.q,
      ...exercise.options,
      exercise.hint,
      exercise.explanation,
    ]),
  )
  .concat(
    content.diagnostic.flatMap((question) => [question.q, ...question.options]),
  );
for (const text of mathText) {
  for (const [, latex] of text.matchAll(/\$([^$]+)\$/g)) {
    assert.doesNotThrow(
      () => katex.renderToString(latex, { throwOnError: true }),
      `LaTeX inválido: ${latex}`,
    );
  }
}

assert.equal(
  content.exerciseBank.find((exercise) => exercise.module === 3).skill,
  "Rango",
);
assert.equal(
  content.exerciseBank.find((exercise) => exercise.module === 6).skill,
  "Composición",
);
assert.match(
  content.exerciseBank.find((exercise) => exercise.module === 3).q,
  /rango/i,
);
assert.match(
  content.exerciseBank.find((exercise) => exercise.module === 6).q,
  /f\\circ g/,
);
assert.equal(
  content.exerciseBank[6].options[content.exerciseBank[6].correct],
  "9",
);
assert.equal(
  content.exerciseBank[3].options[content.exerciseBank[3].correct],
  "$y\\geq 0$",
);

const persistence = await loadModule("src/persistence.ts");
const {
  loadProgress,
  saveProgress,
  loadPreferences,
  savePreferences,
  clearStoredData,
  recordStudyTime,
  recordAttempt,
  studyTimeLabel,
  createProgressExport,
  parseProgressImport,
  DEFAULT_PROGRESS,
  PROGRESS_KEY,
  PREVIOUS_PROGRESS_KEY,
} = persistence;
const createStorage = (seed = {}) => {
  const values = new Map(Object.entries(seed));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    values,
  };
};

assert.deepEqual(loadProgress(null), {
  value: DEFAULT_PROGRESS,
  status: "unavailable",
});
assert.equal(loadProgress(createStorage()).status, "fresh");
const legacyUserProgress = {
  xp: 120,
  streak: 2,
  completed: ["lineal"],
  mastery: { Lineales: 120 },
  attempts: 3,
  correct: 5,
};
const legacyStorage = createStorage({
  "funciones-progress": JSON.stringify(legacyUserProgress),
});
assert.deepEqual(loadProgress(legacyStorage), {
  value: {
    ...legacyUserProgress,
    correct: 3,
    mastery: { Lineales: 100 },
    studySessions: [],
    evidence: [],
    rewards: [],
    diagnosticCompleted: false,
    weeklyGoal: 20,
  },
  status: "migrated",
});
const demoStorage = createStorage({
  "funciones-progress": JSON.stringify({
    xp: 1240,
    streak: 7,
    completed: ["que-es"],
    attempts: 18,
    correct: 13,
    mastery: {
      Fundamentos: 72,
      Dominio: 58,
      Gráficas: 46,
      Lineales: 81,
      Cuadráticas: 39,
      Transformaciones: 24,
    },
  }),
});
assert.equal(loadProgress(demoStorage).status, "migrated");
assert.equal(loadProgress(demoStorage).value.xp, 0);
const corruptStorage = createStorage({ [PROGRESS_KEY]: "{" });
assert.equal(loadProgress(corruptStorage).status, "recovered");
assert.equal(saveProgress(legacyStorage, legacyUserProgress), true);
assert.equal(loadProgress(legacyStorage).status, "loaded");
assert.equal(
  savePreferences(legacyStorage, {
    theme: "dark",
    motion: false,
    captions: true,
    textSize: "1.25",
  }),
  true,
);
assert.deepEqual(loadPreferences(legacyStorage).value, {
  theme: "dark",
  motion: false,
  captions: true,
  textSize: "1.25",
});
assert.equal(clearStoredData(legacyStorage), true);
assert.equal(loadProgress(legacyStorage).status, "fresh");
const deniedStorage = {
  getItem() {
    throw Error("denied");
  },
  setItem() {
    throw Error("quota");
  },
  removeItem() {
    throw Error("denied");
  },
};
assert.equal(loadProgress(deniedStorage).status, "recovered");
assert.equal(saveProgress(deniedStorage, DEFAULT_PROGRESS), false);
assert.equal(savePreferences(null, {}), false);
const v2Storage = createStorage({
  [PREVIOUS_PROGRESS_KEY]: JSON.stringify({
    version: 2,
    data: legacyUserProgress,
  }),
});
assert.equal(loadProgress(v2Storage).status, "migrated");
assert.equal(loadProgress(v2Storage).value.xp, 120);
assert.equal(saveProgress(v2Storage, loadProgress(v2Storage).value), true);
assert.equal(loadProgress(v2Storage).status, "loaded");
const dayOne = new Date(2026, 8, 27, 12);
const dayTwo = new Date(2026, 8, 28, 12);
let tracked = recordStudyTime(DEFAULT_PROGRESS, 60, dayOne);
tracked = recordAttempt(tracked, "Lineales", true, dayOne);
tracked = recordStudyTime(tracked, 30, dayTwo);
assert.equal(tracked.streak, 2);
assert.equal(tracked.studySessions.length, 2);
assert.equal(tracked.studySessions[0].attempts, 1);
assert.equal(tracked.studySessions[0].correct, 1);
assert.equal(tracked.studySessions[0].durationSeconds, 60);
assert.equal(tracked.studySessions[1].durationSeconds, 30);
assert.equal(studyTimeLabel(3660), "1 h 1 min");
const exportText = createProgressExport(tracked, dayTwo);
assert.deepEqual(
  parseProgressImport(exportText),
  persistence.normalizeProgress(tracked),
);
assert.throws(() => parseProgressImport('{"progress":{}}'));

console.log("✓ Motor, contenido, LaTeX y persistencia verificados");
