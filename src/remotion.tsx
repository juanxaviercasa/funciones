import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type MotionOptions = { motionEnabled?: boolean; showCaption?: boolean };

export const FunctionMachine: React.FC<
  {
    input?: number;
    rule?: string;
    output?: number;
    color?: string;
  } & MotionOptions
> = ({
  input = 3,
  rule = "× 2 + 1",
  output = 7,
  color = "#5b5bd6",
  motionEnabled = true,
  showCaption = true,
}) => {
  const currentFrame = useCurrentFrame();
  const frame = motionEnabled ? currentFrame : 100;
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16 } });
  const flow = interpolate(frame, [20, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg,#11162a,#1d2443)",
        color: "white",
        fontFamily: "Arial",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 34,
          left: 45,
          fontSize: 20,
          color: "#aeb8e8",
        }}
      >
        MICROLECCIÓN · LA MÁQUINA DE FUNCIONES
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 38,
          transform: `scale(${0.82 + 0.18 * enter})`,
        }}
      >
        <div style={{ fontSize: 52, fontWeight: 800, opacity: enter }}>
          {input}
        </div>
        <div
          style={{
            height: 6,
            width: 100,
            background: "#394164",
            borderRadius: 9,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${flow * 100}%`,
              height: "100%",
              background: "#69d2b0",
            }}
          />
        </div>
        <div
          style={{
            background: color,
            padding: "35px 48px",
            borderRadius: 24,
            fontSize: 35,
            fontWeight: 800,
            boxShadow: "0 18px 50px #0006",
          }}
        >
          {rule}
        </div>
        <div
          style={{
            height: 6,
            width: 100,
            background: "#394164",
            borderRadius: 9,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${Math.max(0, flow - 0.35) * 154}%`,
              height: "100%",
              background: "#ffca70",
            }}
          />
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 800,
            opacity: interpolate(frame, [48, 70], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {output}
        </div>
      </div>
      {showCaption && (
        <div
          style={{
            position: "absolute",
            bottom: 38,
            fontSize: 24,
            color: "#cbd2f4",
          }}
        >
          Cada entrada recibe exactamente una salida.
        </div>
      )}
    </AbsoluteFill>
  );
};

export const TransformationMotion: React.FC<
  { a?: number; h?: number; k?: number } & MotionOptions
> = ({ a = 1, h = 1.5, k = 1, motionEnabled = true, showCaption = true }) => {
  const currentFrame = useCurrentFrame();
  const frame = motionEnabled ? currentFrame : 120;
  const t = interpolate(frame, [0, 120], [0, 1], { extrapolateRight: "clamp" });
  const points = Array.from({ length: 61 }, (_, index) => {
    const x = -3 + index / 10;
    const y = (1 - t + t * a) * (x - t * h) ** 2 + t * k;
    return `${400 + x * 100},${225 - y * 36}`;
  }).join(" ");
  return (
    <AbsoluteFill style={{ background: "#f8f9ff", fontFamily: "Arial" }}>
      {showCaption && (
        <div
          style={{
            padding: "28px 38px",
            fontSize: 27,
            fontWeight: 800,
            color: "#20233b",
          }}
        >
          De f(x)=x² a g(x)={a}(x−{h})²+{k}
        </div>
      )}
      <svg
        viewBox="0 0 800 450"
        style={{
          position: "absolute",
          inset: "70px 0 0",
          width: "100%",
          height: "calc(100% - 70px)",
        }}
      >
        <g stroke="#dfe2ee" strokeWidth="1">
          {Array.from({ length: 15 }, (_, index) => (
            <line
              key={`v${index}`}
              x1={index * 60}
              y1="0"
              x2={index * 60}
              y2="450"
            />
          ))}
          {Array.from({ length: 9 }, (_, index) => (
            <line
              key={`h${index}`}
              x1="0"
              y1={index * 55}
              x2="800"
              y2={index * 55}
            />
          ))}
        </g>
        <line x1="0" y1="225" x2="800" y2="225" stroke="#8d93aa" />
        <line x1="400" y1="0" x2="400" y2="450" stroke="#8d93aa" />
        <polyline
          points={points}
          fill="none"
          stroke="#5b5bd6"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </svg>
    </AbsoluteFill>
  );
};
