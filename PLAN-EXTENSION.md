# Plan de extensión de Funciones Lab

> Documento histórico de planificación. Las fases implementadas y sus verificaciones actuales se registran en `docs/IMPLEMENTACION.md`.

## 1. Propósito

Ampliar Funciones Lab desde una experiencia educativa local con cinco lecciones y ejercicios generados hacia una plataforma de aprendizaje coherente, medible, accesible y ampliable. El plan prioriza primero la precisión matemática y la confianza en los datos; después amplía el currículo, la adaptación, la persistencia y las capacidades de publicación.

Este documento es una hoja de ruta, no una promesa de fechas. Cada fase puede estimarse cuando se confirme quién implementará diseño, contenido y código.

## 2. Estado de partida

La base actual incluye:

- React y TypeScript, empaquetados con esbuild.
- Ocho módulos de ruta, cinco lecciones escritas y un banco de ejercicios generado por código.
- Un motor matemático para evaluación de funciones, puntos de gráfica, comparación de respuestas y actualización de dominio.
- Un laboratorio SVG interactivo y composiciones Remotion.
- KaTeX para renderizar expresiones delimitadas con `$...$`.
- Persistencia local de preferencias y progreso en `localStorage`.
- Pruebas del motor, contenido y fórmulas; comprobación estricta de TypeScript y build de producción.

Límites conocidos que orientan la extensión:

- La ruta anuncia más módulos que los que tienen lecciones publicadas.
- Una parte del banco se genera con plantillas; diversidad, dificultad y validez pedagógica deben seguir creciendo.
- Algunas estadísticas iniciales son datos de demostración y no deben confundirse con actividad medida.
- `src/main.tsx` reúne navegación, estado y vistas; conviene separar responsabilidades conforme crezca el producto.
- El guardado es local al navegador: no hay cuentas, sincronización ni recuperación entre dispositivos.
- Aún faltan pruebas automatizadas de interacción de pantallas y validación visual en varios tamaños.

## 3. Objetivos del producto

1. Enseñar los conceptos fundamentales de funciones con una secuencia completa y progresiva.
2. Asegurar que cada pregunta tenga respuesta inequívoca, explicación y habilidad correctamente asignada.
3. Mostrar progreso y recomendaciones derivados de actividad real, sin cifras ficticias.
4. Hacer que fórmulas, gráficas, animaciones y preferencias funcionen juntas en todas las pantallas.
5. Preservar aprendizaje y preferencias de forma fiable, primero local y después sincronizable si se requiere.
6. Facilitar que el equipo agregue lecciones y ejercicios sin editar lógica de interfaz.
7. Cumplir requisitos de accesibilidad, responsive, rendimiento y privacidad adecuados para estudiantes.

## 4. Principios de alcance

- **Exactitud antes que volumen:** publicar una pregunta solo después de verificar su solución y distractores.
- **Progreso honesto:** no mostrar tiempo, rachas, XP o dominio como datos reales si no se miden.
- **Local-first:** que la experiencia principal funcione sin crear una cuenta ni depender de red.
- **Contenido separado del renderizado:** currículo tipado y validable fuera de los componentes de React.
- **Incrementalidad:** mantener build estático y añadir servicios remotos solo si existe un caso de uso claro.
- **Accesibilidad desde el diseño:** navegación por teclado, foco visible, MathML, contraste y movimiento reducido.

## 5. Hoja de ruta

### Fase 0: Cimientos y confianza en los datos

**Objetivo:** estabilizar contratos, métricas y validación antes de expandir contenido.

**Trabajo:**

- Definir tipos explícitos para `Progress`, `Preferences`, `Lesson`, `Exercise`, `DiagnosticQuestion` y `StudySession`.
- Añadir una versión al esquema persistido y una función de migración/normalización para datos antiguos o incompletos.
- Encapsular lectura/escritura local, controlar errores de cuota o JSON corrupto y ofrecer recuperación sin bloquear el inicio.
- Separar datos de demostración de datos de usuario; proporcionar acción visible para reiniciar datos de demostración.
- Establecer qué significa cada métrica: completado, intento, acierto, dominio estimado, XP y tiempo activo.
- Cambiar porcentajes fijos de módulos por progreso derivado del contenido disponible. Identificar módulos sin contenido como “próximamente” o no listados como completos.
- Establecer CI local reproducible: `npm test`, `npm run typecheck` y `npm run build`.

**Criterios de aceptación:**

- Los datos anteriores cargan mediante una migración versionada y no causan excepciones.
- JSON inválido o almacenamiento no disponible muestra un estado recuperable y la app sigue iniciando.
- Ninguna métrica de actividad se presenta como real si no proviene de eventos almacenados.
- Módulos sin lecciones no muestran avance artificial.

