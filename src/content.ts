export type Challenge = {
  q: string;
  options: string[];
  correct: number;
  hint: string;
  why: string;
};
export type Lesson = {
  id: string;
  module: number;
  skill: string;
  level: "inicial" | "intermedio" | "avanzado";
  prerequisites: string[];
  tags: string[];
  durationMinutes: number;
  title: string;
  eyebrow: string;
  objective: string;
  intuition: string;
  formal: string;
  mistake: string;
  example: { question: string; steps: string[] };
  challenge: Challenge;
  secondChallenge: Challenge;
};
export const modules = [
  ["Diagnóstico y prerrequisitos", "Álgebra, intervalos y plano cartesiano", 0],
  ["Fundamentos", "Relaciones, notación y evaluación", 35],
  ["Dominio y rango", "Restricciones y lectura gráfica", 58],
  ["Análisis gráfico", "Crecimiento, extremos y simetría", 22],
  ["Familias de funciones", "Lineal, cuadrática, racional y más", 16],
  ["Transformaciones", "Traslaciones, reflejos y escalas", 10],
  ["Composición e inversa", "Operaciones, composición e inversa", 0],
  ["Modelación", "Problemas tipo admisión", 0],
];
export const lessons: Lesson[] = [
  {
    id: "que-es",
    module: 1,
    skill: "Fundamentos",
    level: "inicial",
    prerequisites: [],
    tags: ["relaciones", "notación", "unicidad"],
    durationMinutes: 12,
    title: "¿Qué es una función?",
    eyebrow: "Fundamentos · 12 min",
    objective:
      "Distinguir funciones de relaciones usando representaciones y la regla de unicidad.",
    intuition:
      "Imagina una máquina: introduces un valor $x$ y la regla produce exactamente una salida. Distintas entradas pueden compartir salida, pero una entrada no puede tener dos salidas.",
    formal:
      "Una función $f: A \\to B$ asigna a cada elemento $x$ del dominio $A$ un único elemento $f(x)$ del codominio $B$.",
    mistake:
      "“Cada salida debe ser diferente”. Falso: $f(2)=4$ y $f(-2)=4$ es válido. Lo obligatorio es una sola salida por entrada.",
    example: {
      question: "¿La relación $\\{(1,3),(2,5),(1,7)\\}$ es función?",
      steps: [
        "Observa las primeras coordenadas: 1, 2 y 1.",
        "La entrada 1 aparece con las salidas 3 y 7.",
        "Una entrada tiene dos imágenes. Por tanto, no es función.",
      ],
    },
    challenge: {
      q: "¿Cuál relación sí representa una función?",
      options: [
        "{(1,2),(1,4)}",
        "{(1,2),(2,2)}",
        "x² + y² = 1",
        "Una recta vertical",
      ],
      correct: 1,
      hint: "Revisa si alguna entrada se repite con otra salida.",
      why: "Las entradas 1 y 2 tienen exactamente una salida; ambas pueden compartir el valor 2.",
    },
    secondChallenge: {
      q: "¿La relación $\\{(0,1),(1,1),(2,3)\\}$ es una función?",
      options: [
        "Sí, cada entrada tiene una sola salida",
        "No, las salidas se repiten",
        "No, hay tres pares",
        "Solo si las salidas son distintas",
      ],
      correct: 0,
      hint: "Compara las primeras coordenadas de los pares ordenados.",
      why: "Las entradas 0, 1 y 2 aparecen una vez cada una; compartir salida sí está permitido.",
    },
  },
  {
    id: "dominio",
    module: 2,
    skill: "Dominio",
    level: "inicial",
    prerequisites: ["que-es"],
    tags: ["dominio", "restricciones", "intervalos"],
    durationMinutes: 16,
    title: "Dominio y rango",
    eyebrow: "Dominio y rango · 16 min",
    objective:
      "Determinar el conjunto de entradas permitidas y las salidas posibles.",
    intuition:
      "El dominio responde “¿qué puedo introducir?”; el rango responde “¿qué resultados puedo obtener?”. Las restricciones nacen de operaciones imposibles en los reales.",
    formal:
      "$\\operatorname{Dom}(f)=\\{x\\in\\mathbb{R}\\mid f(x)\\text{ está definida}\\}$. $\\operatorname{Ran}(f)=\\{f(x)\\mid x\\in\\operatorname{Dom}(f)\\}.$",
    mistake:
      "Cancelar factores y olvidar la restricción original. En $\\frac{x^2-1}{x-1}$, $x=1$ sigue excluido aunque la expresión se simplifique a $x+1$.",
    example: {
      question: "Halla el dominio de $f(x)=\\frac{\\sqrt{x-2}}{x-5}$.",
      steps: [
        "Para la raíz: $x-2 \\geq 0$, luego $x \\geq 2$.",
        "Para el denominador: $x-5 \\neq 0$, luego $x \\neq 5$.",
        "Intersección: $[2,5) \\cup (5,\\infty)$.",
      ],
    },
    challenge: {
      q: "Dominio de $g(x)=\\frac{1}{x^2-9}$",
      options: [
        "$\\mathbb{R}$",
        "$\\mathbb{R}\\setminus\\{3\\}$",
        "$\\mathbb{R}\\setminus\\{-3,3\\}$",
        "$(-3,3)$",
      ],
      correct: 2,
      hint: "Factoriza el denominador y excluye sus ceros.",
      why: "$x^2-9=(x-3)(x+3)$; el denominador se anula en $-3$ y $3$.",
    },
    secondChallenge: {
      q: "Dominio real de $h(x)=\\sqrt{x+4}$",
      options: [
        "$[-4,\\infty)$",
        "$( -\\infty,-4]$",
        "$(-4,\\infty)$",
        "$\\mathbb{R}$",
      ],
      correct: 0,
      hint: "El radicando debe ser mayor o igual que cero.",
      why: "$x+4\\geq0$ implica $x\\geq-4$, incluyendo el extremo.",
    },
  },
  {
    id: "lineal",
    module: 4,
    skill: "Lineales",
    level: "inicial",
    prerequisites: ["que-es"],
    tags: ["pendiente", "intercepto", "rectas"],
    durationMinutes: 14,
    title: "Función lineal y afín",
    eyebrow: "Familias · 14 min",
    objective:
      "Interpretar pendiente e intercepto y construir la recta desde datos.",
    intuition:
      "La pendiente mide cuánto cambia y cuando x aumenta una unidad. Una pendiente positiva sube; una negativa baja.",
    formal:
      "$f(x)=mx+b$. La pendiente es $m=\\frac{\\Delta y}{\\Delta x}$ y el intercepto vertical es $(0,b)$.",
    mistake:
      "Confundir b con el corte en el eje x. b siempre es la salida cuando x=0.",
    example: {
      question: "Recta que pasa por $(1,3)$ y $(4,9)$.",
      steps: [
        "$m=\\frac{9-3}{4-1}=\\frac{6}{3}=2$.",
        "Usa $y=mx+b$ con $(1,3)$: $3=2(1)+b$.",
        "$b=1$. La función es $f(x)=2x+1$.",
      ],
    },
    challenge: {
      q: "Si $f(x)=-3x+6$, ¿dónde corta el eje $x$?",
      options: ["$(0,6)$", "$(2,0)$", "$(-2,0)$", "$(3,0)$"],
      correct: 1,
      hint: "En el eje x, la coordenada y vale cero.",
      why: "$0=-3x+6$ implica $x=2$.",
    },
    secondChallenge: {
      q: "Pendiente entre $(2,1)$ y $(5,10)$",
      options: ["$3$", "$\\frac{1}{3}$", "$9$", "$-3$"],
      correct: 0,
      hint: "Calcula el cociente de cambios $\\Delta y/\\Delta x$.",
      why: "$m=(10-1)/(5-2)=9/3=3$.",
    },
  },
  {
    id: "cuadratica",
    module: 4,
    skill: "Cuadráticas",
    level: "intermedio",
    prerequisites: ["lineal"],
    tags: ["parábola", "vértice", "simetría"],
    durationMinutes: 18,
    title: "Función cuadrática",
    eyebrow: "Familias · 18 min",
    objective:
      "Relacionar parámetros, vértice, eje y apertura de una parábola.",
    intuition:
      "Una cuadrática dibuja una parábola. El signo de a decide hacia dónde abre; |a| decide qué tan estrecha es.",
    formal:
      "$f(x)=a(x-h)^2+k$, $a\\neq 0$. Su vértice es $(h,k)$, su eje es $x=h$ y abre según el signo de $a$.",
    mistake:
      "Leer el vértice como (−h,k). En la forma (x−h)² el vértice usa h con signo opuesto al que aparece dentro.",
    example: {
      question: "Analiza $f(x)=-2(x-3)^2+8$.",
      steps: [
        "Vértice: $(3,8)$.",
        "Como $a=-2<0$, abre hacia abajo.",
        "Eje de simetría: $x=3$; valor máximo: $8$.",
      ],
    },
    challenge: {
      q: "Vértice de $y=3(x+2)^2-5$",
      options: ["$(2,-5)$", "$(-2,-5)$", "$(-2,5)$", "$(3,-5)$"],
      correct: 1,
      hint: "Reescribe x+2 como x−(−2).",
      why: "$h=-2$ y $k=-5$, por eso el vértice es $(-2,-5)$.",
    },
    secondChallenge: {
      q: "¿Cuál es el valor mínimo de $f(x)=2(x-1)^2+3$?",
      options: ["$3$", "$1$", "$2$", "No tiene mínimo"],
      correct: 0,
      hint: "La parábola abre hacia arriba y su vértice tiene ordenada 3.",
      why: "Como $a=2>0$, el mínimo se alcanza en el vértice $(1,3)$.",
    },
  },
  {
    id: "transformaciones",
    module: 5,
    skill: "Transformaciones",
    level: "intermedio",
    prerequisites: ["cuadratica"],
    tags: ["traslación", "reflexión", "escala"],
    durationMinutes: 20,
    title: "Transformaciones",
    eyebrow: "Transformaciones · 20 min",
    objective: "Predecir el efecto de a, b, h y k sobre una gráfica base.",
    intuition:
      "Piensa en la gráfica como una lámina elástica: h y k la desplazan; a la estira verticalmente o refleja; b modifica su escala horizontal.",
    formal:
      "$g(x)=a\\cdot f(b(x-h))+k$. $h$ desplaza horizontalmente, $k$ verticalmente, $a$ escala/refleja verticalmente y $b$ escala/refleja horizontalmente.",
    mistake:
      "Mover en la dirección equivocada: f(x−3) se desplaza 3 a la derecha, no a la izquierda.",
    example: {
      question: "Transforma $f(x)=x^2$ en $g(x)=-2(x-1)^2+3$.",
      steps: [
        "$x-1$: desplaza 1 a la derecha.",
        "$\\times(-2)$: estira verticalmente por 2 y refleja.",
        "$+3$: desplaza 3 hacia arriba.",
      ],
    },
    challenge: {
      q: "¿Qué hace $g(x)=f(x+4)-2$?",
      options: [
        "Derecha 4, arriba 2",
        "Izquierda 4, abajo 2",
        "Izquierda 2, abajo 4",
        "Refleja y desplaza",
      ],
      correct: 1,
      hint: "El cambio horizontal usa signo contrario; el vertical conserva el signo.",
      why: "x+4 mueve 4 a la izquierda y −2 mueve 2 hacia abajo.",
    },
    secondChallenge: {
      q: "En $g(x)=f(2x)$, ¿qué transformación horizontal ocurre?",
      options: [
        "Compresión por factor $1/2$",
        "Estiramiento por factor 2",
        "Traslación 2 a la derecha",
        "Reflexión respecto al eje $y$",
      ],
      correct: 0,
      hint: "El factor interior cambia la escala horizontal de manera inversa.",
      why: "$f(2x)$ comprime horizontalmente la gráfica por factor $1/2$.",
    },
  },
  {
    id: "lectura-grafica",
    module: 3,
    skill: "Gráficas",
    level: "intermedio",
    prerequisites: ["dominio", "cuadratica"],
    tags: ["intersecciones", "vértice", "rango"],
    durationMinutes: 15,
    title: "Lectura de gráficas",
    eyebrow: "Análisis gráfico · 15 min",
    objective:
      "Interpretar ceros, vértice, simetría e intervalo de valores desde una función cuadrática.",
    intuition:
      "Una gráfica reúne varias respuestas a la vez: sus cruces con los ejes, sus extremos y los valores que alcanza.",
    formal:
      "Para $f(x)=a(x-h)^2+k$, el vértice es $(h,k)$; si $a>0$, el rango es $[k,\\infty)$ y si $a<0$, es $(-\\infty,k]$.",
    mistake:
      "Confundir el dominio con el rango: el primero describe valores de entrada y el segundo valores de salida.",
    example: {
      question: "Analiza $f(x)=x^2-4$.",
      steps: [
        "Los ceros cumplen $x^2-4=0$, así que $x=-2$ o $x=2$.",
        "El vértice es $(0,-4)$ y la parábola abre hacia arriba.",
        "Su rango es $[-4,\\infty)$ y es simétrica respecto al eje $y$.",
      ],
    },
    challenge: {
      q: "¿Dónde corta el eje $x$ la gráfica de $f(x)=x^2-9$?",
      options: [
        "$(-3,0)$ y $(3,0)$",
        "$(0,-9)$",
        "$(-9,0)$ y $(9,0)$",
        "No lo corta",
      ],
      correct: 0,
      hint: "En el eje $x$, $y=0$; resuelve $x^2-9=0$.",
      why: "$x^2=9$ da $x=\\pm3$, por lo que los cortes son $(-3,0)$ y $(3,0)$.",
    },
    secondChallenge: {
      q: "Rango de $g(x)=(x-2)^2+1$",
      options: [
        "$[1,\\infty)$",
        "$[2,\\infty)$",
        "$(-\\infty,1]$",
        "$\\mathbb{R}$",
      ],
      correct: 0,
      hint: "La parábola abre hacia arriba y el vértice tiene ordenada 1.",
      why: "El valor mínimo es 1, así que $y\\geq1$.",
    },
  },
  {
    id: "valor-absoluto-raiz",
    module: 4,
    skill: "Familias",
    level: "inicial",
    prerequisites: ["que-es"],
    tags: ["valor absoluto", "raíz", "dominio", "rango"],
    durationMinutes: 14,
    title: "Valor absoluto y raíz",
    eyebrow: "Familias · 14 min",
    objective:
      "Reconocer las formas básicas de las funciones de valor absoluto y raíz cuadrada.",
    intuition:
      "El valor absoluto mide distancia y forma una V; la raíz cuadrada empieza donde su radicando deja de ser negativo.",
    formal:
      "La función $f(x)=|x-h|+k$ tiene vértice $(h,k)$ y rango $[k,\\infty)$. Para $g(x)=\\sqrt{x-h}$, el dominio es $[h,\\infty)$.",
    mistake:
      "Suponer que la raíz acepta cualquier real o que el vértice de $|x-h|+k$ cambia el dominio.",
    example: {
      question: "Determina dominio y rango de $f(x)=|x-3|-2$.",
      steps: [
        "El valor absoluto está definido para todo real: dominio $\\mathbb{R}$.",
        "El vértice ocurre cuando $x=3$ y vale $-2$.",
        "La gráfica abre hacia arriba, así que el rango es $[-2,\\infty)$.",
      ],
    },
    challenge: {
      q: "¿Cuál es el vértice de $f(x)=|x+4|+2$?",
      options: ["$(-4,2)$", "$(4,2)$", "$(-4,-2)$", "$(2,-4)$"],
      correct: 0,
      hint: "Escribe $x+4$ como $x-(-4)$.",
      why: "En $|x-h|+k$, el vértice es $(h,k)$; aquí $h=-4$ y $k=2$.",
    },
    secondChallenge: {
      q: "Dominio de $g(x)=\\sqrt{x-5}$",
      options: [
        "$[5,\\infty)$",
        "$(-\\infty,5]$",
        "$(5,\\infty)$",
        "$\\mathbb{R}$",
      ],
      correct: 0,
      hint: "Exige que el radicando sea no negativo e incluye cuando vale cero.",
      why: "$x-5\\geq0$ implica $x\\geq5$.",
    },
  },
  {
    id: "composicion-inversa",
    module: 6,
    skill: "Composición",
    level: "intermedio",
    prerequisites: ["lineal", "cuadratica"],
    tags: ["composición", "inversa", "orden"],
    durationMinutes: 18,
    title: "Composición e inversa",
    eyebrow: "Composición e inversa · 18 min",
    objective:
      "Evaluar una composición respetando el orden y hallar la inversa de una función lineal.",
    intuition:
      "En una composición, la salida de la primera función se convierte en la entrada de la siguiente; invertir una función deshace ese proceso.",
    formal:
      "$(f\\circ g)(x)=f(g(x))$. La inversa satisface $f^{-1}(f(x))=x$ en dominios compatibles.",
    mistake:
      "Cambiar el orden: $f\\circ g$ significa aplicar primero $g$ y luego $f$.",
    example: {
      question: "Sean $f(x)=2x+1$ y $g(x)=x^2$. Calcula $(f\\circ g)(3)$.",
      steps: [
        "Primero $g(3)=3^2=9$.",
        "Luego evalúa $f(9)=2(9)+1$.",
        "Por tanto, $(f\\circ g)(3)=19$.",
      ],
    },
    challenge: {
      q: "Si $f(x)=2x+1$ y $g(x)=x^2$, ¿cuánto vale $(f\\circ g)(2)$?",
      options: ["$9$", "$25$", "$5$", "$8$"],
      correct: 0,
      hint: "Calcula $g(2)$ antes de aplicar $f$.",
      why: "$g(2)=4$ y $f(4)=2(4)+1=9$.",
    },
    secondChallenge: {
      q: "Inversa de $f(x)=3x-6$",
      options: [
        "$f^{-1}(x)=\\frac{x+6}{3}$",
        "$f^{-1}(x)=3x+6$",
        "$f^{-1}(x)=\\frac{x-6}{3}$",
        "$f^{-1}(x)=\\frac{1}{3x-6}$",
      ],
      correct: 0,
      hint: "Escribe $y=3x-6$, intercambia $x,y$ y despeja $y$.",
      why: "De $x=3y-6$ se obtiene $y=(x+6)/3$.",
    },
  },
  {
    id: "modelacion-lineal",
    module: 7,
    skill: "Modelación",
    level: "inicial",
    prerequisites: ["lineal"],
    tags: ["contexto", "unidades", "tasa de cambio"],
    durationMinutes: 16,
    title: "Modelación con funciones lineales",
    eyebrow: "Modelación · 16 min",
    objective:
      "Construir e interpretar un modelo lineal identificando tarifa fija, tasa y unidades.",
    intuition:
      "Una tarifa total puede combinar un costo inicial con una cantidad que aumenta a ritmo constante.",
    formal:
      "Un modelo lineal $C(d)=md+b$ representa tasa $m$ por unidad y costo inicial $b$.",
    mistake:
      "Confundir la tarifa fija con la tasa por unidad o perder las unidades al interpretar el resultado.",
    example: {
      question:
        "Un servicio cobra $4$ de inicio y $3$ por kilómetro. ¿Cuál es el costo para $5$ km?",
      steps: [
        "La distancia es la variable $d$ y la tasa es 3 por kilómetro.",
        "El costo inicial es 4, así que $C(d)=3d+4$.",
        "$C(5)=3(5)+4=19$; el costo es 19 unidades monetarias.",
      ],
    },
    challenge: {
      q: "Con $C(d)=3d+4$, ¿cuánto cuesta recorrer $6$ km?",
      options: ["$22$", "$18$", "$24$", "$10$"],
      correct: 0,
      hint: "Sustituye $d=6$ y conserva la tarifa inicial.",
      why: "$C(6)=3(6)+4=22$.",
    },
    secondChallenge: {
      q: "En $C(d)=2.5d+7$, ¿qué representa el 7?",
      options: [
        "Costo inicial",
        "Costo por kilómetro",
        "Distancia recorrida",
        "Costo total",
      ],
      correct: 0,
      hint: "Es el valor de $C(0)$.",
      why: "$C(0)=7$, por lo que representa la tarifa fija inicial.",
    },
  },
];
const skills = [
  "Álgebra",
  "Notación",
  "Dominio",
  "Rango",
  "Gráficas",
  "Lineales",
  "Cuadráticas",
  "Transformaciones",
];
const exerciseSkills: Record<number, string> = {
  0: "Álgebra",
  1: "Notación",
  2: "Dominio",
  3: "Rango",
  4: "Lineales",
  5: "Transformaciones",
  6: "Composición",
  7: "Modelación",
};
const distinctChoices = (options: string[], correct: number) => {
  const used = new Set<string>();
  return options.map((option) => {
    if (!used.has(option)) {
      used.add(option);
      return option;
    }
    let replacement = String(Number(options[correct]) + 1);
    while (used.has(replacement)) replacement = String(Number(replacement) + 1);
    used.add(replacement);
    return replacement;
  });
};
export const diagnostic = Array.from({ length: 20 }, (_, i) => {
  const skillIndex = i % skills.length;
  const n = (Math.floor(i / skills.length) % 7) + 1;
  const questions = [
    {
      q: `Resuelve $${n}x+2=${3 * n + 2}$.`,
      options: ["3", "2", "4", "0"],
      correct: 0,
    },
    {
      q: `Si $f(x)=${n}x+2$, calcula $f(2)$.`,
      options: [`${2 * n + 2}`, `${n + 2}`, `${2 * n}`, "2"],
      correct: 0,
    },
    {
      q: `¿Qué valor se excluye del dominio de $f(x)=\\frac{1}{x-${n}}$?`,
      options: [`${n}`, `${-n}`, "0", "Ninguno"],
      correct: 0,
    },
    {
      q: `¿Cuál es el rango de $f(x)=(x-${n})^2$?`,
      options: ["$y\\geq0$", "$y\\geq1$", "$y\\leq0$", "$\\mathbb{R}$"],
      correct: 0,
    },
    {
      q: `La parábola $y=(x-${n})^2-2$ tiene eje de simetría:`,
      options: [`$x=${n}$`, "$y=-2$", `$x=-${n}$`, `$y=${n}$`],
      correct: 0,
    },
    {
      q: `¿Cuál es la pendiente de $f(x)=${n}x+2$?`,
      options: [`$${n}$`, `$${n + 1}$`, `$-${n}$`, "$0$"],
      correct: 0,
    },
    {
      q: `Vértice de $y=(x-${n})^2+2$`,
      options: [`$(${n},2)$`, `$(-${n},2)$`, `$(${n},-1)$`, `$(${n + 1},2)$`],
      correct: 0,
    },
    {
      q: `En $f(x-${n})$, la gráfica de $f$ se desplaza:`,
      options: [`${"Derecha"} ${n}`, `Izquierda ${n}`, "Arriba", "Abajo"],
      correct: 0,
    },
  ];
  const question = questions[skillIndex];
  return {
    id: `D${i + 1}`,
    skill: skills[skillIndex],
    q: question.q,
    options: distinctChoices(question.options, question.correct),
    correct: question.correct,
  };
});
export const exerciseBank = Array.from({ length: 120 }, (_, i) => {
  const m = i % 8;
  const n = (i % 7) + 1;
  const quadraticFamily = m === 4 && Math.floor(i / 8) % 2 === 1;
  const exerciseSkill =
    m === 4
      ? quadraticFamily
        ? "Cuadráticas"
        : "Lineales"
      : exerciseSkills[m];
  return {
    id: `M${m}-E${i + 1}`,
    module: m,
    skill: exerciseSkill,
    difficulty:
      i % 3 === 0 ? "Básica" : i % 3 === 1 ? "Intermedia" : "Avanzada",
    q:
      m === 2
        ? `¿Qué valor debe excluirse del dominio de $1/(x-${n})$?`
        : m === 3
          ? `¿Cuál es el rango de $f(x)=(x-${n})^2$?`
          : m === 5
            ? `En $f(x-${n})$, ¿hacia dónde se desplaza la gráfica?`
            : m === 6
              ? `Si $f(x)=x+${n}$ y $g(x)=2x$, calcula $(f\\circ g)(1)$.`
              : m === 7
                ? `Un viaje cuesta $${n}$ por kilómetro más $2$ de tarifa fija. ¿Cuánto cuesta recorrer $3$ km?`
                : m === 0
                  ? `Resuelve $${n}x+2=${3 * n + 2}$.`
                  : m === 4 && quadraticFamily
                    ? `Vértice de $y=(x-${n})^2+2$`
                    : m === 4
                      ? `Pendiente de $f(x)=${n}x+2$`
                      : `Para $f(x)=${n}x+2$, calcula $f(3)$.`,
    options: distinctChoices(
      m === 2
        ? [`${n}`, `${-n}`, "0", "Ninguno"]
        : m === 3
          ? [`$y\\geq 0$`, `$y\\geq ${n}$`, `$y\\leq 0$`, `$\\mathbb{R}$`]
          : m === 5
            ? [`Derecha ${n}`, `Izquierda ${n}`, "Arriba", "Abajo"]
            : m === 0
              ? ["3", "2", "4", "0"]
              : m === 4 && quadraticFamily
                ? [`$(${n},2)$`, `$(-${n},2)$`, `$(${n},-1)$`, `$(${n + 1},2)$`]
                : m === 4
                  ? [`$${n}$`, `$${n + 1}$`, `$-${n}$`, "$0$"]
                  : m === 6
                    ? [`${n + 2}`, `${n + 3}`, `${n + 1}`, `${2 - n}`]
                    : [`${3 * n + 2}`, `${n + 5}`, `${3 * n}`, `${n + 2}`],
      0,
    ),
    correct: 0,
    hint:
      m === 2
        ? "El denominador no puede ser cero."
        : m === 3
          ? "Un cuadrado nunca es negativo y alcanza cero en su vértice."
          : m === 5
            ? "Dentro del argumento, el signo se interpreta al contrario."
            : m === 0
              ? "Aísla x restando primero la constante y luego divide por su coeficiente."
              : m === 4 && quadraticFamily
                ? "La forma $y=(x-h)^2+k$ tiene vértice $(h,k)$."
                : m === 4
                  ? "En $f(x)=mx+b$, la pendiente es el coeficiente de x."
                  : m === 6
                    ? "Evalúa primero $g(1)$ y luego usa ese resultado en $f$."
                    : "Sustituye los datos en la regla antes de operar.",
    explanation:
      m === 0
        ? `$${n}x+2=${3 * n + 2}$ implica $${n}x=${3 * n}$ y por tanto $x=3$.`
        : m === 2
          ? `El denominador se anula cuando $x=${n}$, así que ese valor no pertenece al dominio.`
          : m === 3
            ? `Todo cuadrado es no negativo y alcanza 0 en el vértice; el rango es $[0,\\infty)$.`
            : m === 5
              ? `La expresión $f(x-${n})$ traslada la gráfica ${n} unidades a la derecha.`
              : m === 6
                ? `$g(1)=2$ y después $f(2)=2+${n}=${n + 2}$.`
                : m === 4 && quadraticFamily
                  ? `La forma $y=(x-h)^2+k$ tiene vértice $(h,k)$; aquí es $(${n},2)$.`
                  : m === 4
                    ? `En $f(x)=mx+b$, la pendiente es $m=${n}$.`
                    : m === 7
                      ? `El costo total suma $${n}\\times3$ por distancia y 2 de tarifa fija.`
                      : `$f(3)=${n}\\times3+2=${3 * n + 2}$.`,
  };
});
