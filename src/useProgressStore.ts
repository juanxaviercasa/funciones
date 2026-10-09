import { useCallback, useEffect, useRef, useState } from "react";
import {
  getBrowserStorage,
  loadProgress,
  normalizeProgress,
  saveProgress,
  type Progress,
} from "./persistence";
import { mergeProgress } from "./sync/merge";
const generationKey = "funciones-progress-generation";
function readGeneration() {
  try {
    return getBrowserStorage()?.getItem(generationKey) ?? "initial";
  } catch {
    return "initial";
  }
}
export function useProgressStore(
  initial: Progress,
): [Progress, React.Dispatch<React.SetStateAction<Progress>>] {
  const [progress, setState] = useState(initial);
  const current = useRef(initial);
  const generation = useRef(readGeneration());
  const setProgress = useCallback<
    React.Dispatch<React.SetStateAction<Progress>>
  >((update) => {
    const apply = () => {
      const storedGeneration = readGeneration();
      if (generation.current !== storedGeneration)
        current.current = loadProgress(getBrowserStorage()).value;
      generation.current = storedGeneration;
      if (typeof update === "function")
        current.current = mergeProgress(
          current.current,
          loadProgress(getBrowserStorage()).value,
        );
      const next = normalizeProgress(
        typeof update === "function" ? update(current.current) : update,
      );
      current.current = next;
      if (typeof update !== "function") {
        generation.current = crypto.randomUUID();
        try {
          getBrowserStorage()?.setItem(generationKey, generation.current);
        } catch {
          window.dispatchEvent(new Event("progress-save-failed"));
        }
      }
      if (!saveProgress(getBrowserStorage(), next))
        window.dispatchEvent(new Event("progress-save-failed"));
      setState(next);
    };
    if (navigator.locks) {
      let applied = false;
      void navigator.locks
        .request("funciones-progress", () => {
          applied = true;
          apply();
        })
        .catch(() => {
          if (!applied) apply();
        });
    } else apply();
  }, []);
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key?.startsWith("funciones-progress")) {
        // A clear/import is an explicit replacement, not another earned event.
        const merged =
          event.newValue === null || readGeneration() !== generation.current
            ? loadProgress(getBrowserStorage()).value
            : mergeProgress(
                current.current,
                loadProgress(getBrowserStorage()).value,
              );
        current.current = merged;
        generation.current = readGeneration();
        setState(merged);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return [progress, setProgress];
}
