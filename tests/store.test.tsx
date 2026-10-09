import { act, renderHook, waitFor, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useProgressStore } from "../src/useProgressStore";
import {
  DEFAULT_PROGRESS,
  loadProgress,
  PROGRESS_KEY,
  saveProgress,
} from "../src/persistence";
import { awardOnce } from "../src/learning";
beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(navigator, "locks", {
    configurable: true,
    value: { request: vi.fn(async (_name: string, fn: () => void) => fn()) },
  });
});
afterEach(cleanup);
it("mantiene el aprendizaje cuando el navegador rechaza Web Locks", async () => {
  Object.defineProperty(navigator, "locks", {
    configurable: true,
    value: { request: vi.fn().mockRejectedValue(Error("Acceso denegado")) },
  });
  const { result } = renderHook(() => useProgressStore(DEFAULT_PROGRESS));
  act(() => result.current[1]((p) => awardOnce(p, "fallback", 20, 1000)));
  await waitFor(() => expect(result.current[0].xp).toBe(20));
});
it("conserva dos actualizaciones funcionales y persiste una recompensa una sola vez", async () => {
  const { result } = renderHook(() => useProgressStore(DEFAULT_PROGRESS));
  act(() => {
    result.current[1]((p) => awardOnce(p, "a", 20, 1000));
    result.current[1]((p) => awardOnce(p, "b", 40, 2000));
  });
  await waitFor(() => expect(result.current[0].xp).toBe(60));
  expect(loadProgress(localStorage).value.xp).toBe(60);
});
it("respeta un reemplazo de otra pestaña, sin revivir datos borrados", async () => {
  saveProgress(localStorage, awardOnce(DEFAULT_PROGRESS, "old", 80, 1000));
  const { result } = renderHook(() =>
    useProgressStore(loadProgress(localStorage).value),
  );
  saveProgress(localStorage, DEFAULT_PROGRESS);
  localStorage.setItem("funciones-progress-generation", "replacement");
  act(() =>
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: PROGRESS_KEY,
        newValue: localStorage.getItem(PROGRESS_KEY),
      }),
    ),
  );
  await waitFor(() => expect(result.current[0].xp).toBe(0));
  act(() => result.current[1]((p) => awardOnce(p, "new", 20, 2000)));
  await waitFor(() => expect(result.current[0].xp).toBe(20));
});
