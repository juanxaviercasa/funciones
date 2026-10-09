export type Family = "lineal" | "cuadratica" | "absoluto" | "cubica" | "raiz";
export type Params = {
  a: number;
  b: number;
  h: number;
  k: number;
  family: Family;
};
export type Point = { x: number; y: number };
export const parameterKey = (p: Params) =>
  [p.family, p.a, p.b, p.h, p.k].join(":");
const MAX_GRAPH_SAMPLES = 5000;
export const evaluate = (x: number, p: Params) => {
  if (!Number.isFinite(x) || ![p.a, p.b, p.h, p.k].every(Number.isFinite))
    return NaN;
  const z = p.b * (x - p.h);
  switch (p.family) {
    case "lineal":
      return p.a * z + p.k;
    case "absoluto":
      return p.a * Math.abs(z) + p.k;
    case "cubica":
      return p.a * z * z * z + p.k;
    case "raiz":
      return z < 0 ? NaN : p.a * Math.sqrt(z) + p.k;
    case "cuadratica":
      return p.a * z * z + p.k;
    default:
      return NaN;
  }
};
export const pointSegments = (
  p: Params,
  min = -6,
  max = 6,
  step = 0.08,
  maxAbsY = 30,
): Point[][] => {
  if (
    ![min, max, step, maxAbsY].every(Number.isFinite) ||
    step <= 0 ||
    max <= min ||
    maxAbsY <= 0
  )
    throw new RangeError(
      "Los límites y el paso de la gráfica deben ser finitos y positivos.",
    );
  const sampleCount = Math.ceil((max - min) / step) + 1;
  if (sampleCount > MAX_GRAPH_SAMPLES)
    throw new RangeError(
      `La gráfica no puede superar ${MAX_GRAPH_SAMPLES} muestras.`,
    );
  const segments: Point[][] = [];
  let current: Point[] = [];
  for (let i = 0; i < sampleCount; i++) {
    const x = Math.min(max, min + i * step);
    const y = evaluate(x, p);
    if (Number.isFinite(y) && Math.abs(y) <= maxAbsY) {
      current.push({ x, y });
      continue;
    }
    if (current.length) segments.push(current);
    current = [];
  }
  if (current.length) segments.push(current);
  return segments;
};
export const points = (p: Params, min = -6, max = 6, step = 0.08) =>
  pointSegments(p, min, max, step).flat();
export const normalize = (v: string) =>
  v
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/,/g, ".")
    .replace(/[−–]/g, "-");
export const answerMatches = (value: string, answers: string[]) =>
  answers.some((a) => normalize(a) === normalize(value));
export const masteryAfter = (
  current: number,
  correct: boolean,
  attempt: number,
) =>
  Math.max(
    0,
    Math.min(
      100,
      Math.round(current + (correct ? Math.max(3, 10 - attempt * 2) : -4)),
    ),
  );

export type POI = {
  type: "vertice" | "corte-y" | "raiz";
  label: string;
  x: number;
  y: number;
};

