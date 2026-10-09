import { useState } from "react";
import { CloudAccount } from "./CloudAccount";
import type { Progress } from "../persistence";

export function EntryScreen({
  progress,
  setProgress,
  onLocal,
  onAccount,
}: {
  progress: Progress;
  setProgress: React.Dispatch<React.SetStateAction<Progress>>;
  onLocal: () => void;
  onAccount: () => void;
}) {
  const [mode, setMode] = useState<"login" | "register" | null>(null);
  return (
    <main className="entry-screen">
      <div className="entry-intro">
        <span className="kicker">FUNCIONES LAB</span>
        <h1>¿Cómo quieres guardar tu aprendizaje?</h1>
        <p>
          Elige cómo continuar antes de empezar. Puedes cambiar de opción más
          adelante desde Cuenta.
        </p>
      </div>
      {mode ? (
        <>
          <CloudAccount
            key={mode}
            initialMode={mode}
            progress={progress}
            setProgress={setProgress}
            onContinue={onAccount}
          />
          <button className="secondary" onClick={() => setMode(null)}>
            Volver a las opciones
          </button>
          <button className="text-button" onClick={onLocal}>
            Continuar en este dispositivo
          </button>
        </>
      ) : (
        <div className="entry-options">
          <section className="plan-card">
            <h2>Con una cuenta</h2>
            <p>
              Respalda tus avances en la nube y recupéralos al iniciar sesión en
              otro dispositivo.
            </p>
            <p>Tu progreso se sincroniza mientras tienes conexión.</p>
            <button className="primary" onClick={() => setMode("register")}>
              Crear cuenta gratuita
            </button>
            <button className="secondary" onClick={() => setMode("login")}>
              Ya tengo cuenta · Iniciar sesión
            </button>
          </section>
          <section className="plan-card">
            <h2>En este dispositivo</h2>
            <p>
              Tus avances se guardan solo en este navegador. No tendrás un
              respaldo en la nube ni podrás recuperarlos en otro equipo.
            </p>
            <p>
              Si borras los datos del navegador, puedes perder tu progreso.
              Podrás crear una cuenta después.
            </p>
            <button className="secondary" onClick={onLocal}>
              Continuar en este dispositivo
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
