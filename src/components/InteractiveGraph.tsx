import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import confetti from "canvas-confetti";
import { usePreferences } from "../preferences";
import {
  evaluate,
  functionLatex,
  parameterKey,
  getDomainAndRange,
  getPointsOfInterest,
  getTangentLine,
  pointSegments,
  Params,
  POI,
} from "../math";
import { Formula } from "../math-render";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  TrendingUp,
  Target,
  CheckCircle2,
} from "lucide-react";

export type InteractiveGraphProps = {
  params: Params;
  onChangeParams: (updater: (prev: Params) => Params) => void;
  showPOI?: boolean;
  showDomainRange?: boolean;
  showTangent?: boolean;
  showGhostBase?: boolean;
  interactivePoints?: boolean;
  isChallengeMode?: boolean;
  targetParams?: Params;
  onChallengeSuccess?: () => void;
  className?: string;
};

export const InteractiveGraph: React.FC<InteractiveGraphProps> = ({
  params,
  onChangeParams,
  showPOI = true,
  showDomainRange = true,
  showTangent = false,
  showGhostBase = true,
  interactivePoints = true,
  isChallengeMode = false,
  targetParams,
  onChallengeSuccess,
  className = "",
}) => {
  const { motion } = usePreferences();
  const animationRef = useRef<number | undefined>(undefined);
  useEffect(
    () => () => {
      if (animationRef.current !== undefined)
        cancelAnimationFrame(animationRef.current);
    },
    [],
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Coordinate viewport limits: default -6 to 6
  const [view, setView] = useState({
    minX: -6,
    maxX: 6,
    minY: -4,
    maxY: 6,
  });

  // Dimensions
  const [width, setWidth] = useState(640);
  const height = 400;

  // Tangent exploration point x0
  const [xTangent, setXTangent] = useState<number>(1);

  // Manim-style draw animation state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawProgress, setDrawProgress] = useState(1); // 0 to 1

  // Hovered POI tooltip
  const [hoveredPoi, setHoveredPoi] = useState<POI | null>(null);

  // Dragging state for movable point (h, k)
  const [isDraggingVertex, setIsDraggingVertex] = useState(false);

  // Pan state
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{
    clientX: number;
    clientY: number;
    view: typeof view;
  }>({
    clientX: 0,
    clientY: 0,
    view,
  });

  // Track responsive container width
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setWidth(Math.max(1, Math.floor(entry.contentRect.width)));
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Coordinate transforms
  const toSvgX = useCallback(
    (x: number) => ((x - view.minX) / (view.maxX - view.minX)) * width,
    [view.minX, view.maxX, width],
  );

  const toSvgY = useCallback(
    (y: number) =>
      height - ((y - view.minY) / (view.maxY - view.minY)) * height,
    [view.minY, view.maxY, height],
  );

  const toMathX = useCallback(
    (svgX: number) => view.minX + (svgX / width) * (view.maxX - view.minX),
    [view.minX, view.maxX, width],
  );

  const toMathY = useCallback(
    (svgY: number) =>
      view.minY + ((height - svgY) / height) * (view.maxY - view.minY),
    [view.minY, view.maxY, height],
  );

  // Zoom helpers
  const handleZoom = (factor: number) => {
    setView((v) => {
      const centerX = (v.minX + v.maxX) / 2;
      const centerY = (v.minY + v.maxY) / 2;
      const halfW = ((v.maxX - v.minX) * factor) / 2;
      const halfH = ((v.maxY - v.minY) * factor) / 2;
      if (halfW < 0.5 || halfW > 100 || halfH < 0.5 || halfH > 100) return v;
      return {
        minX: centerX - halfW,
        maxX: centerX + halfW,
        minY: centerY - halfH,
        maxY: centerY + halfH,
      };
    });
  };

  const handleResetView = () => {
    setView({ minX: -6, maxX: 6, minY: -4, maxY: 6 });
  };

  // Curve segments calculation
  const segments = useMemo(() => {
    try {
      const segs = pointSegments(
        params,
        view.minX,
        view.maxX,
        (view.maxX - view.minX) / Math.max(width, 200),
        Math.max(Math.abs(view.minY), Math.abs(view.maxY)) + 10,
      );
      return segs.map((seg) =>
        seg
          .map((pt) => `${toSvgX(pt.x).toFixed(1)},${toSvgY(pt.y).toFixed(1)}`)
          .join(" "),
      );
    } catch {
      return [];
    }
  }, [
    params,
    view.minX,
    view.maxX,
    view.minY,
    view.maxY,
    width,
    toSvgX,
    toSvgY,
  ]);

  // Base ghost curve
  const baseSegments = useMemo(() => {
    if (!showGhostBase) return [];
    try {
      const baseParams = { ...params, a: 1, b: 1, h: 0, k: 0 };
      const segs = pointSegments(baseParams, view.minX, view.maxX, 0.05, 50);
      return segs.map((seg) =>
        seg
          .map((pt) => `${toSvgX(pt.x).toFixed(1)},${toSvgY(pt.y).toFixed(1)}`)
          .join(" "),
      );
    } catch {
      return [];
    }
  }, [params, showGhostBase, view.minX, view.maxX, toSvgX, toSvgY]);

  // Target curve for Challenge Mode
  const targetSegments = useMemo(() => {
    if (!isChallengeMode || !targetParams) return [];
    try {
      const segs = pointSegments(targetParams, view.minX, view.maxX, 0.05, 50);
      return segs.map((seg) =>
        seg
          .map((pt) => `${toSvgX(pt.x).toFixed(1)},${toSvgY(pt.y).toFixed(1)}`)
          .join(" "),
      );
    } catch {
      return [];
    }
  }, [isChallengeMode, targetParams, view.minX, view.maxX, toSvgX, toSvgY]);

  // Points of Interest (POI)
  const pois = useMemo(() => {
    if (!showPOI) return [];
    return getPointsOfInterest(params).filter(
      (poi) =>
        poi.x >= view.minX - 0.5 &&
        poi.x <= view.maxX + 0.5 &&
        poi.y >= view.minY - 0.5 &&
        poi.y <= view.maxY + 0.5,
    );
  }, [params, showPOI, view]);

  // Domain & Range analytical info
  const domainRange = useMemo(() => {
    return getDomainAndRange(params);
  }, [params]);

  // Tangent line info
  const tangent = useMemo(() => {
    if (!showTangent) return null;
    return getTangentLine(xTangent, params);
  }, [showTangent, xTangent, params]);

  // Manim-style Progressive Draw Animation
  const triggerManimDraw = () => {
    if (!motion) return;
    if (animationRef.current !== undefined)
      cancelAnimationFrame(animationRef.current);
    setIsDrawing(true);
    setDrawProgress(0);
    const start = performance.now();
    const duration = 1200; // ms

    const animate = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(1, elapsed / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDrawProgress(eased);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsDrawing(false);
        setDrawProgress(1);
      }
    };
    animationRef.current = requestAnimationFrame(animate);
  };

  // Pointer dragging on Vertex (h, k)
  const handlePointerDownVertex = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDraggingVertex(true);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveVertex = (e: React.PointerEvent) => {
    if (!isDraggingVertex || !containerRef.current) return;
    const rect = containerRef.current
      .querySelector("svg")!
      .getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) * width) / rect.width;
    const svgY = ((e.clientY - rect.top) * height) / rect.height;
    let mathX = toMathX(svgX);
    let mathY = toMathY(svgY);

    // Snap to nearest 0.25 for clean user experience
    mathX = Math.round(mathX * 4) / 4;
    mathY = Math.round(mathY * 4) / 4;

    onChangeParams((prev) => ({
      ...prev,
      h: Math.max(-5, Math.min(5, mathX)),
      k: Math.max(-5, Math.min(5, mathY)),
    }));
  };

  const handlePointerUpVertex = (e: React.PointerEvent) => {
    if (isDraggingVertex) {
      setIsDraggingVertex(false);
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
    }
  };

  // Canvas Pan (Drag background)
  const handlePointerDownCanvas = (e: React.PointerEvent) => {
    if (isDraggingVertex) return;
    setIsPanning(true);
    panStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      view: { ...view },
    };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveCanvas = (e: React.PointerEvent) => {
    if (isDraggingVertex) {
      handlePointerMoveVertex(e);
      return;
    }
    if (!isPanning) return;

    const dx = e.clientX - panStartRef.current.clientX;
    const dy = e.clientY - panStartRef.current.clientY;

    const mathDx =
      (dx / width) *
      (panStartRef.current.view.maxX - panStartRef.current.view.minX);
    const mathDy =
      (dy / height) *
      (panStartRef.current.view.maxY - panStartRef.current.view.minY);

    setView({
      minX: panStartRef.current.view.minX - mathDx,
      maxX: panStartRef.current.view.maxX - mathDx,
      minY: panStartRef.current.view.minY + mathDy,
      maxY: panStartRef.current.view.maxY + mathDy,
    });
  };

  const handlePointerUpCanvas = (e: React.PointerEvent) => {
    if (isPanning) {
      setIsPanning(false);
      try {
        (e.currentTarget as Element).releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
    }
    if (isDraggingVertex) {
      handlePointerUpVertex(e);
    }
  };

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 0.9 : 1.1;
    handleZoom(factor);
  };

  // Challenge mode similarity score
  const challengeScore = useMemo(() => {
    if (!isChallengeMode || !targetParams) return 0;
    // Compare samples in [-4, 4]
    const testPoints = [-3, -2, -1, 0, 1, 2, 3];
    let totalError = 0;
    let validCount = 0;
    for (const x of testPoints) {
      const yUser = evaluate(x, params);
      const yTarget = evaluate(x, targetParams);
      if (Number.isFinite(yUser) && Number.isFinite(yTarget)) {
        totalError += Math.abs(yUser - yTarget);
        validCount++;
      }
    }
    if (validCount === 0) return 0;
    const avgError = totalError / validCount;
    // Score 0 to 100
    const rawScore = Math.max(0, 100 - avgError * 25);
    return Math.round(rawScore);
  }, [isChallengeMode, targetParams, params]);

  const awardedTargets = useRef(new Set<string>());
  useEffect(() => {
    if (!targetParams) return;
    const key = parameterKey(targetParams);
    if (
      isChallengeMode &&
      challengeScore >= 98 &&
      !awardedTargets.current.has(key)
    ) {
      awardedTargets.current.add(key);
      if (motion)
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true,
        });
      onChallengeSuccess?.();
    }
  }, [
    challengeScore,
    isChallengeMode,
    onChallengeSuccess,
    targetParams,
    motion,
  ]);

  // Tick generator
  const xTicks = useMemo(() => {
    const step = Math.max(1, Math.ceil((view.maxX - view.minX) / 20));
    const ticks: number[] = [];
    const start = Math.ceil(view.minX);
    const end = Math.floor(view.maxX);
    for (let x = start; x <= end; x += step) {
      if (x !== 0) ticks.push(x);
    }
    return ticks;
  }, [view.minX, view.maxX]);

  const yTicks = useMemo(() => {
    const step = Math.max(1, Math.ceil((view.maxY - view.minY) / 20));
    const ticks: number[] = [];
    const start = Math.ceil(view.minY);
    const end = Math.floor(view.maxY);
    for (let y = start; y <= end; y += step) {
      if (y !== 0) ticks.push(y);
    }
    return ticks;
  }, [view.minY, view.maxY]);

  // Current vertex screen position
  const vertexSvg = useMemo(() => {
    const yVal = evaluate(params.h, params);
    if (!Number.isFinite(yVal)) return null;
    return {
      x: toSvgX(params.h),
      y: toSvgY(yVal),
    };
  }, [params, toSvgX, toSvgY]);

  const originSvgX = toSvgX(0);
  const originSvgY = toSvgY(0);

  return (
    <div
      className={`interactive-graph-wrapper ${className}`}
      ref={containerRef}
    >
      {/* Top Floating Graph Toolbar */}
      <div className="graph-top-bar">
        <div className="graph-badges">
          <span className="graph-chip chip-equation">
            <Formula latex={functionLatex(params)} />
          </span>

          {isChallengeMode && (
            <span
              className={`graph-chip chip-score ${
                challengeScore >= 98
                  ? "score-perfect"
                  : challengeScore > 75
                    ? "score-high"
                    : ""
              }`}
            >
              <Target size={14} />
              Ajuste: {challengeScore}%
              {challengeScore >= 98 && (
                <CheckCircle2 size={14} className="ml-1" />
              )}
            </span>
          )}
        </div>

        <div className="graph-actions">
          <button
            type="button"
            className="graph-action-btn"
            onClick={triggerManimDraw}
            disabled={!motion || isDrawing}
            title="Animar trazado vectorial estilo Manim"
            aria-label="Animar trazado"
          >
            <Play size={15} />
            <span>Manim Flow</span>
          </button>
          <button
            type="button"
            className="graph-action-btn icon-only"
            onClick={() => handleZoom(0.85)}
            title="Acercar (Zoom In)"
            aria-label="Acercar"
          >
            <ZoomIn size={15} />
          </button>
          <button
            type="button"
            className="graph-action-btn icon-only"
            onClick={() => handleZoom(1.15)}
            title="Alejar (Zoom Out)"
            aria-label="Alejar"
          >
            <ZoomOut size={15} />
          </button>
          <button
            type="button"
            className="graph-action-btn icon-only"
            onClick={handleResetView}
            title="Restablecer plano coordenado"
            aria-label="Restablecer vista"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div
        className={`graph-viewport ${isPanning ? "panning" : ""} ${isDraggingVertex ? "dragging" : ""}`}
        onPointerDown={handlePointerDownCanvas}
        onPointerMove={handlePointerMoveCanvas}
        onPointerUp={handlePointerUpCanvas}
        onPointerCancel={handlePointerUpCanvas}
        onLostPointerCapture={() => {
          setIsPanning(false);
          setIsDraggingVertex(false);
        }}
        onWheel={handleWheel}
      >
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="math-svg-canvas"
          role="img"
          aria-label={`Gráfica de función ${params.family}, a=${params.a}, b=${params.b}, h=${params.h}, k=${params.k}. Usa los controles debajo para moverla con el teclado.`}
        >
          <defs>
            {/* Glowing filter */}
            <filter
              id="curve-glow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gradient for main curve */}
            <linearGradient
              id="curve-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>

            {/* Target curve gradient */}
            <linearGradient
              id="target-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <g
            className="grid-layer"
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeWidth="1"
          >
            {xTicks.map((x) => (
              <line
                key={`gx-${x}`}
                x1={toSvgX(x)}
                y1={0}
                x2={toSvgX(x)}
                y2={height}
              />
            ))}
            {yTicks.map((y) => (
              <line
                key={`gy-${y}`}
                x1={0}
                y1={toSvgY(y)}
                x2={width}
                y2={toSvgY(y)}
              />
            ))}
          </g>

          {/* Domain and Range Projections on Axes */}
          {showDomainRange && (
            <g className="domain-range-layer">
              {domainRange.domainInterval.end !== null && (
                <rect
                  x={0}
                  y={originSvgY - 4}
                  width={Math.max(
                    0,
                    Math.min(width, toSvgX(domainRange.domainInterval.end)),
                  )}
                  height={8}
                  fill="#06b6d4"
                  fillOpacity="0.35"
                />
              )}
              {domainRange.rangeInterval.start ===
                domainRange.rangeInterval.end &&
              domainRange.rangeInterval.start !== null ? (
                <circle
                  cx={originSvgX}
                  cy={toSvgY(domainRange.rangeInterval.start)}
                  r={6}
                  fill="#ec4899"
                />
              ) : (
                domainRange.rangeInterval.end !== null && (
                  <rect
                    x={originSvgX - 4}
                    y={Math.max(
                      0,
                      Math.min(height, toSvgY(domainRange.rangeInterval.end)),
                    )}
                    width={8}
                    height={Math.max(
                      0,
                      height -
                        Math.max(0, toSvgY(domainRange.rangeInterval.end)),
                    )}
                    fill="#ec4899"
                    fillOpacity="0.35"
                  />
                )
              )}
              {/* Domain projection on X axis */}
              {domainRange.domainInterval.start !== null && (
                <rect
                  x={toSvgX(domainRange.domainInterval.start)}
                  y={originSvgY - 4}
                  width={Math.max(
                    0,
                    width - toSvgX(domainRange.domainInterval.start),
                  )}
                  height={8}
                  fill="#06b6d4"
                  fillOpacity="0.35"
                  rx="4"
                />
              )}
              {/* Range projection on Y axis */}
              {domainRange.rangeInterval.start !== null &&
                domainRange.rangeInterval.start !==
                  domainRange.rangeInterval.end && (
                  <rect
                    x={originSvgX - 4}
                    y={0}
                    width={8}
                    height={Math.max(
                      0,
                      toSvgY(domainRange.rangeInterval.start),
                    )}
                    fill="#ec4899"
                    fillOpacity="0.35"
                    rx="4"
                  />
                )}
            </g>
          )}

          {/* Main Axes */}
          <g
            className="axes-layer"
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeWidth="1.5"
          >
            {/* X Axis */}
            <line x1={0} y1={originSvgY} x2={width} y2={originSvgY} />
            {/* Y Axis */}
            <line x1={originSvgX} y1={0} x2={originSvgX} y2={height} />
          </g>

          {/* Axis Numeric Labels */}
          <g
            className="axis-labels"
            fill="currentColor"
            fillOpacity="0.5"
            fontSize="10"
            textAnchor="middle"
          >
            {xTicks.map((x) => (
              <text
                key={`lx-${x}`}
                x={toSvgX(x)}
                y={Math.min(height - 6, Math.max(14, originSvgY + 14))}
              >
                {x}
              </text>
            ))}
            {yTicks.map((y) => (
              <text
                key={`ly-${y}`}
                x={Math.min(width - 14, Math.max(14, originSvgX - 12))}
                y={toSvgY(y) + 3}
                textAnchor="end"
              >
                {y}
              </text>
            ))}
          </g>

          {/* Target Silhouette (Challenge Mode) */}
          {isChallengeMode && targetSegments.length > 0 && (
            <g className="target-curve-layer">
              {targetSegments.map((pts, i) => (
                <polyline
                  key={`target-seg-${i}`}
                  points={pts}
                  fill="none"
                  stroke="url(#target-gradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="8 6"
                />
              ))}
            </g>
          )}

          {/* Ghost Base Curve */}
          {showGhostBase && !isChallengeMode && (
            <g className="base-curve-layer">
              {baseSegments.map((pts, i) => (
                <polyline
                  key={`base-seg-${i}`}
                  points={pts}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.22"
                  strokeWidth="2.5"
                  strokeDasharray="5 5"
                />
              ))}
            </g>
          )}

          {/* Tangent Line Explorer */}
          {showTangent && tangent && (
            <g className="tangent-layer">
              {/* Tangent Line */}
              <line
                x1={toSvgX(view.minX)}
                y1={toSvgY(tangent.slope * view.minX + tangent.intercept)}
                x2={toSvgX(view.maxX)}
                y2={toSvgY(tangent.slope * view.maxX + tangent.intercept)}
                stroke="#10b981"
                strokeWidth="2.5"
                strokeDasharray="4 3"
              />
              {/* Tangent Contact Point */}
              <circle
                cx={toSvgX(tangent.x0)}
                cy={toSvgY(tangent.y0)}
                r="6"
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="2"
              />
              {/* Slope label card */}
              <text
                x={toSvgX(tangent.x0) + 12}
                y={toSvgY(tangent.y0) - 12}
                fill="#10b981"
                fontSize="12"
                fontWeight="700"
              >
                m = {+tangent.slope.toFixed(2)}
              </text>
            </g>
          )}

          {/* Main Transformed Curve */}
          <g className="main-curve-layer">
            {segments.map((pts, i) => (
              <polyline
                key={`main-seg-${i}`}
                points={pts}
                fill="none"
                stroke="url(#curve-gradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#curve-glow)"
                style={
                  isDrawing
                    ? {
                        strokeDasharray: 2000,
                        strokeDashoffset: (1 - drawProgress) * 2000,
                      }
                    : undefined
                }
              />
            ))}
          </g>

          {/* Automatic Points of Interest (POI) */}
          {showPOI && (
            <g className="poi-layer">
              {pois.map((poi, idx) => {
                const cx = toSvgX(poi.x);
                const cy = toSvgY(poi.y);
                const isHovered = hoveredPoi === poi;
                return (
                  <g
                    key={`poi-${idx}`}
                    className="poi-item"
                    onMouseEnter={() => setHoveredPoi(poi)}
                    onMouseLeave={() => setHoveredPoi(null)}
                    tabIndex={0}
                    role="button"
                    aria-label={poi.label}
                    onFocus={() => setHoveredPoi(poi)}
                    onBlur={() => setHoveredPoi(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setHoveredPoi(poi);
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Pulsing ring */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 12 : 8}
                      fill={
                        poi.type === "vertice"
                          ? "#f59e0b"
                          : poi.type === "raiz"
                            ? "#10b981"
                            : "#6366f1"
                      }
                      fillOpacity="0.25"
                      className="poi-pulse"
                    />
                    {/* Inner core */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 6 : 4.5}
                      fill={
                        poi.type === "vertice"
                          ? "#f59e0b"
                          : poi.type === "raiz"
                            ? "#10b981"
                            : "#6366f1"
                      }
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* Draggable Movable Control Point (Vertex/Anchor) */}
          {interactivePoints && vertexSvg && (
            <g
              className="draggable-anchor-point"
              transform={`translate(${vertexSvg.x}, ${vertexSvg.y})`}
              onPointerDown={handlePointerDownVertex}
              tabIndex={0}
              role="button"
              aria-label="Mover punto de referencia: flechas para cambiar h y k"
              onKeyDown={(e) => {
                if (
                  !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                    e.key,
                  )
                )
                  return;
                e.preventDefault();
                onChangeParams((p) => ({
                  ...p,
                  h: Math.max(
                    -5,
                    Math.min(
                      5,
                      p.h +
                        (e.key === "ArrowRight"
                          ? 0.25
                          : e.key === "ArrowLeft"
                            ? -0.25
                            : 0),
                    ),
                  ),
                  k: Math.max(
                    -5,
                    Math.min(
                      5,
                      p.k +
                        (e.key === "ArrowUp"
                          ? 0.25
                          : e.key === "ArrowDown"
                            ? -0.25
                            : 0),
                    ),
                  ),
                }));
              }}
              style={{ cursor: isDraggingVertex ? "grabbing" : "grab" }}
            >
              {/* Outer touch target halo */}
              <circle
                r="22"
                fill="#6366f1"
                fillOpacity={isDraggingVertex ? 0.35 : 0.15}
              />
              {/* Interactive Core */}
              <circle
                r="7.5"
                fill="#ffffff"
                stroke="#6366f1"
                strokeWidth="3.5"
                filter="url(#curve-glow)"
              />
              {/* Label */}
              <text
                y="-14"
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="currentColor"
                className="draggable-label"
              >
                ({params.h}, {params.k})
              </text>
            </g>
          )}
        </svg>

        {/* Floating Tooltip for Hovered POI */}
        {hoveredPoi && (
          <div
            className="poi-floating-tooltip"
            style={{
              left: Math.min(
                width - 120,
                Math.max(10, toSvgX(hoveredPoi.x) - 40),
              ),
              top: Math.max(10, toSvgY(hoveredPoi.y) - 45),
            }}
          >
            {hoveredPoi.label}
          </div>
        )}

        {/* Pan / Drag Indicator Helper */}
        <div className="canvas-hint">
          <span>
            💡 Arrastra el punto blanco para mover la función o el lienzo para
            navegar
          </span>
        </div>
      </div>

      <details className="graph-description">
        <summary>Descripción y navegación accesible</summary>
        <p>
          Función {params.family}. Parámetros a={params.a}, b={params.b}, h=
          {params.h}, k={params.k}.
        </p>
        <ul>
          {pois.map((poi, i) => (
            <li key={i}>{poi.label}</li>
          ))}
        </ul>
        <div role="group" aria-label="Desplazar vista">
          {(["Izquierda", "Derecha", "Arriba", "Abajo"] as const).map(
            (direction) => (
              <button
                key={direction}
                onClick={() =>
                  setView((v) => {
                    const dx =
                      direction === "Derecha"
                        ? 1
                        : direction === "Izquierda"
                          ? -1
                          : 0;
                    const dy =
                      direction === "Arriba"
                        ? 1
                        : direction === "Abajo"
                          ? -1
                          : 0;
                    return {
                      minX: v.minX + dx,
                      maxX: v.maxX + dx,
                      minY: v.minY + dy,
                      maxY: v.maxY + dy,
                    };
                  })
                }
              >
                {direction}
              </button>
            ),
          )}
        </div>
      </details>

      {/* Domain & Range Bottom Pill Bar */}
      {showDomainRange && (
        <div className="domain-range-summary">
          <div className="summary-item domain-item">
            <span className="summary-dot dot-domain" />
            <span className="summary-title">Dominio:</span>
            <span className="summary-val">
              <Formula latex={`\\text{Dom} = ${domainRange.domainLatex}`} />
            </span>
          </div>
          <div className="summary-item range-item">
            <span className="summary-dot dot-range" />
            <span className="summary-title">Rango:</span>
            <span className="summary-val">
              <Formula latex={`\\text{Ran} = ${domainRange.rangeLatex}`} />
            </span>
          </div>
        </div>
      )}

      {/* Tangent Point Slider if enabled */}
      {showTangent && (
        <div className="tangent-control-row">
          <div className="tangent-control-label">
            <TrendingUp size={15} />
            <span>Punto de análisis en la curva (x₀):</span>
            <b>{xTangent.toFixed(2)}</b>
          </div>
          <input
            type="range"
            aria-label="Punto de tangencia x cero"
            min={view.minX + 1}
            max={view.maxX - 1}
            step="0.1"
            value={xTangent}
            onChange={(e) => setXTangent(Number(e.target.value))}
            className="tangent-slider"
          />
        </div>
      )}
      {showTangent && !tangent && (
        <p role="status">
          No existe una tangente de pendiente finita en este punto.
        </p>
      )}
    </div>
  );
};
