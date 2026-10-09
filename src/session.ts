import { useEffect, useState, type SetStateAction } from "react";
// Per-tab resume: never shared across accounts/devices or treated as earned evidence.
export function useSessionState<T>(
  key: string,
  initial: T | (() => T),
  valid: (value: unknown) => value is T,
) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(`funciones-session:${key}`);
      if (raw && raw.length < 100000) {
        const parsed: unknown = JSON.parse(raw);
        if (valid(parsed)) return parsed;
      }
    } catch {
      /* Storage may be disabled. */
    }
    return typeof initial === "function" ? (initial as () => T)() : initial;
  });
  useEffect(() => {
    try {
      sessionStorage.setItem(`funciones-session:${key}`, JSON.stringify(state));
    } catch {
      /* Learning remains available. */
    }
  }, [key, state]);
  return [state, setState] as [T, React.Dispatch<SetStateAction<T>>];
}
