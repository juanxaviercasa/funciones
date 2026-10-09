import { shuffledChoices } from "./adaptive";
export type Exercise = {
  id: string;
  module: number;
  skill: string;
  difficulty: "Básica" | "Intermedia" | "Avanzada";
  q: string;
  options: string[];
  correct: number;
  hint: string;
  explanation: string;
  answer: number;
  unit?: string;
};
const skills = [
  "Álgebra",
  "Notación",
  "Dominio",
  "Rango",
  "Lineales",
  "Transformaciones",
  "Composición",
  "Modelación",
];
const levels = ["Básica", "Intermedia", "Avanzada"] as const;
function template(
  module: number,
  level: number,
  n: number,
): Omit<
  Exercise,
  "id" | "module" | "skill" | "difficulty" | "options" | "correct"
> {
  const m = n + 1;
  const items = [
    [
      [
        `Resuelve $${m}x+${n}=${m * 3 + n}$.`,
        3,
        "Resta la constante y divide entre el coeficiente.",
        `$${m}x=${m * 3}$; por tanto $x=3$.`,
      ],
      [
        `Resuelve $${m}(x-${n})=${m * 2}$.`,
        n + 2,
        "Divide antes de deshacer la resta.",
        `$x-${n}=2$ y $x=${n + 2}$.`,
      ],
      [
        `Resuelve $${m}x-${n}=${n}x+${2 * n}$.`,
        3 * n,
        "Agrupa términos en x y constantes.",
        `$(${m}-${n})x=${3 * n}$; luego $x=${3 * n}$.`,
      ],
    ],
    [
      [
        `Si $f(x)=${m}x-${n}$, calcula $f(2)$.`,
        2 * m - n,
        "Sustituye x por 2.",
        `$f(2)=${m}(2)-${n}=${2 * m - n}$.`,
      ],
      [
        `Si $f(x)=x^2-${n}x+1$, calcula $f(-2)$.`,
        5 + 2 * n,
        "Cuida el signo negativo dentro del cuadrado.",
        `$f(-2)=4+${2 * n}+1=${5 + 2 * n}$.`,
      ],
      [
        `Si $f(x)=${m}x+${n}$, ¿qué entrada produce $${m * 4 + n}$?`,
        4,
        "Iguala la función a la salida buscada.",
        `$${m}x+${n}=${m * 4 + n}$ implica $x=4$.`,
      ],
    ],
    [
      [
        `¿Qué valor se excluye de $f(x)=\\frac{1}{x-${n}}$?`,
        n,
        "Un denominador nunca vale cero.",
        `$x-${n}=0$ cuando $x=${n}$.`,
      ],
      [
        `¿Cuál es el menor x permitido en $f(x)=\\sqrt{${m}x-${m * n}}$?`,
        n,
        "El radicando debe ser no negativo.",
        `$${m}x-${m * n}\\geq0$ equivale a $x\\geq${n}$.`,
      ],
      [
        `Al simplificar $\\frac{x^2-${n * n}}{x-${n}}$, ¿qué valor continúa excluido?`,
        n,
        "La restricción original sigue vigente tras cancelar.",
        `$x^2-${n * n}=(x-${n})(x+${n})$, pero $x=${n}$ nunca estuvo permitido.`,
      ],
    ],
    [
      [
        `¿Cuál es el mínimo de $f(x)=(x-${n})^2+${m}$?`,
        m,
        "El cuadrado alcanza cero.",
        `El vértice es $(${n},${m})$ y el mínimo es $${m}$.`,
      ],
      [
        `¿Cuál es el máximo de $f(x)=-${m}(x+1)^2+${n}$?`,
        n,
        "Una parábola que abre hacia abajo tiene máximo.",
        `El término cuadrático es no positivo y el máximo es $${n}$.`,
      ],
      [
        `En $f(x)=\\sqrt{x-${n}}-${m}$, ¿cuál es el menor valor del rango?`,
        -m,
        "La raíz toma valores no negativos.",
        `La raíz alcanza 0 en $x=${n}$, así que el mínimo es $-${m}$.`,
      ],
    ],
    [
      [
        `Pendiente de $f(x)=-${m}x+${n}$.`,
        -m,
        "La pendiente es el coeficiente de x.",
        `$m=-${m}$. El signo negativo indica descenso.`,
      ],
      [
        `Pendiente entre $(1,${n})$ y $(3,${n + 2 * m})$.`,
        m,
        "Divide el cambio vertical entre el horizontal.",
        `$\\frac{${n + 2 * m}-${n}}{3-1}=${m}$.`,
      ],
      [
        `¿Dónde corta el eje x la recta $f(x)=${m}x-${m * n}$? Escribe la coordenada x.`,
        n,
        "En el eje x, y vale cero.",
        `$0=${m}x-${m * n}$; por tanto $x=${n}$.`,
      ],
    ],
    [
      [
        `En $g(x)=(x-${n})^2$, ¿cuál es la coordenada x del vértice?`,
        n,
        "En (x-h)², el vértice utiliza h.",
        `El vértice es $(${n},0)$.`,
      ],
      [
        `En $g(x)=-${m}(x+${n})^2+2$, ¿cuál es h?`,
        -n,
        "Reescribe x+n como x-(-n).",
        `$h=-${n}$; la reflexión vertical no cambia h.`,
      ],
      [
        `Si $f(x)=x^2$ y $g(x)=f(${m}x)$, ¿cuál es el coeficiente de $x^2$?`,
        m * m,
        "Eleva al cuadrado todo el argumento.",
        `$(${m}x)^2=${m * m}x^2$.`,
      ],
    ],
    [
      [
        `Si $f(x)=x+${n}$ y $g(x)=2x$, calcula $(f\\circ g)(3)$.`,
        6 + n,
        "Aplica g y después f.",
        `$g(3)=6$, $f(6)=${6 + n}$.`,
      ],
      [
        `Si $f(x)=x^2$ y $g(x)=x-${n}$, calcula $(g\\circ f)(2)$.`,
        4 - n,
        "El orden importa: primero f.",
        `$f(2)=4$, $g(4)=${4 - n}$.`,
      ],
      [
        `Para $f(x)=${m}x+${n}$, calcula $f^{-1}(${m * 5 + n})$.`,
        5,
        "La inversa deshace la operación.",
        `$f^{-1}(y)=(y-${n})/${m}$ y el resultado es 5.`,
      ],
    ],
    [
      [
        `Un taxi cobra ${n} soles de inicio y ${m} soles/km. ¿Costo de 3 km, en soles?`,
        n + 3 * m,
        "Suma tarifa fija y costo variable.",
        `$C(3)=${n}+${m}(3)=${n + 3 * m}$ soles.`,
      ],
      [
        `Un tanque tiene ${m * 10} litros y pierde ${m} litros/min. ¿En cuántos minutos se vacía?`,
        10,
        "Iguala el volumen a cero.",
        `$V(t)=${m * 10}-${m}t=0$ implica $t=10$ minutos.`,
      ],
      [
        `Ingresos $I(q)=${m + 2}q$, costos $C(q)=${m}q+${2 * n}$. ¿Cuántas unidades equilibran ingreso y costo?`,
        n,
        "Iguala las dos funciones.",
        `$(${m + 2}-${m})q=${2 * n}$ y $q=${n}$.`,
      ],
    ],
  ];
  const [q, answer, hint, explanation] = items[module][level];
  return {
    q: String(q),
    answer: Number(answer),
    hint: String(hint),
    explanation: String(explanation),
  };
}
export const learningBank: Exercise[] = Array.from({ length: 216 }, (_, i) => {
  const module = i % 8,
    level = Math.floor(i / 8) % 3,
    n = Math.floor(i / 24) + 1;
  const item = template(module, level, n);
  const options = [
    item.answer,
    item.answer + 1,
    item.answer - 2,
    -item.answer - 3,
  ];
  const unique = new Set<number>();
  const choices = options.map((number) => {
    while (unique.has(number)) number++;
    unique.add(number);
    return `$${number}$`;
  });
  return {
    ...item,
    id: `v2-${module}-${level}-${n}`,
    module,
    skill: skills[module],
    difficulty: levels[level],
    options: choices,
    correct: 0,
  };
});
export const sessionQuestion = (exercise: Exercise) =>
  shuffledChoices(exercise);

