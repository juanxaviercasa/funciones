import React, { useEffect, useRef, useState } from "react";
import { usePreferences } from "../preferences";
import { MathText } from "../math-render";
import { Formula } from "../math-render";
import { Play, Sparkles, Cpu } from "lucide-react";

type Rule = {
  id: string;
  name: string;
  latex: string;
  evalFn: (x: number) => number;
};

const RULES: Rule[] = [
  {
    id: "lineal-1",
    name: "Lineal clásica",
    latex: "f(x) = 2x + 1",
    evalFn: (x) => 2 * x + 1,
  },
  {
    id: "cuad-1",
    name: "Cuadrática",
    latex: "f(x) = x^2 - 3",
    evalFn: (x) => x * x - 3,
  },
  {
    id: "abs-1",
    name: "Valor absoluto",
    latex: "f(x) = |x| + 2",
    evalFn: (x) => Math.abs(x) + 2,
  },
  {
    id: "raiz-1",
    name: "Raíz cuadrada",
    latex: "f(x) = \\sqrt{x}",
    evalFn: (x) => (x < 0 ? NaN : Math.sqrt(x)),
  },
];

export const InteractiveFunctionMachine: React.FC<{
  onSendToLab?: (rule: string) => void;
}> = ({ onSendToLab }) => {
  const { motion } = usePreferences();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const busy = useRef(false);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (callback: () => void, delay: number) =>
    timers.current.push(setTimeout(callback, motion ? delay : 0));
  const [selectedRule, setSelectedRule] = useState<Rule>(RULES[0]);
  const [inputValue, setInputValue] = useState<number>(3);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [animationPhase, setAnimationPhase] = useState<
    "idle" | "in" | "process" | "out"
  >("idle");
  const [outputValue, setOutputValue] = useState<number | null>(7);
  const [history, setHistory] = useState<
    Array<{ x: number; y: number | string; id: number }>
  >([]);

  const handleProcess = (val: number = inputValue) => {
    if (busy.current || !Number.isFinite(val)) return;
    busy.current = true;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setIsProcessing(true);
    setAnimationPhase("in");

    // Phase 1: Ball travels into machine (400ms)
    later(() => {
      setAnimationPhase("process");
      // Phase 2: Processing in the machine core (500ms)
      later(() => {
        const res = selectedRule.evalFn(val);
        setOutputValue(Number.isFinite(res) ? +res.toFixed(2) : null);
        setAnimationPhase("out");

        // Add to history
        const finalDisplay = Number.isFinite(res)
          ? +res.toFixed(2)
          : "Indefinido";
        setHistory((prev) => [
          { x: val, y: finalDisplay, id: Date.now() },
          ...prev.slice(0, 5),
        ]);

        // Phase 3: Finish (500ms)
        later(() => {
          setAnimationPhase("idle");
          setIsProcessing(false);
          busy.current = false;
        }, 600);
      }, 500);
    }, 450);
  };

  const quickInputs = [-3, -1, 0, 2, 4];

  return (
    <div className="function-machine-card">
      {onSendToLab && (
        <button
          className="secondary"
          disabled={isProcessing}
          onClick={() => onSendToLab(selectedRule.id)}
        >
          Explorar esta regla en el laboratorio
        </button>
      )}
      <div className="machine-header">
        <div className="machine-title">
          <Cpu className="text-primary" size={20} />
          <span>Máquina de Funciones Interactiva</span>
        </div>
        <div className="rule-selector">
          {RULES.map((rule) => (
            <button
              key={rule.id}
              type="button"
              disabled={isProcessing}
              className={`rule-pill ${selectedRule.id === rule.id ? "active" : ""}`}
              onClick={() => {
                setSelectedRule(rule);
                setHistory([]);
                const res = rule.evalFn(inputValue);
                setOutputValue(Number.isFinite(res) ? +res.toFixed(2) : null);
              }}
            >
              {rule.name}
            </button>
          ))}
        </div>
      </div>

      <div className="machine-stage">
        {/* Input Chamber */}
        <div className="stage-chamber input-chamber">
          <span className="chamber-tag">ENTRADA (x)</span>
          <div className="input-control-box">
            <input
              type="number"
              aria-label="Entrada x de la máquina"
              value={Number.isFinite(inputValue) ? inputValue : ""}
              onChange={(e) => {
                const value = e.target.valueAsNumber;
                setInputValue(value);
                const res = selectedRule.evalFn(value);
                setOutputValue(Number.isFinite(res) ? +res.toFixed(2) : null);
              }}
              disabled={isProcessing}
              className="machine-number-input"
            />
            <div className="quick-input-row">
              {quickInputs.map((val) => (
                <button
                  key={val}
                  type="button"
                  className="quick-val-btn"
                  onClick={() => {
                    setInputValue(val);
                    handleProcess(val);
                  }}
                  disabled={isProcessing}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Traveling Particle Visual */}
        <div className="machine-track">
          <div
            className={`machine-capsule ${animationPhase}`}
            style={{
              opacity: animationPhase === "idle" ? 0 : 1,
            }}
          >
            {animationPhase === "in" || animationPhase === "process"
              ? inputValue
              : (outputValue ?? "∅")}
          </div>
        </div>

        {/* Central Reactor Machine */}
        <div
          className={`machine-core ${animationPhase === "process" ? "pulsing" : ""}`}
        >
          <div className="core-glow" />
          <div className="core-label">REGLA INTERNA</div>
          <div className="core-formula">
            <Formula latex={selectedRule.latex} />
          </div>
          <button
            type="button"
            className="process-trigger-btn"
            onClick={() => handleProcess()}
            disabled={isProcessing}
          >
            <Play size={16} fill="currentColor" />
            <span>{isProcessing ? "Procesando..." : "Evaluar Entrada"}</span>
          </button>
        </div>

        {/* Output Track */}
        <div className="machine-track" />

        {/* Output Chamber */}
        <div className="stage-chamber output-chamber">
          <span className="chamber-tag">SALIDA f(x)</span>
          <div className="output-result-box">
            <span className="sr-only" role="status">
              {isProcessing
                ? "Calculando"
                : `Salida ${outputValue ?? "indefinida"}`}
            </span>
            <span className="output-val">
              {outputValue !== null ? outputValue : "Indefinido"}
            </span>
            <small className="pair-tag">
              Par: ({inputValue}, {outputValue !== null ? outputValue : "—"})
            </small>
          </div>
        </div>
      </div>

      {/* History and Insight Bar */}
      <div className="machine-footer">
        <div className="machine-history">
          <span className="history-label">Pares ordenados generados:</span>
          <div className="history-chips">
            {history.map((item) => (
              <span key={item.id} className="history-chip">
                ({item.x}, {item.y})
              </span>
            ))}
          </div>
        </div>
        <div className="machine-pedagogy-tip">
          <Sparkles size={16} className="text-amber-500" />
          <span>
            <b>Principio clave:</b>{" "}
            <MathText>
              Cada entrada $x$ en el dominio produce exactamente una salida $y$.
            </MathText>
          </span>
        </div>
      </div>
    </div>
  );
};
