import React, { useRef, useState } from "react";
import { diagnostic } from "../content";
import { shuffledChoices } from "../adaptive";
import { finishDiagnostic } from "../learning";
import { recordAttempt, type Progress } from "../persistence";
import { Screen } from "../routing";
import { MathText } from "../math-render";
import { ProgressBar } from "../components/UI";
import { useSessionState } from "../session";
export default function Assessment({
  progress,
  setProgress,
  go,
}: {
  progress: Progress;
  setProgress: React.Dispatch<React.SetStateAction<Progress>>;
  go: (screen: Screen) => void;
}) {
  const [questions, setQuestions] = useSessionState(
    "assessment-questions",
    () => diagnostic.map((q) => shuffledChoices(q)),
    (v): v is typeof diagnostic =>
      Array.isArray(v) &&
      v.length === diagnostic.length &&
      v.every(
        (q, i) =>
          q &&
          q.id === diagnostic[i].id &&
          q.q === diagnostic[i].q &&
          q.skill === diagnostic[i].skill &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          new Set(q.options).size === 4 &&
          q.options.every((o: unknown) =>
            diagnostic[i].options.includes(String(o)),
          ) &&
          q.options[q.correct] === diagnostic[i].options[diagnostic[i].correct],
      ),
  );
  const [results, setResults] = useSessionState<
    { skill: string; correct: boolean }[]
  >(
    "assessment-results",
    [],
    (v): v is { skill: string; correct: boolean }[] =>
      Array.isArray(v) &&
      v.length <= 20 &&
      v.every(
        (r, i) =>
          r &&
          r.skill === diagnostic[i].skill &&
          typeof r.correct === "boolean",
      ),
  );
  const [choice, setChoice] = useState<number | null>(null);
  const done = results.length === questions.length;
  const guard = useRef(false);
  const q = questions[results.length];
  if (done)
    return (
      <div className="page center-result">
        <h1>Diagnóstico completado</h1>
        <p>
          Tu resultado: {results.filter((r) => r.correct).length}/20. La ruta
          prioriza tus habilidades débiles y reconoce prerrequisitos con dominio
          demostrado.
        </p>
        <button className="primary" onClick={() => go("ruta")}>
          Ver mi ruta
        </button>
        <button
          className="secondary"
          onClick={() => {
            setResults([]);
            setQuestions(diagnostic.map((q) => shuffledChoices(q)));
            setChoice(null);
            guard.current = false;
          }}
        >
          Volver a evaluar
        </button>
      </div>
    );
  const submit = () => {
    if (choice === null || guard.current) return;
    guard.current = true;
    const correct = choice === q.correct;
    const next = [...results, { skill: q.skill, correct }];
    setProgress((p) => {
      const attempted = recordAttempt(p, q.skill, correct);
      return next.length === questions.length
        ? finishDiagnostic(attempted, next)
        : attempted;
    });
    setResults(next);
    setChoice(null);
    requestAnimationFrame(() => {
      guard.current = false;
      document.querySelector<HTMLElement>(".assessment h1")?.focus();
    });
  };
  return (
    <div className="page assessment">
      <span className="kicker">DIAGNÓSTICO · {results.length + 1} DE 20</span>
      {progress.diagnosticCompleted && (
        <p>
          Reevaluación: actualiza tu ruta. La recompensa inicial se entrega una
          sola vez.
        </p>
      )}
      <ProgressBar value={results.length * 5} />
      <h1 tabIndex={-1}>
        <MathText>{q.q}</MathText>
      </h1>
      <div className="options big">
        {q.options.map((o, i) => (
          <button
            key={o}
            aria-pressed={choice === i}
            className={choice === i ? "selected" : ""}
            onClick={() => setChoice(i)}
          >
            <span>{String.fromCharCode(65 + i)}</span>
            <MathText>{o}</MathText>
          </button>
        ))}
      </div>
      <button className="primary" disabled={choice === null} onClick={submit}>
        Confirmar y continuar
      </button>
    </div>
  );
}
