# Implementación de las fases 1–4

Fecha: 8 de octubre de 2026. Los cambios se implementaron sobre el proyecto existente, sin publicar ni configurar servicios de pago.

## Fase 1 — Base técnica

Separación del monolito en pantallas y componentes, enlaces profundos hash, carga diferida, Vite, validación Zod, TypeScript, ESLint, formato, Vitest, Testing Library y CI. Se eliminaron mapas de código de producción y formatos de fuentes redundantes. Los presupuestos de JavaScript gzip se comprueban en el build: 300 KB por archivo y 1,2 MB para todos los módulos diferidos combinados. TypeScript se alineó con la rama 6.0 compatible con typescript-eslint; no se forzó una combinación con dependencias incompatibles.

## Fase 2 — Aprendizaje y evidencia

Banco activo de 243 variantes/33 plantillas que cubre las 11 habilidades, con niveles y distractores únicos. Aleatorización de posiciones, respuesta libre numérica/fracciones sin ejecutar código, pistas, historial, repasos espaciados y reanudación por pestaña. La selección pondera debilidad, nivel y fecha de repaso, pero no garantiza que cada pregunta sea del tema más débil. Dominio con prior Beta y menor crédito por pistas. Diagnóstico orienta recomendaciones y reconoce únicamente prerrequisitos de habilidades evaluadas. Las lecciones no se bloquean: los prerrequisitos son orientación pedagógica. Metas de siete días y XP idempotentes por lección, ejercicio, diagnóstico inicial y reto concreto.

## Fase 3 — Experiencia y accesibilidad

Dominio/rango correcto para parámetros degenerados y raíces reflejadas, tangentes analíticas y ausencia explícita de tangente en esquinas y límites verticales. Fórmula del encabezado incluye b y distingue cúbicas. Controles por teclado, descripción de la gráfica, foco visible, enlace al contenido, límites de zoom y proyecciones de rangos constantes. Máquina con cancelación de temporizadores y bloqueo de cambios durante procesamiento. Microlecciones con controles y texto equivalente, preferencias reales y respeto de movimiento reducido del sistema. PWA con aviso de actualización y activos matemáticos locales. Pruebas automatizadas móviles y axe: no sustituyen revisión manual completa con lectores de pantalla.

## Fase 4 — Datos y seguimiento

Persistencia local conciliada entre pestañas usando Web Locks cuando están disponibles, generación de reemplazos y unión de eventos. Sin Web Locks existe conciliación, pero no garantía transaccional entre pestañas. Exportaciones/importaciones estrictas, consentimiento de reemplazo y límite de tamaño. Protocolo remoto con tres reintentos de revisión, validación del payload y UI de sincronización manual con TanStack Query. SQL Supabase con RLS de lectura propia y escritura mediante función autenticada que compara revisiones. Panel docente local con importación consentida, métricas y habilidades prioritarias; no hay acceso remoto implícito a datos de estudiantes.

## Verificación y activación

Verificación realizada: 20 pruebas unitarias pasaron; la suite de producción registró 25 pruebas de navegador aprobadas y 3 omisiones correspondientes al caso exclusivo de móvil en proyectos de escritorio. La prueba de navegación offline pasó. Tras los últimos ajustes se repitieron correctamente las comprobaciones de navegación en Chromium, móvil, Firefox y WebKit, y la prueba offline. TypeScript, ESLint, formato y build con presupuesto de tamaño pasaron. La auditoría de dependencias de producción reportó cero vulnerabilidades conocidas.

La cobertura instrumentada del núcleo matemático, aprendizaje y sincronización alcanzó 99,05 % de líneas y 93,25 % de ramas; no representa cobertura de toda la interfaz. El build con Supabase configurado suma aproximadamente 546 KiB gzip de JavaScript incluyendo módulos diferidos. Los comandos reproducibles están en README.md y en CI. Las pruebas automáticas de conflictos remotos utilizan simulaciones.

La base de la nube quedó activada el 8 de octubre de 2026: URL y clave publicable configuradas, dos migraciones registradas en Supabase, tabla remota confirmada, servicio Auth saludable y acceso anónimo de lectura/escritura rechazado. El dominio definitivo `https://funciones.sistemazenit.com/` se validó en Chromium móvil: HTTPS y cabeceras correctos, cuenta habilitada, service worker activo, sin desbordamiento, errores de consola ni solicitudes fallidas. Queda por autorizar esta URL y la dirección técnica de Pages en Supabase Auth, y por validar el aislamiento y los conflictos con dos cuentas reales. No se requiere una clave `service_role` en el cliente. La sincronización es voluntaria; el prototipo no es un sistema de calificaciones verificadas. Antes de producción quedan decisiones institucionales sobre privacidad, retención, acceso docente y licencia Remotion.
