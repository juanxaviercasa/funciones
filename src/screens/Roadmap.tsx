import { lessons, modules } from "../content";

import { Progress } from "../persistence";

import { ProgressBar } from "../components/UI";
import { moduleCompletion, recommendedLesson } from "../learning";
import { Screen } from "../routing";

export default function Roadmap({
  openLesson,
  go,
  progress,
}: {
  openLesson: (s: string) => void;
  go: (s: Screen) => void;
  progress: Progress;
}) {
  const recommendation = recommendedLesson(lessons, progress);
  return (
    <div className="page narrow">
      <div className="page-title">
        <span className="kicker">RUTA DE APRENDIZAJE</span>
        <h1>De la intuición al dominio</h1>
        <p>
          8 módulos · {lessons.length} lecciones disponibles · progreso guardado
          en tu dispositivo
        </p>
      </div>
      {recommendation && (
        <section className="mastery-card">
          <h2>Tu siguiente paso recomendado</h2>
          <p>
            {recommendation.title} · {recommendation.skill}. Considera tu
            evidencia y los prerrequisitos; todas las lecciones siguen
            disponibles para explorar.
          </p>
          <button
            className="primary"
            onClick={() => openLesson(recommendation.id)}
          >
            Abrir recomendación
          </button>
        </section>
      )}
      <div className="roadmap">
        {modules.map((m, i) => (
          <article key={m[0]} className="module">
            <div
              className={`module-no ${moduleCompletion(i, progress) > 0 ? "started" : ""}`}
            >
              {i}
            </div>
            <div className="module-main">
              <div>
                <span>MÓDULO {i}</span>
                <h2>{m[0]}</h2>
                <p>{m[1]}</p>
              </div>
              <div className="module-progress">
                {lessons.some((lesson) => lesson.module === i) ? (
                  <>
                    <b>{moduleCompletion(i, progress)}%</b>
                    <ProgressBar value={moduleCompletion(i, progress)} />
                  </>
                ) : i === 0 ? (
                  <small>Diagnóstico disponible</small>
                ) : (
                  <small>Próximamente</small>
                )}
              </div>
              {i === 0 && (
                <button
                  className="module-lesson"
                  onClick={() => go("evaluacion")}
                >
                  <span>◉</span>
                  <div>
                    <b>Diagnóstico de entrada</b>
                    <small>20 preguntas · ruta personalizada</small>
                  </div>
                  <i>→</i>
                </button>
              )}
              {lessons
                .filter((l) => l.module === i)
                .map((l) => (
                  <button
                    key={l.id}
                    className="module-lesson"
                    onClick={() => openLesson(l.id)}
                  >
                    <span>◉</span>
                    <div>
                      <b>{l.title}</b>
                      <small>
                        {l.skill} · {l.level} · {l.durationMinutes} min
                      </small>
                      {l.prerequisites.length > 0 && (
                        <small>
                          Requiere:{" "}
                          {l.prerequisites
                            .map(
                              (id) =>
                                lessons.find((item) => item.id === id)?.title ??
                                id,
                            )
                            .join(", ")}
                        </small>
                      )}
                    </div>
                    <i>→</i>
                  </button>
                ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