### Fase 1: Currículo completo de funciones

**Objetivo:** convertir los ocho módulos anunciados en una ruta utilizable, con objetivos y evaluación por concepto.

**Esqueleto propuesto:**

1. Prerrequisitos: álgebra, intervalos, coordenadas y lectura de pares ordenados.
2. Fundamentos: relación, definición de función, notación, evaluación y representaciones.
3. Dominio y rango: restricciones algebraicas, interpretación de gráficas y notación de intervalos.
4. Análisis gráfico: intersecciones, crecimiento, decrecimiento, extremos, simetría y transformaciones iniciales.
5. Familias: constante, lineal/afín, cuadrática, valor absoluto, raíz, polinómica y racional; exponencial y logarítmica como extensión según nivel.
6. Transformaciones: traslación, reflexión, escala vertical/horizontal y composición de transformaciones.
7. Operaciones e inversas: suma, producto, cociente, composición, inversa y restricciones asociadas.
8. Modelación: traducir situaciones, unidades, tasas de cambio, ajuste e interpretación de resultados.

**Entregables por lección:**

- Objetivo observable y prerrequisitos.
- Intuición breve, definición formal y una representación visual.
- Ejemplo resuelto con pasos revelables.
- Error frecuente y explicación correctiva.
- Dos o más preguntas de comprobación, con pistas y retroalimentación.
- Metadatos: módulo, habilidad, nivel, duración estimada, etiquetas y objetivos curriculares.
- Fórmulas LaTeX verificadas y texto alternativo cuando la gráfica comunique información esencial.

**Criterios de aceptación:**

- Toda lección publicada corresponde a un objetivo y habilidad registrados.
- La ruta solo anuncia la cantidad de lecciones realmente disponibles.
- Cada fórmula pasa la validación KaTeX y cada ejemplo tiene solución comprobada.
- La misma lección puede abrirse, retomarse y completarse sin duplicar recompensas.

### Fase 2: Banco de ejercicios y práctica adaptativa

**Objetivo:** evolucionar de plantillas repetitivas a ejercicios diversos, trazables y adaptados al dominio.

**Trabajo:**

- Definir un esquema de ejercicio con respuesta, respuesta normalizada, distractores, explicación, pista, habilidad, dificultad y procedencia.
- Usar generadores deterministas solo para familias donde se pueda demostrar la validez; probar muchas semillas y límites.
- Escribir manualmente ejercicios conceptuales y de interpretación de gráficas que no se reducen a sustituir valores.
- Añadir validadores de opciones únicas, índice correcto, solución correcta y ausencia de distractores equivalentes.
- Aleatorizar orden de opciones de forma segura, preservando la respuesta correcta.
- Diseñar sesiones finitas configurables, permitir pausar/reanudar y mostrar resumen al final.
- Adaptar dificultad mediante un algoritmo simple y explicable basado en evidencia reciente; evitar presentar el dominio como una medición psicométrica precisa.
- Registrar intentos una sola vez y manejar doble clic, volver atrás y repetición de sesión sin duplicar eventos.

**Criterios de aceptación:**

- Todas las preguntas tienen exactamente una respuesta correcta salvo que se definan explícitamente como selección múltiple.
- Todas las habilidades del mapa de progreso reciben ejercicios pertinentes.
- La práctica termina en el número anunciado y el porcentaje nunca supera 100%.
- Una respuesta repetida por doble clic no duplica XP, aciertos ni intentos.
- El feedback explica el razonamiento, no se limita a revelar la opción correcta.

### Fase 3: Laboratorio matemático y medios Remotion

**Objetivo:** mejorar exploración visual, robustez matemática y sincronización entre controles y explicaciones.

**Trabajo:**

- Formalizar dominio soportado por el motor: lineal, cuadrática, absoluta, cúbica, raíz y futuras familias.
- Validar parámetros numéricos, entradas no finitas, valores extremos y valores fuera del dominio antes de graficar.
- Dibujar segmentos separados ante discontinuidades o valores indefinidos; evitar conectar puntos a través de huecos.
- Añadir puntos de interés, vértice, intersecciones y rango aproximado solo cuando se puedan calcular correctamente.
- Mostrar ecuación actual con KaTeX y actualizarla con cada control.
- Mejorar escalado de ejes, rejilla, etiquetas, navegación por teclado y descripción accesible de la gráfica.
- Hacer que controles de movimiento, subtítulos y tema se propaguen a todas las composiciones Remotion.
- Añadir transcripción/texto equivalente a cada composición y probar `prefers-reduced-motion`.
- Definir fallback si falla el reproductor o no se cargan sus recursos.

**Criterios de aceptación:**