export const getPointsOfInterest = (p: Params): POI[] => {
  const result: POI[] = [];
  const yIntercept = evaluate(0, p);
  if (Number.isFinite(yIntercept)) {
    result.push({
      type: "corte-y",
      label: `Corte Y: (0, ${+yIntercept.toFixed(2)})`,
      x: 0,
      y: yIntercept,
    });
  }

  // Vértice o punto característico (h, k)
  if (
    p.a !== 0 &&
    p.b !== 0 &&
    ["cuadratica", "absoluto", "cubica", "raiz"].includes(p.family)
  ) {
    const vY = evaluate(p.h, p);
    if (Number.isFinite(vY)) {
      const label =
        p.family === "cuadratica"
          ? `Vértice: (${+p.h.toFixed(2)}, ${+vY.toFixed(2)})`
          : p.family === "absoluto"
            ? `Vértice: (${+p.h.toFixed(2)}, ${+vY.toFixed(2)})`
            : p.family === "raiz"
              ? `Origen: (${+p.h.toFixed(2)}, ${+vY.toFixed(2)})`
              : `Inflexión: (${+p.h.toFixed(2)}, ${+vY.toFixed(2)})`;
      result.push({
        type: "vertice",
        label,
        x: p.h,
        y: vY,
      });
    }
  }

  // Raíces (f(x) = 0)
  if (p.family === "lineal") {
    // a * b * (x - h) + k = 0 => x = h - k / (a * b)
    const slope = p.a * p.b;
    if (Math.abs(slope) > 1e-6) {
      const rx = p.h - p.k / slope;
      if (Number.isFinite(rx)) {
        result.push({
          type: "raiz",
          label: `Raíz: (${+rx.toFixed(2)}, 0)`,
          x: rx,
          y: 0,
        });
      }
    }
  } else if (p.family === "cuadratica") {
    // a * [b(x - h)]^2 + k = 0 => [b(x - h)]^2 = -k / a
    if (Math.abs(p.a) > 1e-6 && Math.abs(p.b) > 1e-6) {
      const target = -p.k / p.a;
      if (target >= 0) {
        const sqrtVal = Math.sqrt(target) / Math.abs(p.b);
        if (sqrtVal === 0) {
          result.push({
            type: "raiz",
            label: `Raíz única: (${+p.h.toFixed(2)}, 0)`,
            x: p.h,
            y: 0,
          });
        } else {
          const r1 = p.h - sqrtVal;
          const r2 = p.h + sqrtVal;
          result.push({
            type: "raiz",
            label: `Raíz 1: (${+r1.toFixed(2)}, 0)`,
            x: r1,
            y: 0,
          });
          result.push({
            type: "raiz",
            label: `Raíz 2: (${+r2.toFixed(2)}, 0)`,
            x: r2,
            y: 0,
          });
        }
      }
    }
  } else if (p.family === "absoluto") {
    // a * |b(x - h)| + k = 0 => |b(x - h)| = -k / a
    if (Math.abs(p.a) > 1e-6 && Math.abs(p.b) > 1e-6) {
      const target = -p.k / p.a;
      if (target >= 0) {
        const span = target / Math.abs(p.b);
        if (span === 0) {
          result.push({
            type: "raiz",
            label: `Raíz: (${+p.h.toFixed(2)}, 0)`,
            x: p.h,
            y: 0,
          });
        } else {
          result.push({
            type: "raiz",
            label: `Raíz 1: (${+(p.h - span).toFixed(2)}, 0)`,
            x: p.h - span,
            y: 0,
          });
          result.push({
            type: "raiz",
            label: `Raíz 2: (${+(p.h + span).toFixed(2)}, 0)`,
            x: p.h + span,
            y: 0,
          });
        }
      }
    }
  } else if (p.family === "cubica") {
    // a * [b(x - h)]^3 + k = 0 => [b(x - h)]^3 = -k / a
    if (Math.abs(p.a) > 1e-6 && Math.abs(p.b) > 1e-6) {
      const target = -p.k / p.a;
      const cbrt = Math.cbrt(target) / p.b;
      const rx = p.h + cbrt;
      if (Number.isFinite(rx)) {
        result.push({
          type: "raiz",
          label: `Raíz: (${+rx.toFixed(2)}, 0)`,
          x: rx,
          y: 0,
        });
      }
    }
  } else if (p.family === "raiz") {
    // a * sqrt(b(x - h)) + k = 0 => sqrt(b(x-h)) = -k/a
    if (Math.abs(p.a) > 1e-6 && Math.abs(p.b) > 1e-6) {
      const target = -p.k / p.a;
      if (target >= 0) {
        const rx = p.h + (target * target) / p.b;
        if (Number.isFinite(rx)) {
          result.push({
            type: "raiz",
            label: `Raíz: (${+rx.toFixed(2)}, 0)`,
            x: rx,
            y: 0,
          });
        }
      }
    }
  }

  return result;
};

export type DomainRangeInfo = {
  domainLatex: string;
  rangeLatex: string;
  domainInterval: {
    start: number | null;
    end: number | null;
    includeStart: boolean;
    includeEnd: boolean;
  };
  rangeInterval: {
    start: number | null;
    end: number | null;
    includeStart: boolean;
    includeEnd: boolean;
  };
};

