import React, { useState } from "react";

import { Lesson } from "../content";
import { Params } from "../math";
import { MathText } from "../math-render";

import { InteractiveGraph } from "../components/InteractiveGraph";
import { InteractiveFunctionMachine } from "../components/InteractiveFunctionMachine";

import { ProgressBar } from "../components/UI";

const MicroLesson = React.lazy(() => import("../components/MicroLesson"));

export default function LessonView({
  lesson,
  completed,
  motion,
  onBack,
  onDone,
}: {
  lesson: Lesson;
  completed: boolean;
  motion: boolean;
  onBack: () => void;
  onDone: (id: string) => void;
}) {
  const [choices, setChoices] = useState<Record<number, number>>({});
  const [showHints, setShowHints] = useState<Record<number, boolean>>({});
  const [steps, setSteps] = useState(1);
  const [graphParams, setGraphParams] = useState<Params>(() => ({
    a: lesson.id === "lineal" ? 2 : 1,
    b: 1,
    h: lesson.id === "dominio" ? 2 : lesson.id === "cuadratica" ? 1 : 0,
    k: lesson.id === "cuadratica" ? -2 : 0,
    family:
      lesson.id === "lineal"
        ? "lineal"
        : lesson.id === "dominio"
          ? "raiz"
          : "cuadratica",
  }));
  const challenges = [lesson.challenge, lesson.secondChallenge];
  const correctChecks = challenges.filter(
    (challenge, index) => choices[index] === challenge.correct,
  ).length;
  return (
    <div className="page lesson-page">
      <div className="lesson-header">
        <button className="back" onClick={onBack}>
          ← Volver
        </button>
        <span>{lesson.eyebrow}</span>
        <ProgressBar
          value={completed ? 100 : (correctChecks / challenges.length) * 80}
        />
      </div>
      <div className="lesson-layout">
        <article className="lesson-content">
          <span className="kicker">OBJETIVO</span>
          <h1>{lesson.title}</h1>
          <p className="lead">{lesson.objective}</p>
          <section className="concept" id="lesson-intuition">
            <h2>La idea, primero</h2>
            <p>{lesson.intuition}</p>
            {lesson.id === "que-es" ? (
              <div style={{ marginTop: 20 }}>
                <InteractiveFunctionMachine />
              </div>
            ) : (
              <div style={{ marginTop: 20 }}>
                <InteractiveGraph
                  params={graphParams}
                  onChangeParams={setGraphParams}
                  showPOI={true}
                  showDomainRange={lesson.id === "dominio"}
                  showGhostBase={lesson.id === "transformaciones"}
                  showTangent={lesson.id === "lineal"}
                  interactivePoints={true}
                />
              </div>
            )}
          </section>
          {(lesson.id === "que-es" || lesson.id === "transformaciones") && (
            <React.Suspense fallback={<p>Cargando microlección…</p>}>
              <MicroLesson transformation={lesson.id === "transformaciones"} />
            </React.Suspense>
          )}
          <section id="lesson-definition">
            <h2>Definición formal</h2>
            <div className="definition">
              <MathText>{lesson.formal}</MathText>
            </div>
          </section>
          <section id="lesson-example">
            <h2>Ejemplo resuelto</h2>
            <div className="worked">
              <b>
                <MathText>{lesson.example.question}</MathText>
              </b>
              {lesson.example.steps.slice(0, steps).map((s, i) => (
                <div className="step" key={s}>
                  <span>{i + 1}</span>
                  <p>
                    <MathText>{s}</MathText>
                  </p>
                </div>
              ))}
              {steps < lesson.example.steps.length && (
                <button
                  className="secondary"
                  onClick={() => setSteps((s) => s + 1)}
                >
                  Mostrar siguiente paso
                </button>
              )}
            </div>
          </section>
          <section id="lesson-practice">
            <h2>Comprueba tu comprensión</h2>
            {challenges.map((challenge, challengeIndex) => {
              const selected = choices[challengeIndex];
              const isCorrect = selected === challenge.correct;
              return (
                <div
                  className="quiz"
                  key={`${lesson.id}-check-${challengeIndex}`}
                >
                  <b>
                    <MathText>{challenge.q}</MathText>
                  </b>
                  <div className="options">
                    {challenge.options.map((option, optionIndex) => (
                      <button
                        key={option}
                        disabled={isCorrect}
                        className={
                          selected === optionIndex
                            ? isCorrect
                              ? "correct"
                              : "wrong"
                            : ""
                        }
                        onClick={() =>
                          setChoices((current) => ({
                            ...current,
                            [challengeIndex]: optionIndex,
                          }))
                        }
                      >
                        <span>{String.fromCharCode(65 + optionIndex)}</span>
                        <MathText>{option}</MathText>
                      </button>
                    ))}
                  </div>
                  {selected !== undefined && (
                    <div className={isCorrect ? "feedback ok" : "feedback bad"}>
                      <b>{isCorrect ? "¡Exacto!" : "Aún no."}</b>{" "}
                      {isCorrect ? (
                        <MathText>{challenge.why}</MathText>
                      ) : (
                        "Revisa la pista y vuelve a intentarlo."
                      )}
                    </div>
                  )}
                  <button
                    className="textbtn"
                    onClick={() =>
                      setShowHints((current) => ({
                        ...current,
                        [challengeIndex]: !current[challengeIndex],
                      }))
                    }
                  >
                    💡 {showHints[challengeIndex] ? "Ocultar" : "Ver"} pista
                  </button>
                  {showHints[challengeIndex] && (
                    <p className="hint">
                      <MathText>{challenge.hint}</MathText>
                    </p>
                  )}
                </div>
              );
            })}
          </section>
          <button
            className="primary complete"
            disabled={completed || correctChecks !== challenges.length}
            onClick={() => onDone(lesson.id)}
          >
            {completed
              ? "Lección completada"
              : correctChecks === challenges.length
                ? "Completar lección · +80 XP"
                : `Responde las ${challenges.length} comprobaciones para completar`}
          </button>
        </article>
        <aside className="lesson-aside">
          <div className="aside-card">
            <small>EN ESTA LECCIÓN</small>
            {["intuition", "definition", "example", "practice"].map((id, i) => (
              <button
                key={id}
                className="textbtn"
                onClick={() =>
                  document.getElementById(`lesson-${id}`)?.scrollIntoView({
                    behavior: motion ? "smooth" : "instant",
                  })
                }
              >
                {i + 1}. {["Intuición", "Definición", "Ejemplo", "Práctica"][i]}
              </button>
            ))}
          </div>
          <div className="aside-card warning">
            <b>Error frecuente</b>
            <p>{lesson.mistake}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