- La tabla, la ecuación y la curva representan los mismos parámetros.
- No se dibujan artefactos a través de discontinuidades ni fuera del dominio.
- El modo de movimiento reducido presenta un estado estático comprensible.
- Toda información del video también está disponible como texto.
- Las composiciones no provocan errores de consola ni desbordamiento en móvil.

### Fase 4: Progreso, hábitos y recomendaciones

**Objetivo:** ofrecer una visión fiable y útil de lo aprendido.

**Trabajo:**

- Derivar avance por módulo y lección del contenido realmente completado.
- Mostrar intentos, precisión y dominio estimado por habilidad con periodo y tamaño de muestra.
- Calcular tiempo activo solo con sesiones visibles y actividad reciente; pausar en segundo plano e ignorar pestañas inactivas.
- Definir día local, zona horaria y política de racha; no inicializar una racha ficticia.
- Añadir historial de sesiones y objetivos semanales configurables si los estudiantes lo necesitan.
- Recomendar siguiente lección a partir de prerrequisitos y habilidades con evidencia débil, explicando por qué.
- Añadir exportación/importación de datos personales en JSON y reinicio confirmado.

**Criterios de aceptación:**

- Cada indicador explica qué mide y de qué periodo/datos proviene.
- La recomendación conduce a una lección disponible y no a una recarga completa.
- Los datos sobreviven cierre y reapertura del navegador en el mismo dispositivo.
- Reinicio y exportación no eliminan información sin confirmación explícita.

### Fase 5: Arquitectura y experiencia de producto

**Objetivo:** hacer que nuevas pantallas y contenido no aumenten el acoplamiento.

**Trabajo:**

- Dividir la app en componentes/carpetas por dominio: navegación, dashboard, ruta, lecciones, práctica, laboratorio, progreso y ajustes.
- Separar estado de sesión, estado persistido y estado temporal de vista.
- Introducir enrutado real con enlaces compartibles solo si se necesita historial, deep linking o navegación del navegador.
- Centralizar el sistema visual, tamaños, estados, breakpoints y tokens de tema.
- Incluir estados vacíos, carga, error, confirmación y datos de demostración claramente etiquetados.
- Revisar copy, singular/plural, duraciones estimadas y consistencia de recompensas.

**Criterios de aceptación:**

- Las pantallas se pueden probar de forma aislada y reciben contratos tipados claros.
- Atrás/adelante del navegador funciona si se adopta enrutado.
- Ningún botón parece operativo si no ejecuta una acción.
- La aplicación mantiene su lenguaje visual en escritorio y móvil.

### Fase 6: Calidad, accesibilidad y publicación

**Objetivo:** reducir regresiones y preparar una distribución estable.

**Trabajo:**

- Añadir pruebas unitarias de reglas matemáticas, generadores, migraciones y cálculos de progreso.
- Añadir pruebas de componentes y flujos críticos: completar lección, práctica 10/10, diagnóstico, guardar preferencias y renderizar fórmulas.
- Automatizar pruebas de navegador en escritorio y viewport móvil; comprobar errores de consola, solicitudes fallidas y desbordamiento horizontal.
- Auditar teclado, orden de foco, nombres accesibles, contraste, zoom 200%, lectores de pantalla y movimiento reducido.
- Añadir presupuesto de rendimiento para JavaScript, CSS y fuentes KaTeX; revisar carga diferida del reproductor si mejora el inicio.
- Definir despliegue estático, caché/versionado de recursos, HTTPS, política de privacidad y texto de atribución/licencia aplicable a Remotion.
- Configurar integración continua para pruebas, typecheck y build.

**Criterios de aceptación:**

- Los flujos críticos pasan en CI y no generan errores de consola.
- La app es usable por teclado y conserva contenido con zoom aumentado.
- El bundle y recursos cumplen presupuestos acordados.
- La compilación desplegada se puede abrir desde una ruta base distinta de `/` si el hosting lo requiere.

### Fase 7: Sincronización y cuentas (opcional)

**Condición de entrada:** implementar solo si hay necesidad de respaldar o compartir progreso entre dispositivos o usuarios.

**Trabajo:**

- Definir modelo de cuenta, autenticación, autorización, política de menores y consentimiento.
- Crear API con esquema versionado para perfil, progreso, preferencias, sesiones y catálogo de contenido.
- Mantener modo invitado/local y diseñar fusión de datos locales al iniciar sesión.
- Resolver conflictos de edición y reintentos de red sin perder progreso.
- Aplicar minimización, retención, exportación y borrado de datos; no almacenar más información personal de la necesaria.
- Añadir controles de abuso y límites de tasa; nunca confiar en XP calculado solo por el cliente si tiene valor competitivo.

**Criterios de aceptación:**

