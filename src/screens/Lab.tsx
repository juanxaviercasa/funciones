import { useState } from "react";

import { evaluate, parameterKey, Params } from "../math";
import { Formula } from "../math-render";

import { Sliders, RotateCcw, Target, Cpu } from "lucide-react";

import { InteractiveGraph } from "../components/InteractiveGraph";
import { InteractiveFunctionMachine } from "../components/InteractiveFunctionMachine";

export default function Lab({
  onAwardXP,
}: {
  onAwardXP?: (amount: number, challengeId: string) => void;
}) {
  const [tab, setTab] = useState<"libre" | "reto" | "maquina">("libre");
  const [p, setP] = useState<Params>({
    a: 1,
    b: 1,
    h: 0,
    k: 0,
    family: "cuadratica",
  });
  const [showPOI, setShowPOI] = useState(true);
  const [showDomainRange, setShowDomainRange] = useState(true);
  const [showTangent, setShowTangent] = useState(false);
  const [showGhostBase] = useState(true);

  // Challenge target params
  const [targetParams, setTargetParams] = useState<Params>({
    a: -1.5,
    b: 1,
    h: 2,
    k: 3,
    family: "cuadratica",
  });
  const challengeId = parameterKey(targetParams);

  const generateNewChallenge = () => {
    const families: Params["family"][] = ["cuadratica", "lineal", "absoluto"];
    const fam = families[Math.floor(Math.random() * families.length)];
    const aVals = [-2, -1.5, -1, 1, 1.5, 2];
    const hVals = [-3, -2, -1, 0, 1, 2, 3];
    const kVals = [-3, -2, -1, 0, 1, 2, 3];
    const newTarget: Params = {
      family: fam,
      a: aVals[Math.floor(Math.random() * aVals.length)],
      b: 1,
      h: hVals[Math.floor(Math.random() * hVals.length)],
      k: kVals[Math.floor(Math.random() * kVals.length)],
    };
    setTargetParams(newTarget);
    setP({ family: fam, a: 1, b: 1, h: 0, k: 0 });
  };

  const values = [-2, -1, 0, 1, 2].map((x) => ({ x, y: evaluate(x, p) }));
  const setParam = <K extends keyof Params>(key: K, value: Params[K]) =>
    setP((v) => ({ ...v, [key]: value }));

  return (
    <div className="page lab-page">
      <div className="page-title row">
        <div>
          <span className="kicker">
            LABORATORIO INTERACTIVO MULTIDISCIPLINAR
          </span>
          <h1>Manipula la matemática viva.</h1>
          <p>
            Arrastra puntos en el plano, proyecta dominio y rango, o desafía tus
            habilidades en el reto de ajuste de curvas.
          </p>
        </div>
        <div className="hero-actions">
          <button
            className="secondary"
            onClick={() =>
              setP({ a: 1, b: 1, h: 0, k: 0, family: "cuadratica" })
            }
          >
            <RotateCcw size={16} /> Reiniciar función
          </button>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="hero-tab-nav" style={{ marginBottom: 20 }}>
        <button
          type="button"
          className={`hero-tab-pill ${tab === "libre" ? "active" : ""}`}
          onClick={() => setTab("libre")}
        >
          <Sliders size={16} />
          <span>Exploración Libre</span>
        </button>
        <button
          type="button"
          className={`hero-tab-pill ${tab === "reto" ? "active" : ""}`}
          onClick={() => setTab("reto")}
        >
          <Target size={16} />
          <span>Reto: Ajusta la Curva</span>
        </button>
        <button
          type="button"
          className={`hero-tab-pill ${tab === "maquina" ? "active" : ""}`}
          onClick={() => setTab("maquina")}
        >
          <Cpu size={16} />
          <span>Máquina de Funciones</span>
        </button>
      </div>

      {tab === "maquina" ? (
        <InteractiveFunctionMachine
          onSendToLab={(id) => {
            const family =
              id === "cuad-1"
                ? "cuadratica"
                : id === "abs-1"
                  ? "absoluto"
                  : id === "raiz-1"
                    ? "raiz"
                    : "lineal";
            setP({
              family,
              a: id === "lineal-1" ? 2 : 1,
              b: 1,
              h: 0,
              k:
                id === "cuad-1"
                  ? -3
                  : id === "abs-1"
                    ? 2
                    : id === "lineal-1"
                      ? 1
                      : 0,
            });
            setTab("libre");
          }}
        />
      ) : (
        <div className="lab-grid">
          {/* Main Interactive Canvas Area */}
          <section className="plot-card">
            <div className="plot-toolbar">
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <select
                  value={p.family}
                  onChange={(e) =>
                    setParam("family", e.target.value as Params["family"])
                  }
                  aria-label="Familia de función"
                  disabled={tab === "reto"}
                >
                  <option value="cuadratica">Cuadrática</option>
                  <option value="lineal">Lineal</option>
                  <option value="absoluto">Valor absoluto</option>
                  <option value="cubica">Cúbica</option>
                  <option value="raiz">Raíz</option>
                </select>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={showPOI}
                    onChange={(e) => setShowPOI(e.target.checked)}
                  />
                  Puntos Notables (POI)
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={showDomainRange}
                    onChange={(e) => setShowDomainRange(e.target.checked)}
                  />
                  Dominio y Rango
                </label>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={showTangent}
                    onChange={(e) => setShowTangent(e.target.checked)}
                  />
                  Recta Tangente
                </label>
              </div>

              {tab === "reto" && (
                <button
                  type="button"
                  className="secondary"
                  onClick={generateNewChallenge}
                  style={{ minHeight: 36, padding: "0 12px", fontSize: 13 }}
                >
                  Nuevo objetivo 🎯
                </button>
              )}
            </div>

            <InteractiveGraph
              params={p}
              onChangeParams={setP}
              showPOI={showPOI}
              showDomainRange={showDomainRange}
              showTangent={showTangent}
              showGhostBase={showGhostBase && tab !== "reto"}
              interactivePoints={true}
              isChallengeMode={tab === "reto"}
              targetParams={targetParams}
              onChallengeSuccess={() => {
                onAwardXP?.(40, challengeId);
              }}
            />
          </section>

          {/* Interactive Controls & Analytics Sidebar */}
          <aside className="controls-card">
            <h2>
              <Formula
                latex={`g(x)=${p.a !== 1 ? p.a : ""}\\,f(${p.b !== 1 ? p.b : ""}(x${p.h >= 0 ? "-" : "+"}${Math.abs(p.h)}))${p.k >= 0 ? "+" : "-"}${Math.abs(p.k)}`}
              />
            </h2>

            {tab === "reto" && (
              <div
                style={{
                  background: "var(--soft)",
                  border: "1px solid var(--primary)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  marginBottom: 16,
                  fontSize: 13,
                }}
              >
                <b>🎯 Misión del Reto:</b> Mueve los controles o arrastra el
                punto blanco en la gráfica para hacer que tu curva coincida con
                la silueta discontinua objetivo.
              </div>
            )}

            {(["a", "b", "h", "k"] as const).map((key) => (
              <label className="slider" key={key}>
                <div>
                  <b>{key}</b>
                  <span>{p[key]}</span>
                </div>
                <input
                  type="range"
                  min={key === "h" || key === "k" ? -5 : -4}
                  max={key === "h" || key === "k" ? 5 : 4}
                  step="0.5"
                  value={p[key]}
                  onChange={(e) => setParam(key, Number(e.target.value))}
                />
              </label>
            ))}

            <div className="explain">
              <b>¿Qué está ocurriendo físicamente?</b>
              <p>
                {p.a < 0 ? "La gráfica se refleja verticalmente (eje X). " : ""}
                {Math.abs(p.a) > 1
                  ? "Estiramiento vertical por factor de " +
                    Math.abs(p.a) +
                    ". "
                  : Math.abs(p.a) < 1
                    ? "Compresión vertical por factor de " +
                      Math.abs(p.a) +
                      ". "
                    : ""}
                {p.h !== 0
                  ? `Se traslada ${Math.abs(p.h)} unidades hacia la ${p.h > 0 ? "derecha" : "izquierda"}. `
                  : ""}
                {p.k > 0
                  ? `Sube ${p.k} unidades. `
                  : p.k < 0
                    ? `Baja ${Math.abs(p.k)} unidades. `
                    : ""}
                {p.b === 0
                  ? "La función es constante; no hay escala horizontal invertible. "
                  : Math.abs(p.b) !== 1
                    ? `Compresión horizontal por factor 1/|b| = ${(1 / Math.abs(p.b)).toFixed(2)}. `
                    : ""}
                {p.b < 0 ? "Reflexión horizontal (eje Y). " : ""}
              </p>
            </div>

            <table style={{ marginTop: 20 }}>
              <thead>
                <tr>
                  <th>x</th>
                  {values.map((v) => (
                    <th key={v.x}>{v.x}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>g(x)</th>
                  {values.map((v) => (
                    <td key={v.x}>
                      {Number.isFinite(v.y) ? v.y.toFixed(1) : "—"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </aside>
        </div>
      )}
    </div>
  );
}
