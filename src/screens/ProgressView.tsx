import { Progress, studyTimeLabel } from "../persistence";

import { ProgressBar } from "../components/UI";

export default function ProgressView({
  progress,
  setProgress,
}: {
  progress: Progress;
  setProgress: React.Dispatch<React.SetStateAction<Progress>>;
}) {
  const skills = Object.entries(progress.mastery);
  const cutoff = Date.now() - 7 * 86400000;
  const weekly = (progress.evidence ?? []).filter((e) => e.at >= cutoff).length;
  const latest = new Map(
    (progress.evidence ?? []).map((e) => [e.exerciseId, e]),
  );
  const due = [...latest.values()].filter(
    (e) => e.nextReview <= Date.now(),
  ).length;
  return (
    <div className="page">
      <div className="page-title">
        <span className="kicker">TU PROGRESO</span>
        <h1>Lo que ya sabes. Lo que sigue.</h1>
        <p>Actualizado con cada práctica y lección completada.</p>
      </div>
      <section className="mastery-card">
        <h2>Meta y próximos repasos</h2>
        <label>
          Meta de respuestas en 7 días{" "}
          <input
            type="number"
            min={1}
            max={100}
            value={progress.weeklyGoal ?? 20}
            onChange={(e) => {
              const goal = e.target.valueAsNumber;
              if (Number.isInteger(goal) && goal >= 1 && goal <= 100)
                setProgress((p) => ({ ...p, weeklyGoal: goal }));
            }}
          />
        </label>
        <p>
          {weekly}/{progress.weeklyGoal ?? 20} respuestas · {due} ejercicios
          listos para repasar.
        </p>
        <ProgressBar
          value={Math.min(100, (weekly / (progress.weeklyGoal ?? 20)) * 100)}
        />
      </section>
      <section className="stats progress-stats">
        <div>
          <small>XP TOTAL</small>
          <b>{progress.xp}</b>
          <span>Nivel {Math.floor(progress.xp / 500) + 1}</span>
        </div>
        <div>
          <small>PRECISIÓN GLOBAL</small>
          <b>
            {progress.attempts
              ? `${Math.round((progress.correct / progress.attempts) * 100)}%`
              : "Sin datos"}
          </b>
          <span>{progress.attempts} intentos registrados</span>
        </div>
        <div>
          <small>RACHA ACTUAL</small>
          <b>{progress.streak} días</b>
          <span>{progress.studySessions.length} días con actividad</span>
        </div>
        <div>
          <small>TIEMPO ACTIVO</small>
          <b>
            {studyTimeLabel(
              progress.studySessions.reduce(
                (total, session) => total + session.durationSeconds,
                0,
              ),
            )}
          </b>
          <span>Se pausa tras 5 min sin actividad</span>
        </div>
      </section>
      <div className="progress-layout">
        <section className="mastery-card">
          <h2>Mapa de dominio</h2>
          <p>
            Estimación a partir de intentos registrados; no es una calificación.
          </p>
          {skills.map(([s, v]) => (
            <div className="mastery-row" key={s}>
              <span>{s}</span>
              <ProgressBar value={v} />
              <b>{v}%</b>
            </div>
          ))}
        </section>
        <aside className="badges">
          <h2>Logros</h2>
          <div className="badge-grid">
            <div>
              <span>🔥</span>
              <b>{progress.streak} días</b>
              <small>Constancia</small>
            </div>
            <div>
              <span>◇</span>
              <b>
                {progress.completed.length > 0
                  ? "Lección completada"
                  : "Primera lección"}
              </b>
              <small>
                {progress.completed.length > 0 ? "Desbloqueado" : "Pendiente"}
              </small>
            </div>
            <div>
              <span>⚡</span>
              <b>{progress.correct} aciertos</b>
              <small>
                {progress.correct >= 10
                  ? "Desbloqueado"
                  : `${10 - progress.correct} para desbloquear`}
              </small>
            </div>
            <div className={progress.streak >= 3 ? "" : "locked"}>
              <span>♛</span>
              <b>Racha de 3 días</b>
              <small>
                {progress.streak >= 3
                  ? "Desbloqueado"
                  : `${3 - progress.streak} días restantes`}
              </small>
            </div>
          </div>
        </aside>
      </div>
      <section className="mastery-card study-history">
        <h2>Últimas respuestas</h2>
        {!(progress.evidence ?? []).length && <p>Sin evidencia todavía.</p>}
        <ul>
          {[...(progress.evidence ?? [])]
            .reverse()
            .slice(0, 10)
            .map((e) => (
              <li key={e.id}>
                <time dateTime={new Date(e.at).toISOString()}>
                  {new Date(e.at).toLocaleDateString("es")}
                </time>
                <span>
                  {e.skill}: {e.correct ? "Correcta" : "Por reforzar"}
                  {e.hinted ? " · con pista" : ""}
                </span>
                <span>
                  Repaso: {new Date(e.nextReview).toLocaleDateString("es")}
                </span>
              </li>
            ))}
        </ul>
      </section>
      <section className="mastery-card study-history">
        <h2>Actividad reciente</h2>
        {progress.studySessions.length === 0 ? (
          <p>
            Aún no hay sesiones registradas. Tu tiempo activo aparecerá aquí.
          </p>
        ) : (
          <ul>
            {[...progress.studySessions]
              .reverse()
              .slice(0, 7)
              .map((session) => (
                <li key={session.date}>
                  <time dateTime={session.date}>
                    {new Date(`${session.date}T12:00:00`).toLocaleDateString(
                      "es",
                      { weekday: "short", day: "numeric", month: "short" },
                    )}
                  </time>
                  <span>{studyTimeLabel(session.durationSeconds)}</span>
                  <span>
                    {session.correct}/{session.attempts} aciertos
                  </span>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