- Una cuenta puede recuperar progreso en otro dispositivo.
- Un fallo de red no bloquea una sesión local ni borra cambios pendientes.
- El usuario puede exportar y eliminar sus datos.
- Seguridad, privacidad y obligaciones legales se revisan antes de abrir registro público.

## 6. Arquitectura objetivo sugerida

```text
src/
  app/                 # composición, navegación y providers
  components/          # controles compartidos, progreso y estados
  features/
    dashboard/
    curriculum/        # módulos, lecciones y ruta
    practice/          # sesiones, evaluación y feedback
    laboratory/        # controles, tablas, gráfica y motor visual
    progress/          # métricas e historial
    settings/          # preferencias
  content/             # catálogo de lecciones y ejercicios tipados
  domain/              # reglas, entidades y cálculos puros
  persistence/         # localStorage, versionado y migraciones
  media/               # composiciones Remotion y transcripciones
  test/                # helpers y fixtures
```

La estructura es orientativa: no es necesario mover todos los archivos de una vez. Primero conviene extraer dominio y persistencia; luego cada pantalla al tocarla.

## 7. Orden recomendado

1. Terminar y documentar con pruebas los flujos y fórmulas actuales.
2. Versionar progreso/preferencias y retirar métricas de muestra.
3. Completar currículo y validar respuestas antes de añadir volumen al banco.
4. Mejorar laboratorio y componentes visuales a partir de casos matemáticos concretos.
5. Añadir historial/recomendaciones con datos definidos.
6. Separar módulos y automatizar QA visual/accesible.
7. Evaluar publicación y sincronización remota según necesidad real.

## 8. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Errores matemáticos en preguntas generadas | Generadores deterministas con propiedades verificables, casos límite y revisión pedagógica. |
| Métricas que crean una impresión falsa de aprendizaje | Mostrar procedencia, periodo y volumen; separar datos de demostración. |
| `localStorage` pierde o corrompe progreso | Esquema versionado, validación, backup exportable y tolerancia a errores. |
| La expansión de currículo multiplica mantenimiento | Metadatos comunes, validador automático y checklist editorial por lección. |
| Gráficas engañosas cerca de discontinuidades | Separar segmentos, validar dominio y probar transformaciones extremas. |
| Complejidad prematura de backend/cuentas | Mantener local-first; condicionar la fase remota a requisitos aprobados. |
| Remotion aumenta carga inicial o genera avisos/licencias | Medir bundle, diferir carga donde aplique y revisar términos de uso antes de publicar. |
| Una refactorización amplia introduce regresiones | Mover una responsabilidad por vez y mantener pruebas de comportamiento. |

## 9. Indicadores para evaluar el resultado

Los objetivos numéricos deben acordarse antes de lanzamiento; como mínimo recoger:

- Porcentaje de lecciones con preguntas verificadas y fórmulas validadas.
- Errores en pruebas matemáticas y preguntas con más de una respuesta plausible.
- Finalización de sesiones y punto donde se abandona el aprendizaje.
- Uso del laboratorio y cambios de parámetros que llevan a una predicción correcta.
- Porcentaje de usuarios que vuelven a una habilidad después de feedback correctivo.
- Errores de JavaScript, recursos fallidos y tiempos de carga.
- Tareas de accesibilidad completadas con teclado, lector de pantalla y zoom.

No usar XP o rachas como sustitutos de comprensión. Si se mide dominio, describirlo como estimación y evitar conclusiones de alto impacto basadas en pocas respuestas.

## 10. Decisiones pendientes antes de comprometer alcance

- Nivel objetivo: secundaria, bachillerato, admisión universitaria u otro.
- Convención curricular y notación: región, estándares y vocabulario preferido.
- Si el banco debe ser completamente offline y si se permiten recursos de terceros.
- Si se necesitan cuentas, sincronización o únicamente exportación/importación.
- Si progreso y gamificación son motivadores opcionales o requisitos centrales.
- Quién revisa exactitud matemática y calidad pedagógica antes de publicar.
- Hosting previsto y soporte para subruta, analítica y política de privacidad.
- Uso comercial previsto de Remotion y revisión de licencia correspondiente.

## 11. Definición de “listo” para una versión ampliada

La extensión puede considerarse lista para publicación cuando:

- El alcance curricular publicado coincide con el contenido disponible.
- Lecciones, ejercicios, fórmulas y soluciones tienen validación automatizada y revisión de contenido.
- Progreso, XP, tiempo y rachas proceden de eventos reales y están documentados.
- Navegación, preferencias, animaciones y gráficos funcionan en móvil y escritorio.
- La app pasa tests, typecheck, build y pruebas de navegador sin errores.
- Existen manejo de almacenamiento fallido, recuperación de progreso y política de privacidad acorde al despliegue.