// Cover the three conceptual skills that otherwise existed only in diagnosis.
for (let index = 0; index < 27; index++) {
  const topic = index % 3,
    level = Math.floor(index / 3) % 3,
    n = Math.floor(index / 9) + 1,
    m = n + 1;
  const topics = ["Fundamentos", "Gráficas", "Cuadráticas"];
  const variants: [string, number, string][] =
    topic === 0
      ? [
          [
            `En una función, ¿cuántas salidas diferentes recibe la entrada $${n}$ de su dominio?`,
            1,
            "Cada entrada del dominio recibe exactamente una salida.",
          ],
          [
            `La relación contiene $(${n},${m}),(${n},${m + 1}),(${n + 2},${m})$. ¿Cuántas salidas tiene la entrada $${n}$?`,
            2,
            "La misma entrada recibe dos salidas distintas: esta relación no es función.",
          ],
          [
            `Para $f(x)=${n}$, ¿cuántas salidas distintas tienen las entradas $0,1,2$ en conjunto?`,
            1,
            "Una función constante asigna la misma salida a distintas entradas. Sigue siendo función.",
          ],
        ]
      : topic === 1
        ? [
            [
              `La gráfica pasa por $(${n},${m})$. ¿Cuánto vale $f(${n})$?`,
              m,
              "La primera coordenada es la entrada; la segunda es la salida.",
            ],
            [
              `Una recta pasa por $(0,${n})$ y $(2,${n + 2 * m})$. ¿Cuál es su pendiente?`,
              m,
              `La razón de cambios es $\\frac{${2 * m}}{2}=${m}$.`,
            ],
            [
              `Una parábola tiene vértice $(${n},-${m})$ y abre hacia arriba. ¿Cuál es la menor salida?`,
              -m,
              `El vértice marca el mínimo: $-${m}$.`,
            ],
          ]
        : [
            [
              `¿Cuál es la coordenada x del vértice de $f(x)=(x-${n})^2+${m}$?`,
              n,
              `El vértice es $(${n},${m})$.`,
            ],
            [
              `¿Cuál es la raíz positiva de $f(x)=x^2-${n * n}$?`,
              n,
              `La factorización es $(x-${n})(x+${n})$, con raíces $-${n}$ y $${n}$.`,
            ],
            [
              `¿Cuál es el discriminante de $x^2-${2 * n}x+${n * n - m}=0$?`,
              4 * m,
              `$\\Delta=b^2-4ac=${4 * n * n}-4(${n * n - m})=${4 * m}$.`,
            ],
          ];
  const [q, answer, explanation] = variants[level];
  const seen = new Set<number>();
  const options = [answer, answer + 1, answer - 2, -answer - 3].map((value) => {
    while (seen.has(value)) value++;
    seen.add(value);
    return `$${value}$`;
  });
  learningBank.push({
    id: `v2-concept-${topic}-${level}-${n}`,
    module: topic === 0 ? 1 : 4,
    skill: topics[topic],
    difficulty: levels[level],
    q,
    answer,
    explanation,
    hint:
      level === 0
        ? "Identifica qué representa cada dato."
        : "Relaciona la definición con los datos antes de calcular.",
    options,
    correct: 0,
  });
}

// Restricted numeric parser: never executes submitted text as code.
export function numericAnswer(value: string): number | null {
  const text = value
    .replace(/\s|\\left|\\right/g, "")
    .replace(/,/g, ".")
    .replace(/[−–]/g, "-");
  const fraction = text.match(
    /^(-?)\\(?:d?frac)\{(-?\d+(?:\.\d+)?)\}\{(-?\d+(?:\.\d+)?)\}$/,
  );
  const simple = text.match(/^(-?\d+(?:\.\d+)?)(?:\/(-?\d+(?:\.\d+)?))?$/);
  let result = NaN;
  if (fraction)
    result =
      ((fraction[1] ? -1 : 1) * Number(fraction[2])) / Number(fraction[3]);
  else if (simple)
    result = Number(simple[1]) / (simple[2] ? Number(simple[2]) : 1);
  return Number.isFinite(result) ? result : null;
}
