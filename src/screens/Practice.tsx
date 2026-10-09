import React, { lazy, Suspense, useRef, useState } from "react";
import {
  learningBank,
  numericAnswer,
  sessionQuestion,
  type Exercise,
} from "../exercises";
import { chooseExercise } from "../adaptive";
import { recordEvidence } from "../learning";
import { recordAttempt, type Progress } from "../persistence";
import { MathText } from "../math-render";
import { ProgressBar } from "../components/UI";
import { useSessionState } from "../session";
const MathInput = lazy(() => import("../components/MathInput"));
export default function Practice({
  progress,
  setProgress,
}: {
  progress: Progress;
  setProgress: React.Dispatch<React.SetStateAction<Progress>>;
}) {
  const [used, setUsed] = useSessionState<string[]>(
    "practice-used",
    [],
    (v): v is string[] =>
      Array.isArray(v) &&
      v.length <= 10 &&
      v.every((id) => learningBank.some((e) => e.id === id)),
  );
  const [exercise, setExercise] = useSessionState<Exercise>(
    "practice-exercise",
    () => sessionQuestion(chooseExercise(learningBank, progress)),
    (v): v is Exercise => {
      if (!v || typeof v !== "object") return false;
      const candidate = v as Exercise;
      const base = learningBank.find((e) => e.id === candidate.id);
      return (
        !!base &&
        candidate.q === base.q &&
        candidate.answer === base.answer &&
        candidate.skill === base.skill &&
        Array.isArray(candidate.options) &&
        candidate.options.length === 4 &&
        candidate.options.every((o) => base.options.includes(o)) &&
        new Set(candidate.options).size === 4 &&
        candidate.options[candidate.correct] === base.options[base.correct]
      );
    },
  );
  const [choice, setChoice] = useState<number | null>(null);
  const [free, setFree] = useState(false);
  const [answer, setAnswer] = useState("");
  const bool = (v: unknown): v is boolean => typeof v === "boolean";
  const [submitted, setSubmitted] = useSessionState(
    "practice-submitted",
    false,
    bool,
  );
  const [hintLevel, setHintLevel] = useSessionState(
    "practice-hint",
    0,
    (v): v is number => Number.isInteger(v) && Number(v) >= 0 && Number(v) <= 2,
  );
  const [correct, setCorrect] = useSessionState(
    "practice-correct",
    false,
    bool,
  );
  const [score, setScore] = useSessionState(
    "practice-score",
    0,
    (v): v is number =>
      Number.isInteger(v) && Number(v) >= 0 && Number(v) <= 10,
  );
  const [done, setDone] = useSessionState("practice-done", false, bool);
  const guard = useRef(submitted);
  const submit = () => {
    if (
      guard.current ||
      (free ? numericAnswer(answer) === null : choice === null)
    )
      return;
    guard.current = true;
    const ok = free
      ? Math.abs(numericAnswer(answer)! - exercise.answer) < 1e-8
      : choice === exercise.correct;
    setCorrect(ok);
    setSubmitted(true);
    if (ok) setScore((s) => s + 1);
    const id = crypto.randomUUID();
    setProgress((p) =>
      recordAttempt(
        recordEvidence(
          p,
          exercise.id,
          exercise.skill,
          ok,
          hintLevel > 0,
          Date.now(),
          id,
        ),
        exercise.skill,
        ok,
      ),
    );
  };
  const next = () => {
    const excluded = [...used, exercise.id];
    setUsed(excluded);
    if (excluded.length === 10) {
      setDone(true);
      return;
    }
    setExercise(
      sessionQuestion(chooseExercise(learningBank, progress, excluded)),
    );
    setChoice(null);
    setAnswer("");
    setSubmitted(false);
    setHintLevel(0);
    guard.current = false;
  };
  if (done)
    return (
      <div className="page center-result">
        <h1>Práctica completada</h1>
        <p>
          Acertaste {score} de 10. Tus repasos pendientes ya están programados.
        </p>
        <button
          className="primary"
          onClick={() => {
            setUsed([]);
            setScore(0);
            setDone(false);
            setExercise(
              sessionQuestion(chooseExercise(learningBank, progress)),
            );
            setChoice(null);
            setAnswer("");
            setSubmitted(false);
            setHintLevel(0);
            guard.current = false;
          }}
        >
          Empezar otra sesión
        </button>
      </div>
    );
  return (
    <div className="page practice-page">
      <div className="practice-top">
        <div>
          <span className="kicker">PRÁCTICA ADAPTATIVA</span>
          <h1 tabIndex={-1}>{exercise.skill}</h1>
        </div>
        <div className="session-score">
          <span>Pregunta {used.length + 1}/10</span>
          <ProgressBar value={used.length * 10} />
        </div>
      </div>
      <div className="practice-layout">
        <article className="question-card">
          <div className="question-meta">
            <span className="tag">{exercise.difficulty}</span>
            <span>XP por primer acierto</span>
          </div>
          <h2>
            <MathText>{exercise.q}</MathText>
          </h2>
          <label>
            <input
              type="checkbox"
              checked={free}
              disabled={submitted}
              onChange={(e) => {
                setFree(e.target.checked);
                setChoice(null);
                setAnswer("");
              }}
            />{" "}
            Escribir respuesta matemática
          </label>
          {free ? (
            <Suspense
              fallback={<p role="status">Cargando teclado matemático…</p>}
            >
              <MathInput
                value={answer}
                onChange={setAnswer}
                disabled={submitted}
              />
            </Suspense>
          ) : (
            <div className="options big" role="group" aria-label="Respuestas">
              {exercise.options.map((option, i) => (
                <button
                  key={option}
                  aria-pressed={choice === i}
                  disabled={submitted}
                  className={
                    submitted
                      ? i === exercise.correct
                        ? "correct"
                        : choice === i
                          ? "wrong"
                          : ""
                      : choice === i
                        ? "selected"
                        : ""
                  }
                  onClick={() => setChoice(i)}
                >
                  <span>{String.fromCharCode(65 + i)}</span>
                  <MathText>{option}</MathText>
                </button>
              ))}
            </div>
          )}
          {hintLevel > 0 && (
            <div className="hint">
              <MathText>
                {hintLevel === 1 ? exercise.hint : exercise.explanation}
              </MathText>
            </div>
          )}
          {submitted && (
            <div role="status" className={`feedback ${correct ? "ok" : "bad"}`}>
              <b>{correct ? "Respuesta correcta" : "Vamos a corregirlo"}</b>
              <p>
                <MathText>{exercise.explanation}</MathText>
              </p>
              {!correct && (
                <p>Volverás a trabajar este concepto en un repaso dirigido.</p>
              )}
            </div>
          )}
          <div className="question-actions">
            <button
              className="textbtn"
              disabled={hintLevel >= 2 || submitted}
              onClick={() => setHintLevel((l) => l + 1)}
            >
              {hintLevel ? "Ver solución guiada" : "Ver pista"}
            </button>
            {submitted ? (
              <button className="primary" onClick={next}>
                Siguiente →
              </button>
            ) : (
              <button
                className="primary"
                disabled={
                  free ? numericAnswer(answer) === null : choice === null
                }
                onClick={submit}
              >
                Comprobar
              </button>
            )}
          </div>
        </article>
        <aside className="skill-card">
          <small>EVIDENCIA DE DOMINIO</small>
          <div
            className="skill-ring"
            style={
              {
                "--value": `${progress.mastery[exercise.skill] ?? 0}%`,
              } as React.CSSProperties
            }
          >
            <b>{progress.mastery[exercise.skill] ?? 0}%</b>
          </div>
          <p>
            La selección considera tus errores, nivel y fecha del próximo
            repaso. Las pistas aportan menos evidencia de dominio.
          </p>
        </aside>
      </div>
    </div>
  );
}
