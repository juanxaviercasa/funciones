import { lessons, Lesson } from "../content";

import { Progress, studyTimeLabel } from "../persistence";

import { HeroVisual } from "../components/HeroVisual";

import { ProgressBar } from "../components/UI";

import { Screen } from "../routing";

export default function Dashboard({
  progress,
  recommendation,
  openLesson,
  go,
}: {
  progress: Progress;
  recommendation: Lesson | null;
  openLesson: (s: string) => void;
  go: (s: Screen) => void;
}) {
  return (
    <div className="page">
      <section className="hero">
        <div>
          <span className="kicker">TU SIGUIENTE PASO</span>
          <h1>
            Domina funciones.
            <br />
            <em>Visualiza cada idea.</em>
          </h1>
          <p>
            Avanza con explicaciones claras, gráficas que puedes tocar y
            práctica que se adapta a ti.
          </p>
          <div className="hero-actions">
            {recommendation ? (
              <button
                className="primary"
                onClick={() => openLesson(recommendation.id)}
              >
                {progress.completed.length
                  ? `Continuar: ${recommendation.title}`
                  : `Empezar: ${recommendation.title}`}{" "}
                <span>→</span>
              </button>
            ) : (
              <button className="primary" onClick={() => go("practica")}>
                Currículo completado · Practicar →
              </button>
            )}
            <button className="secondary" onClick={() => go("laboratorio")}>
              Abrir laboratorio
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <HeroVisual />
        </div>
      </section>
      <section className="stats">
        <div>
          <small>PROGRESO TOTAL</small>
          <b>
            {Math.round((progress.completed.length / lessons.length) * 100)}%
          </b>
          <ProgressBar
            value={(progress.completed.length / lessons.length) * 100}
          />
        </div>
        <div>
          <small>PRECISIÓN</small>
          <b>
            {progress.attempts
              ? `${Math.round((progress.correct / progress.attempts) * 100)}%`
              : "Sin datos"}
          </b>
          <span className="trend">
            {progress.attempts} intentos registrados
          </span>
        </div>
        <div>
          <small>TIEMPO DE ESTUDIO</small>
          <b>
            {studyTimeLabel(
              progress.studySessions.reduce(
                (total, session) => total + session.durationSeconds,
                0,
              ),
            )}
          </b>
          <span>Tiempo activo en esta pestaña</span>
        </div>
      </section>
      <div className="section-head">
        <div>
          <span className="kicker">CONTINÚA TU RUTA</span>
          <h2>Lecciones recomendadas</h2>
        </div>
        <button className="textbtn" onClick={() => go("ruta")}>
          Ver ruta completa →
        </button>
      </div>
      <section className="lesson-grid">
        {[
          ...lessons.filter(
            (lesson) => !progress.completed.includes(lesson.id),
          ),
        ]
          .sort(
            (first, second) =>
              Number(second.id === recommendation?.id) -
              Number(first.id === recommendation?.id),
          )
          .slice(0, 3)
          .map((l, i) => (
            <article className="lesson-card" key={l.id}>
              <div className={`lesson-art art-${i}`}>
                <span>
                  {i === 0
                    ? "[ −3  3 ]"
                    : i === 1
                      ? "y = mx + b"
                      : "y = ax² + bx + c"}
                </span>
              </div>
              <div className="lesson-body">
                <span className="tag">{l.eyebrow.split("·")[0]}</span>
                <h3>{l.title}</h3>
                <p>{l.objective}</p>
                <div className="card-foot">
                  <span>{l.durationMinutes} min</span>
                  <button
                    onClick={() => openLesson(l.id)}
                    aria-label={`Abrir ${l.title}`}
                  >
                    →
                  </button>
                </div>
              </div>
            </article>
          ))}
        {progress.completed.length === lessons.length && (
          <p className="empty-state">
            Completaste todas las lecciones publicadas. Puedes seguir
            practicando para consolidar lo aprendido.
          </p>
        )}
      </section>
      <section className="daily">
        <div>
          <span className="kicker">PRÁCTICA RECOMENDADA</span>
          <h2>Refuerza tu aprendizaje</h2>
          <p>
            Resuelve preguntas de distintas habilidades y mejora tu dominio con
            cada intento.
          </p>
        </div>
        <button className="primary" onClick={() => go("practica")}>
          Resolver reto
        </button>
      </section>
    </div>
  );
}
