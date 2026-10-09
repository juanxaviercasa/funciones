import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useRoute, type Screen } from "./routing";
import { useProductAnalytics } from "./sync/analytics";
const CloudAccount = lazy(() =>
  import("./sync/CloudAccount").then((m) => ({ default: m.CloudAccount })),
);
import { useProgressStore } from "./useProgressStore";
import { awardOnce } from "./learning";
const Dashboard = lazy(() => import("./screens/Dashboard"));
const Roadmap = lazy(() => import("./screens/Roadmap"));
const LessonView = lazy(() => import("./screens/LessonView"));
const Lab = lazy(() => import("./screens/Lab"));
const Practice = lazy(() => import("./screens/Practice"));
const Assessment = lazy(() => import("./screens/Assessment"));
const ProgressView = lazy(() => import("./screens/ProgressView"));
const Settings = lazy(() => import("./screens/Settings"));
const Teacher = lazy(() => import("./screens/Teacher"));

import { lessons, Lesson } from "./content";

import { completeLesson, recommendedLesson } from "./learning";
import {
  clearStoredData,
  DEFAULT_PREFERENCES,
  DEFAULT_PROGRESS,
  getBrowserStorage,
  loadPreferences,
  loadProgress,
  markStudyDay,
  Progress,
  recordStudyTime,
  savePreferences,
} from "./persistence";
import {
  Home,
  Compass,
  Sliders,
  CheckCircle2,
  BarChart3,
  Settings as SettingsIcon,
  Flame,
  Sparkles,
  Sun,
  Moon,
  Layers,
} from "lucide-react";

const nextLesson = (progress: Progress): Lesson | null =>
  recommendedLesson(lessons, progress);
