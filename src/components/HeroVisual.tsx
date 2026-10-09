import React, { useState } from "react";
import { InteractiveGraph } from "./InteractiveGraph";
import { InteractiveFunctionMachine } from "./InteractiveFunctionMachine";
import { Params } from "../math";
import { Sliders, Cpu } from "lucide-react";

export const HeroVisual: React.FC = () => {
  const [tab, setTab] = useState<"graph" | "machine">("graph");
  const [params, setParams] = useState<Params>({
    a: 1,
    b: 1,
    h: 0,
    k: 0,
    family: "cuadratica",
  });

  return (
    <div className="hero-interactive-container">
      {/* Tab Switcher */}
      <div className="hero-tab-nav">
        <button
          type="button"
          className={`hero-tab-pill ${tab === "graph" ? "active" : ""}`}
          onClick={() => setTab("graph")}
        >
          <Sliders size={16} />
          <span>Gráfica Manipulable</span>
        </button>
        <button
          type="button"
          className={`hero-tab-pill ${tab === "machine" ? "active" : ""}`}
          onClick={() => setTab("machine")}
        >
          <Cpu size={16} />
          <span>Máquina de Funciones</span>
        </button>
      </div>

      <div className="hero-stage-content">
        {tab === "graph" ? (
          <div className="hero-graph-layout">
            <InteractiveGraph
              params={params}
              onChangeParams={setParams}
              showPOI={true}
              showDomainRange={true}
              showGhostBase={true}
              interactivePoints={true}
              className="hero-graph-instance"
            />
          </div>
        ) : (
          <div className="hero-machine-layout">
            <InteractiveFunctionMachine />
          </div>
        )}
      </div>
    </div>
  );
};
