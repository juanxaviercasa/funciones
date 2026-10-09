import { useState } from "react";
import { parseProgressImport, type Progress } from "../persistence";
export default function Teacher() {
  const [rows, setRows] = useState<{ name: string; progress: Progress }[]>([]);
  const [error, setError] = useState("");
  return (
    <section className="page">
      <span className="kicker">SEGUIMIENTO DOCENTE LOCAL</span>
      <h1 tabIndex={-1}>Evidencia del grupo</h1>
      <p>
        Importa respaldos que los estudiantes hayan compartido con
        consentimiento. Los archivos se procesan solo en este navegador; no se
        guardan ni envían. Los XP no son calificaciones verificadas.
      </p>
      <label className="secondary file-button">
        Importar respaldos{" "}
        <input
          type="file"
          multiple
          accept=".json,application/json"
          onChange={async (e) => {
            const files = Array.from(e.target.files ?? []);
            const imported: typeof rows = [];
            const failures: string[] = [];
            for (const file of files.slice(0, 100)) {
              try {
                if (file.size > 1048576) throw Error();
                imported.push({
                  name: file.name.replace(/\.json$/i, ""),
                  progress: parseProgressImport(await file.text()),
                });
              } catch {
                failures.push(file.name);
              }
            }
            setRows((old) => [...old, ...imported].slice(-100));
            setError(
              failures.length
                ? `Archivos rechazados: ${failures.join(", ")}`
                : "",
            );
            e.target.value = "";
          }}
        />
      </label>
      <button className="secondary" onClick={() => setRows([])}>
        Vaciar grupo
      </button>
      {error && <p role="alert">{error}</p>}
      <div
        className="table-scroll"
        tabIndex={0}
        role="region"
        aria-label="Resultados del grupo, desplaza con las flechas"
      >
        <table>
          <caption>{rows.length} respaldos importados</caption>
          <thead>
            <tr>
              <th>Respaldo</th>
              <th>Intentos</th>
              <th>Aciertos</th>
              <th>Lecciones</th>
              <th>Prioridad de apoyo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <th scope="row">{r.name}</th>
                <td>{r.progress.attempts}</td>
                <td>
                  {r.progress.attempts
                    ? Math.round(
                        (r.progress.correct / r.progress.attempts) * 100,
                      ) + "%"
                    : "Sin evidencia"}
                </td>
                <td>{r.progress.completed.length}</td>
                <td>
                  {Object.entries(r.progress.mastery)
                    .sort((a, b) => a[1] - b[1])
                    .slice(0, 2)
                    .map(([s, v]) => `${s} (${v}%)`)
                    .join(", ") || "Realizar diagnóstico"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
