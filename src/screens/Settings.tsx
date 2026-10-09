import React, { useState } from "react";

import {
  createProgressExport,
  Progress,
  parseProgressImport,
  TextSize,
} from "../persistence";

import { Setting } from "../components/UI";

export default function Settings({
  dark,
  setDark,
  motion,
  setMotion,
  captions,
  setCaptions,
  textSize,
  setTextSize,
  progress,
  onImportProgress,
  onReset,
}: {
  dark: boolean;
  setDark: (v: boolean) => void;
  motion: boolean;
  setMotion: (v: boolean) => void;
  captions: boolean;
  setCaptions: (v: boolean) => void;
  textSize: TextSize;
  setTextSize: (v: TextSize) => void;
  progress: Progress;
  onImportProgress: (progress: Progress) => void;
  onReset: () => void;
}) {
  const [importError, setImportError] = useState("");
  const exportProgress = () => {
    const blob = new Blob([createProgressExport(progress)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "funciones-lab-progreso.json";
    link.click();
    URL.revokeObjectURL(url);
  };
  const importProgress = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 1_048_576) throw new Error("Archivo demasiado grande");
      const imported = parseProgressImport(await file.text());
      if (
        !window.confirm(
          "¿Reemplazar el progreso local con esta copia? Exporta primero si necesitas conservarlo.",
        )
      )
        return;
      onImportProgress(imported);
      setImportError("");
    } catch {
      setImportError(
        "No se pudo importar: el archivo está dañado o no corresponde a Funciones Lab.",
      );
    }
    event.target.value = "";
  };
  return (
    <div className="page narrow">
      <div className="page-title">
        <span className="kicker">PREFERENCIAS</span>
        <h1>Ajustes de aprendizaje</h1>
        <p>Personaliza la experiencia para aprender cómodamente.</p>
      </div>
      <section className="settings-card">
        <Setting
          title="Tema oscuro"
          desc="Reduce el brillo y cambia la paleta."
          checked={dark}
          set={setDark}
        />
        <Setting
          title="Animaciones"
          desc="Reproduce transiciones y microlecciones."
          checked={motion}
          set={setMotion}
        />
        <Setting
          title="Subtítulos"
          desc="Muestra texto en todas las animaciones."
          checked={captions}
          set={setCaptions}
        />
        <div className="setting">
          <div>
            <b>Tamaño del texto</b>
            <p>Usa el zoom del navegador; la interfaz se adapta hasta 200%.</p>
          </div>
          <select
            aria-label="Tamaño del texto"
            value={textSize}
            onChange={(event) => setTextSize(event.target.value as TextSize)}
          >
            <option value="1">Normal</option>
            <option value="1.125">Grande</option>
            <option value="1.25">Muy grande</option>
          </select>
        </div>
        <div className="setting">
          <div>
            <b>Datos locales</b>
            <p>
              Borra el progreso y las preferencias guardadas en este
              dispositivo.
            </p>
          </div>
          <button className="secondary" onClick={onReset}>
            Reiniciar datos
          </button>
        </div>
        <div className="setting">
          <div>
            <b>Copia de seguridad</b>
            <p>Exporta el progreso o restaura una copia de Funciones Lab.</p>
            {importError && (
              <p role="alert" className="feedback bad">
                {importError}
              </p>
            )}
          </div>
          <div className="setting-actions">
            <button className="secondary" onClick={exportProgress}>
              Exportar
            </button>
            <label className="secondary file-button">
              Importar
              <input
                type="file"
                accept="application/json,.json"
                onChange={importProgress}
                aria-label="Importar copia de seguridad"
              />
            </label>
          </div>
        </div>
      </section>
    </div>
  );
}
