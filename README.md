# Funciones Lab

Aplicación educativa en español, local-first, para aprender funciones con lecciones, gráficas manipulables y práctica adaptativa. Implementación de las fases de mejora en [docs/IMPLEMENTACION.md](docs/IMPLEMENTACION.md).

Sitio: [funciones.sistemazenit.com](https://funciones.sistemazenit.com/)

## Ejecutar

Requiere Node.js 22.12 o superior. En Windows se puede usar `npm.cmd`.

```sh
npm ci
npm run dev
```

Abre `http://127.0.0.1:4173`. Las rutas son enlaces como `/#/laboratorio` o `/#/leccion/dominio`. No abras `index.html` con `file://`.

## Funciones implementadas

- Ruta de 8 módulos, 9 lecciones y diagnóstico de 20 preguntas.
- 243 variantes de ejercicios, 33 plantillas, 11 habilidades y tres niveles; opciones barajadas y respuesta numérica con MathLive.
- Selección ponderada por dominio estimado, dificultad, errores y repasos vencidos. Pistas progresivas y sesiones reanudables en la misma pestaña.
- Evidencia de respuestas, meta semanal configurable, historial y recompensas sin duplicación por el mismo objetivo.
- Gráficas de cinco familias, dominio/rango, tangentes analíticas, zoom limitado y controles alternativos de teclado.
- Microlecciones Remotion con reproducción manual, texto alternativo y preferencias de movimiento/subtítulos efectivas.
- Respaldos JSON validados, límites de tamaño, migración de progreso y conciliación entre pestañas.
- PWA con caché de aplicación y fuentes locales. Disponible offline después de una primera carga completa de producción.
- Panel docente local: importa respaldos consentidos y muestra evidencia agregada sin subir ni persistir los archivos del grupo.
- Sincronización manual opcional por cuenta Supabase, con RLS y control optimista de revisiones.

## Calidad

```sh
npm run lint
npm run format:check
npm run typecheck
npm run test:coverage
node tests/math.test.mjs
npm run build
npx playwright install chromium firefox webkit
npm run test:e2e
npm run test:offline
```

El build comprueba tipos, genera `dist/` y verifica presupuestos gzip. Las pruebas offline usan producción en el puerto 4174. La CI ejecuta escritorio Chromium, móvil Chromium, Firefox y WebKit, conservando trazas al fallar. Una prueba automática de accesibilidad no equivale a certificación WCAG completa.

## Desplegar en Cloudflare Pages

Conecta este repositorio desde **Workers & Pages > Create application > Pages > Import an existing Git repository** y utiliza:

- Rama de producción: `main`
- Comando de build: `npm run build`
- Directorio de salida: `dist`
- Directorio raíz: `/`

En **Settings > Environment variables**, añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` tanto para Production como para Preview. Son variables públicas de compilación; no configures la contraseña PostgreSQL ni una clave `service_role`. Cada push a `main` producirá un despliegue y las ramas/PR podrán generar vistas previas. Después del primer despliegue, agrega la URL de producción a Supabase Auth como Site URL y redirect URL. En este proyecto la URL canónica es `https://funciones.sistemazenit.com/`; `https://funciones-6zh.pages.dev/` se conserva como redirect técnico adicional.

## Activar Supabase

1. Crea un proyecto Supabase y ejecuta **una vez** `supabase/schema.sql` en su editor SQL.
2. Copia `.env.example` a `.env.local` y configura la URL y clave **publishable/pública**. Nunca uses `service_role` ni secretos de servidor en variables `VITE_*`.
3. En Auth, habilita correo y configura Site URL y redirect URLs con el origen/ruta reales; para desarrollo, `http://127.0.0.1:4173/`.
4. Reinicia el servidor o reconstruye la aplicación. En Ajustes solicita un enlace de acceso y ábrelo en el mismo navegador/perfil que inició el flujo PKCE. Si vuelves a Inicio, abre Ajustes para terminar el acceso.
5. Pulsa **Combinar y sincronizar** para transferir explícitamente el progreso local a esa cuenta. No hay cargas automáticas ni sincronización remota offline.
6. Antes de usar datos reales, verifica en tu proyecto que dos cuentas no pueden leer ni modificar el progreso de la otra y que una sesión anónima no tiene acceso. Prueba conflicto de revisiones desde dos dispositivos.

Estado del entorno actual: URL y clave publicable configuradas localmente y en Cloudflare Pages; migraciones `20261008000000` y `20261008000001` aplicadas al proyecto remoto. La tabla, Auth y el rechazo de lectura/escritura anónima se verificaron el 8 de octubre de 2026. El dominio definitivo pasó la comprobación de HTTPS, navegación, cuenta, PWA, consola y solicitudes. Falta autorizar `https://funciones.sistemazenit.com/` en Supabase Auth y completar la prueba cruzada con dos cuentas reales.

El modo local no requiere cuenta. En dispositivos compartidos usa perfiles de navegador separados: cerrar sesión **no borra** el progreso local. Reiniciar datos borra solo los datos de aprendizaje/preferencias locales; no borra la cuenta ni el respaldo remoto, y una sincronización posterior podría recuperarlo.

## Arquitectura

`src/App.tsx` compone pantallas cargadas bajo demanda; `src/routing.ts` resuelve rutas; `src/exercises.ts`, `src/adaptive.ts` y `src/learning.ts` contienen pedagogía y evidencia; `src/math.ts` contiene matemática pura. `src/persistence.ts`, `src/schemas.ts` y `src/useProgressStore.ts` gestionan persistencia. `src/sync/` separa fusión, protocolo de conflictos y cuenta. `src/components/` contiene elementos interactivos; `src/preferences.tsx` hace efectivas las preferencias. Vite, Vitest y Playwright tienen configuraciones independientes.

## Producción, privacidad y límites

Sirve **solo `dist/`** sobre HTTPS; no publiques `.env.local`, código de configuración interno ni `node_modules`. No necesitas rewrites especiales para las rutas hash. Configura en tu alojamiento CSP y otras cabeceras de seguridad según las URL reales de Supabase y las necesidades de MathLive; valida antes de imponer políticas restrictivas. No se instalaron analítica externa ni rastreadores adicionales.

El dominio es una estimación, no una nota oficial. Los XP y respaldos son modificables por el usuario: esta aplicación no es una plataforma de exámenes con validación de servidor. Los datos heredados sin eventos se fusionan conservando máximos, y el tiempo de estudio de un mismo día usa el máximo para evitar duplicaciones; no pretende medir tiempo único exacto entre dispositivos. Se conservan 2.000 eventos y 90 días de sesiones. La reanudación en `sessionStorage` no es una transacción atómica con el progreso; un cierre abrupto durante una escritura puede perder el último cambio.

Revisa pedagógicamente el contenido con un docente antes de un despliegue institucional. El panel docente actual no incluye clases compartidas, roles remotos, tareas ni calificaciones. La infraestructura básica de Supabase está activa; el protocolo y la fusión tienen pruebas locales, mientras que el aislamiento entre dos cuentas reales debe comprobarse antes del lanzamiento.

## Reutilización y licencias

Se integraron bibliotecas directamente, no se copiaron aplicaciones completas: [Vite](https://github.com/vitejs/vite), [Vitest](https://github.com/vitest-dev/vitest), [Zod](https://github.com/colinhacks/zod), [TanStack Query](https://github.com/TanStack/query), [Supabase JS](https://github.com/supabase/supabase-js), [MathLive](https://github.com/arnog/mathlive), [Playwright](https://github.com/microsoft/playwright), [axe-core](https://github.com/dequelabs/axe-core), [Vite PWA](https://github.com/vite-pwa/vite-plugin-pwa) y [Remotion](https://github.com/remotion-dev/remotion).

Conserva las licencias de las dependencias y fuentes al distribuir. Remotion tiene condiciones de licencia específicas para ciertos usos comerciales; verifica [su licencia vigente](https://www.remotion.dev/docs/license) antes de producción. No se compró ni se declaró aceptada ninguna licencia en nombre del propietario.
