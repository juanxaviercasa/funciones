import { useEffect, useState } from "react";
import { lessons } from "./content";
export type Screen =
  | "inicio"
  | "ruta"
  | "leccion"
  | "laboratorio"
  | "practica"
  | "evaluacion"
  | "progreso"
  | "ajustes"
  | "docente";
const screens: Screen[] = [
  "inicio",
  "ruta",
  "leccion",
  "laboratorio",
  "practica",
  "evaluacion",
  "progreso",
  "ajustes",
  "docente",
];
export function readRoute() {
  const [candidate, id] = location.hash.replace(/^#\/?/, "").split("/");
  const screen = screens.includes(candidate as Screen)
    ? (candidate as Screen)
    : "inicio";
  const lessonId = lessons.some((l) => l.id === id) ? id : "que-es";
  return { screen, lessonId };
}
export function useRoute() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const update = () => setRoute(readRoute());
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  const navigate = (screen: Screen, lessonId?: string) => {
    const hash = `#/${screen}${screen === "leccion" ? `/${lessonId ?? route.lessonId}` : ""}`;
    location.hash = hash;
    setRoute(readRoute());
  };
  return { ...route, navigate };
}
