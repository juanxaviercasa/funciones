import { useState } from "react";
import {
  ArrowRight,
  Sparkles,
  MoveUpRight,
  SlidersHorizontal,
  CheckCircle2,
  Cloud,
  ChevronDown,
  BookOpen,
  Target,
} from "lucide-react";
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
  const [shift, setShift] = useState(0);
  const showAccount = (value: "login" | "register") => {
    setMode(value);
    requestAnimationFrame(() =>
      document
        .getElementById("landing-account")
        ?.scrollIntoView({ block: "start" }),
    );
  };
  return (
    <div className="learning-landing">
      <header className="landing-nav">
        <a className="landing-brand" href="#">
          <span>ƒ</span>Funciones<span className="brand-lab">Lab</span>
        </a>
        <nav aria-label="Explora Funciones Lab">
          <a href="#descubre">Cómo funciona</a>
          <a href="#aprende">Qué aprenderás</a>
          <button onClick={() => showAccount("login")}>
            Iniciar sesión <ArrowRight size={16} />
          </button>
        </nav>
      </header>
      <main>
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <p className="landing-eyebrow">
              <span /> MATEMÁTICAS QUE PUEDES EXPLORAR
            </p>
            <h1>
              Las funciones
              <br />
              tienen sentido.
              <br />
              <em>Descúbrelo.</em>
            </h1>
            <p className="landing-lead">
              Entiende qué pasa detrás de cada gráfica. Mueve, prueba y aprende
              funciones matemáticas con lecciones visuales y retos a tu ritmo.
            </p>
            <div className="landing-cta">
              <button
                className="landing-primary"
                onClick={() => showAccount("register")}
              >
                Crear cuenta gratuita <ArrowRight size={20} />
              </button>
              <button className="landing-local" onClick={onLocal}>
                Explorar sin cuenta <MoveUpRight size={18} />
              </button>
            </div>
            <p className="landing-footnote">
              <CheckCircle2 size={16} /> Acceso libre · Sin tarjeta · Desde tu
              navegador
            </p>
          </div>
          <div className="landing-art">
            <img
              src="/images/learning-hero.webp"
              alt="Ilustración de un estudiante explorando curvas y formas matemáticas"
              width="1024"
              height="1024"
              fetchPriority="high"
            />
            <div className="art-tag art-tag-top">
              <Sparkles size={18} />
              <span>
                Menos memorizar.
                <br />
                <strong>Más comprender.</strong>
              </span>
            </div>
            <div className="art-tag art-tag-bottom">
              <span className="art-dot" />
              <span>
                Tu próximo descubrimiento
                <br />
                <strong>empieza con una pregunta.</strong>
              </span>
            </div>
          </div>
        </section>
        <div className="landing-topics">
          <span>DE LA INTUICIÓN A LA PRÁCTICA</span>
          <p>
            Gráficas <i>✦</i> Dominio y rango <i>✦</i> Transformaciones <i>✦</i>{" "}
            Retos
          </p>
          <a href="#descubre" aria-label="Descubrir cómo funciona">
            <ChevronDown size={22} />
          </a>
        </div>
        <section id="descubre" className="landing-section">
          <div className="landing-section-heading">
            <p className="landing-eyebrow">APRENDER HACIENDO</p>
            <h2>
              No solo veas la respuesta.
              <br />
              <span>Entiende por qué.</span>
            </h2>
            <p>
              Conecta la teoría con lo que ves y practica hasta que la idea te
              resulte familiar.
            </p>
          </div>
          <div className="landing-features">
            <article>
              <span className="feature-icon">
                <BookOpen />
              </span>
              <span className="feature-number">01</span>
              <h3>Comprende la idea</h3>
              <p>
                Lecciones con ejemplos, explicaciones paso a paso y errores
                comunes para entender desde la base.
              </p>
              <span className="feature-chip">A tu ritmo</span>
            </article>
            <article>
              <span className="feature-icon mint">
                <SlidersHorizontal />
              </span>
              <span className="feature-number">02</span>
              <h3>Haz que se mueva</h3>
              <p>
                Cambia parámetros en el laboratorio y observa cómo se transforma
                una gráfica. La fórmula cobra vida.
              </p>
              <span className="feature-chip">Experimenta</span>
            </article>
            <article>
              <span className="feature-icon coral">
                <Target />
              </span>
              <span className="feature-number">03</span>
              <h3>Ponte a prueba</h3>
              <p>
                Resuelve ejercicios con pistas y explicaciones. La práctica se
                adapta a las habilidades que necesitas reforzar.
              </p>
              <span className="feature-chip">Aprende del intento</span>
            </article>
          </div>
        </section>
        <section className="landing-demo" aria-labelledby="demo-title">
          <div>
            <p className="landing-eyebrow">PRUÉBALO AQUÍ MISMO</p>
            <h2 id="demo-title">
              Un pequeño cambio.
              <br />
              Una nueva perspectiva.
            </h2>
            <p>
              Mueve el control. Al cambiar <strong>b</strong>, la recta se
              desplaza hacia arriba o hacia abajo sin cambiar su pendiente.
            </p>
            <label htmlFor="landing-shift">
              Desplazamiento vertical <strong>b = {shift}</strong>
            </label>
            <input
              id="landing-shift"
              type="range"
              min="-3"
              max="3"
              step="1"
              value={shift}
              onChange={(event) => setShift(Number(event.target.value))}
            />
            <button
              className="landing-local"
              onClick={() => {
                location.hash = "#/laboratorio";
                onLocal();
              }}
            >
              Entrar al laboratorio <ArrowRight size={18} />
            </button>
          </div>
          <div className="demo-graph">
            <div className="demo-graph-heading">
              <span>LABORATORIO / VISTA PREVIA</span>
              <strong>
                f(x) = x {shift < 0 ? `− ${Math.abs(shift)}` : `+ ${shift}`}
              </strong>
            </div>
            <svg
              viewBox="0 0 400 300"
              role="img"
              aria-label={`Gráfica de la recta f de x igual a x más ${shift}`}
            >
              <defs>
                <pattern
                  id="landing-grid"
                  width="25"
                  height="25"
                  patternUnits="userSpaceOnUse"
                >
                  <path d="M 25 0 L 0 0 0 25" fill="none" stroke="#ffffff12" />
                </pattern>
                <clipPath id="landing-clip">
                  <rect width="400" height="300" />
                </clipPath>
              </defs>
              <rect width="400" height="300" fill="url(#landing-grid)" />
              <path d="M0 150H400 M200 0V300" stroke="#8797b8" />
              <text x="381" y="172" fill="#bac6de">
                x
              </text>
              <text x="213" y="18" fill="#bac6de">
                y
              </text>
              <text x="208" y="170" fill="#bac6de">
                0
              </text>
              <g clipPath="url(#landing-clip)">
                <path
                  d={`M0 ${350 - shift * 25} L400 ${-50 - shift * 25}`}
                  stroke="#78e8d0"
                  strokeWidth="4"
                  fill="none"
                />
                <circle cx="200" cy={150 - shift * 25} r="7" fill="#ffaf8c" />
              </g>
            </svg>
            <p>El punto naranja muestra dónde la recta cruza el eje y.</p>
          </div>
        </section>
        <section id="aprende" className="landing-section landing-curriculum">
          <div className="landing-section-heading">
            <p className="landing-eyebrow">TU RUTA DE APRENDIZAJE</p>
            <h2>
              Desde “¿qué es una función?”
              <br />
              <span>hasta “ya lo entendí”.</span>
            </h2>
            <p>
              Para estudiantes que están empezando, repasando o preparándose
              para un examen.
            </p>
          </div>
          <div className="curriculum-list">
            {[
              ["01", "Fundamentos", "Relaciones, notación y evaluación"],
              ["02", "Dominio y rango", "Restricciones y lectura de gráficas"],
              [
                "03",
                "Familias de funciones",
                "Lineales, cuadráticas, racionales y más",
              ],
              ["04", "Transformaciones", "Traslaciones, reflejos y escalas"],
            ].map(([n, title, description]) => (
              <article key={n}>
                <span>{n}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
                <ArrowRight size={20} />
              </article>
            ))}
          </div>
        </section>
        <section id="landing-account" className="landing-access">
          <div className="landing-section-heading">
            <p className="landing-eyebrow">EMPIEZA A TU MANERA</p>
            <h2>
              Tu curiosidad es suficiente.
              <br />
              <span>Lo demás lo construyes aquí.</span>
            </h2>
          </div>
          {mode ? (
            <div className="landing-auth">
              <CloudAccount
                key={mode}
                initialMode={mode}
                progress={progress}
                setProgress={setProgress}
                onContinue={onAccount}
              />
              <button className="landing-local" onClick={() => setMode(null)}>
                Volver a las opciones
              </button>
              <button className="landing-local" onClick={onLocal}>
                Continuar en este dispositivo
              </button>
            </div>
          ) : (
            <div className="landing-access-options">
              <article>
                <Cloud size={28} />
                <h3>Con una cuenta gratuita</h3>
                <p>
                  Respalda tus avances en la nube y recupéralos desde otro
                  dispositivo. Tu progreso se sincroniza mientras tienes
                  conexión.
                </p>
                <button
                  className="landing-primary"
                  onClick={() => showAccount("register")}
                >
                  Crear mi cuenta <ArrowRight size={18} />
                </button>
              </article>
              <article>
                <BookOpen size={28} />
                <h3>En este dispositivo</h3>
                <p>
                  Tus avances se guardan solo en este navegador. Si borras sus
                  datos, puedes perderlos. Podrás crear una cuenta después.
                </p>
                <button className="landing-local" onClick={onLocal}>
                  Continuar en este dispositivo <ArrowRight size={18} />
                </button>
              </article>
            </div>
          )}
        </section>
      </main>
      <footer className="landing-footer">
        <span>ƒ Funciones Lab</span>
        <p>Explora. Equivócate. Comprende.</p>
        <span>Aprendizaje a tu ritmo.</span>
      </footer>
    </div>
  );
}