export const getDomainAndRange = (p: Params): DomainRangeInfo => {
  const hStr = +p.h.toFixed(2);
  const kStr = +p.k.toFixed(2);

  const all = {
    start: null,
    end: null,
    includeStart: false,
    includeEnd: false,
  };
  if (p.b === 0 || (p.a === 0 && p.family !== "raiz")) {
    return {
      domainLatex: "\\mathbb{R}",
      rangeLatex: `\\{${kStr}\\}`,
      domainInterval: all,
      rangeInterval: {
        start: p.k,
        end: p.k,
        includeStart: true,
        includeEnd: true,
      },
    };
  }

  if (p.family === "raiz") {
    const isForward = p.b > 0;
    const domLatex = isForward ? `[${hStr}, \\infty)` : `(-\\infty, ${hStr}]`;
    const domInterval = isForward
      ? { start: p.h, end: null, includeStart: true, includeEnd: false }
      : { start: null, end: p.h, includeStart: false, includeEnd: true };

    if (p.a === 0)
      return {
        domainLatex: domLatex,
        rangeLatex: `\\{${kStr}\\}`,
        domainInterval: domInterval,
        rangeInterval: {
          start: p.k,
          end: p.k,
          includeStart: true,
          includeEnd: true,
        },
      };
    const isUpward = p.a > 0;
    const ranLatex = isUpward ? `[${kStr}, \\infty)` : `(-\\infty, ${kStr}]`;
    const ranInterval = isUpward
      ? { start: p.k, end: null, includeStart: true, includeEnd: false }
      : { start: null, end: p.k, includeStart: false, includeEnd: true };

    return {
      domainLatex: domLatex,
      rangeLatex: ranLatex,
      domainInterval: domInterval,
      rangeInterval: ranInterval,
    };
  }

  if (p.family === "cuadratica" || p.family === "absoluto") {
    const domLatex = "(-\\infty, \\infty) = \\mathbb{R}";
    const isUpward = p.a > 0;
    const ranLatex = isUpward ? `[${kStr}, \\infty)` : `(-\\infty, ${kStr}]`;
    const ranInterval = isUpward
      ? { start: p.k, end: null, includeStart: true, includeEnd: false }
      : { start: null, end: p.k, includeStart: false, includeEnd: true };

    return {
      domainLatex: domLatex,
      rangeLatex: ranLatex,
      domainInterval: {
        start: null,
        end: null,
        includeStart: false,
        includeEnd: false,
      },
      rangeInterval: ranInterval,
    };
  }

  // Lineal o Cúbica
  return {
    domainLatex: "(-\\infty, \\infty) = \\mathbb{R}",
    rangeLatex: "(-\\infty, \\infty) = \\mathbb{R}",
    domainInterval: {
      start: null,
      end: null,
      includeStart: false,
      includeEnd: false,
    },
    rangeInterval: {
      start: null,
      end: null,
      includeStart: false,
      includeEnd: false,
    },
  };
};

export const getTangentLine = (
  x0: number,
  p: Params,
  delta = 0.001,
): { slope: number; intercept: number; x0: number; y0: number } | null => {
  const y0 = evaluate(x0, p);
  if (!Number.isFinite(y0)) return null;

  if (!Number.isFinite(delta) || delta <= 0) return null;
  const z = p.b * (x0 - p.h);
  if (
    p.a !== 0 &&
    p.b !== 0 &&
    ((p.family === "absoluto" && z === 0) || (p.family === "raiz" && z <= 0))
  )
    return null;
  const slope =
    p.a === 0 || p.b === 0
      ? 0
      : p.family === "lineal"
        ? p.a * p.b
        : p.family === "cuadratica"
          ? 2 * p.a * p.b * z
          : p.family === "cubica"
            ? 3 * p.a * p.b * z * z
            : p.family === "absoluto"
              ? p.a * p.b * Math.sign(z)
              : (p.a * p.b) / (2 * Math.sqrt(z));
  if (!Number.isFinite(slope)) return null;

  const intercept = y0 - slope * x0;
  return { slope, intercept, x0, y0 };
};

export function functionLatex(p: Params): string {
  const z = `${p.b}(x${p.h >= 0 ? "-" : "+"}${Math.abs(p.h)})`;
  const term =
    p.family === "lineal"
      ? `\\left(${z}\\right)`
      : p.family === "cuadratica"
        ? `\\left(${z}\\right)^2`
        : p.family === "cubica"
          ? `\\left(${z}\\right)^3`
          : p.family === "absoluto"
            ? `\\left|${z}\\right|`
            : `\\sqrt{${z}}`;
  return `g(x)=${p.a}${term}${p.k >= 0 ? "+" : "-"}${Math.abs(p.k)}`;
}