export default function App() {
  const { screen, lessonId, navigate } = useRoute();
  useProductAnalytics(screen === "leccion" ? `leccion/${lessonId}` : screen);
  const [progressLoad] = useState(() => loadProgress(getBrowserStorage()));
  const [preferencesLoad] = useState(() =>
    loadPreferences(getBrowserStorage()),
  );
  const [progress, setProgress] = useProgressStore(progressLoad.value);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  const lastInteraction = useRef(Date.now());
  const [dark, setDark] = useState(preferencesLoad.value.theme === "dark");
  const [motion, setMotion] = useState(() =>
    preferencesLoad.status === "fresh" &&
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? false
      : preferencesLoad.value.motion,
  );
  const [captions, setCaptions] = useState(preferencesLoad.value.captions);
  const [textSize, setTextSize] = useState(preferencesLoad.value.textSize);
  const [toast, setToast] = useState(() => {
    if (
      progressLoad.status === "recovered" ||
      preferencesLoad.status === "recovered"
    ) {
      return "Los datos guardados no se pudieron leer. Empezamos con un progreso limpio.";
    }
    if (
      progressLoad.status === "unavailable" ||
      preferencesLoad.status === "unavailable"
    ) {
      return "El almacenamiento del navegador no está disponible; los cambios no persistirán.";
    }
    return "";
  });
  useEffect(() => {
    const markInteraction = () => {
      lastInteraction.current = Date.now();
    };
    const events = ["pointerdown", "keydown", "touchstart", "wheel"] as const;
    events.forEach((event) =>
      window.addEventListener(event, markInteraction, { passive: true }),
    );
    const timer = window.setInterval(() => {
      if (
        document.visibilityState !== "visible" ||
        Date.now() - lastInteraction.current > 5 * 60 * 1000
      )
        return;
      setProgress((current) => recordStudyTime(current, 30));
    }, 30_000);
    return () => {
      window.clearInterval(timer);
      events.forEach((event) =>
        window.removeEventListener(event, markInteraction),
      );
    };
  }, [setProgress]);
  useEffect(() => {
    const failed = () =>
      setToast(
        "No se pudo guardar el progreso en este navegador. Exporta una copia antes de salir.",
      );
    window.addEventListener("progress-save-failed", failed);
    return () => window.removeEventListener("progress-save-failed", failed);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.documentElement.dataset.motion = motion ? "on" : "off";
    document.documentElement.dataset.captions = captions ? "on" : "off";
    document.documentElement.style.setProperty("--text-scale", textSize);
    if (
      !savePreferences(getBrowserStorage(), {
        theme: dark ? "dark" : "light",
        motion,
        captions,
        textSize: textSize as "1" | "1.125" | "1.25",
      })
    ) {
      setToast("No se pudieron guardar las preferencias en este navegador.");
    }
  }, [dark, motion, captions, textSize]);
  const go = (s: Screen) => {
    navigate(s);
    scrollTo({ top: 0, behavior: motion ? "smooth" : "instant" });
    requestAnimationFrame(() =>
      document.querySelector<HTMLElement>("main h1")?.focus(),
    );
  };
  const openLesson = (id: string) => {
    navigate("leccion", id);
    scrollTo({ top: 0, behavior: motion ? "smooth" : "instant" });
  };
  const notify = (m: string) => {
    setToast(m);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4500);
  };
  return (
    <div className="app">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Ir al contenido
      </a>
      <aside className="sidebar">
        <button
          className="brand"
          onClick={() => go("inicio")}
          aria-label="Ir al inicio"
        >
          <span className="brandmark">ƒ</span>
          <span>
            Funciones<span>Lab</span>
          </span>
        </button>
        <nav aria-label="Navegación principal">
          {(
            [
              ["inicio", <Home size={22} />, "Inicio"],
              ["ruta", <Compass size={22} />, "Ruta"],
              ["laboratorio", <Sliders size={22} />, "Laboratorio"],
              ["practica", <CheckCircle2 size={22} />, "Práctica"],
              ["progreso", <BarChart3 size={22} />, "Progreso"],
              ["docente", <Layers size={22} />, "Docente"],
            ] as [Screen, React.ReactNode, string][]
          ).map(([s, iconNode, l]) => (
            <button
              key={s}
              className={screen === s ? "active" : ""}
              aria-current={screen === s ? "page" : undefined}
              onClick={() => go(s)}
            >
              <b>{iconNode}</b>
              <span>{l}</span>
            </button>
          ))}
        </nav>
        <button className="sidebar-bottom" onClick={() => go("ajustes")}>
          <b>
            <SettingsIcon size={22} />
          </b>
          <span>Ajustes</span>
        </button>
      </aside>
      <main id="main-content" tabIndex={-1}>
        <TopBar progress={progress} dark={dark} setDark={setDark} />
        <Suspense
          fallback={
            <p className="page" role="status">
              Cargando lección…
            </p>
          }
        >
          {screen === "inicio" && (
            <Dashboard
              progress={progress}
              recommendation={nextLesson(progress)}
              openLesson={openLesson}
              go={go}
            />
          )}{" "}
          {screen === "ruta" && (
            <Roadmap openLesson={openLesson} go={go} progress={progress} />
          )}{" "}
          {screen === "leccion" && (
            <LessonView
              key={lessonId}
              lesson={lessons.find((l) => l.id === lessonId)!}
              completed={progress.completed.includes(lessonId)}
              motion={motion}
              onBack={() => go("ruta")}
              onDone={(id) => {
                const result = completeLesson(progress, id);
                if (!result.awarded) {
                  notify("Esta lección ya está completada");
                  return;
                }
                setProgress(
                  (p) => completeLesson(markStudyDay(p), id).progress,
                );
                notify("Lección completada · +80 XP");
              }}
            />
          )}{" "}
          {screen === "laboratorio" && (
            <Lab
              onAwardXP={(amount: number, challengeId: string) => {
                setProgress((p) =>
                  awardOnce(
                    markStudyDay(p),
                    `challenge:${challengeId}`,
                    amount,
                  ),
                );
                notify(`¡Reto superado! +${amount} XP`);
              }}
            />
          )}{" "}
          {screen === "practica" && (
            <Practice progress={progress} setProgress={setProgress} />
          )}{" "}
          {screen === "evaluacion" && (
            <Assessment progress={progress} setProgress={setProgress} go={go} />
          )}{" "}
          {screen === "progreso" && (
            <ProgressView progress={progress} setProgress={setProgress} />
          )}{" "}
          {screen === "docente" && <Teacher />}
          {screen === "ajustes" && (
            <>
              <CloudAccount progress={progress} setProgress={setProgress} />
              <Settings
                dark={dark}
                setDark={setDark}
                motion={motion}
                setMotion={setMotion}
                captions={captions}
                setCaptions={setCaptions}
                textSize={textSize}
                setTextSize={setTextSize}
                progress={progress}
                onImportProgress={setProgress}
                onReset={() => {
                  if (
                    !window.confirm(
                      "¿Borrar el progreso y las preferencias guardadas en este dispositivo?",
                    )
                  )
                    return;
                  const cleared = clearStoredData(getBrowserStorage());
                  try {
                    Object.keys(sessionStorage)
                      .filter((key) => key.startsWith("funciones-session:"))
                      .forEach((key) => sessionStorage.removeItem(key));
                  } catch {
                    /* Reset in-memory progress even when browser storage is denied. */
                  }
                  setProgress(DEFAULT_PROGRESS);
                  setDark(DEFAULT_PREFERENCES.theme === "dark");
                  setMotion(DEFAULT_PREFERENCES.motion);
                  setCaptions(DEFAULT_PREFERENCES.captions);
                  setTextSize(DEFAULT_PREFERENCES.textSize);
                  notify(
                    cleared
                      ? "Datos locales reiniciados"
                      : "La app se reinició, pero el almacenamiento no está disponible",
                  );
                }}
              />
            </>
          )}
        </Suspense>
      </main>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
function TopBar({
  progress,
  dark,
  setDark,
}: {
  progress: Progress;
  dark: boolean;
  setDark: (v: boolean) => void;
}) {
  return (
    <header className="topbar">
      <div className="mobile-brand">
        <span className="brandmark">ƒ</span>
        <b>FuncionesLab</b>
      </div>
      <div className="top-spacer" />
      <div className="metric">
        <Flame size={19} className="text-orange" />
        <b>{progress.streak}</b>
        <small>días</small>
      </div>
      <div className="metric">
        <Sparkles size={19} className="text-amber" />
        <b>{progress.xp.toLocaleString("es")}</b>
        <small>XP</small>
      </div>
      <button
        className="iconbtn"
        onClick={() => setDark(!dark)}
        aria-label="Cambiar tema"
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <div className="avatar">FL</div>
    </header>
  );
}
