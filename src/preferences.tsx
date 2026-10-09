import React, { createContext, useContext, useEffect, useState } from "react";
type Motion = { motion: boolean; captions: boolean };
const Context = createContext<Motion>({ motion: true, captions: true });
export function PreferencesProvider({ children }: React.PropsWithChildren) {
  const [options, setOptions] = useState<Motion>({
    motion: !matchMedia("(prefers-reduced-motion: reduce)").matches,
    captions: true,
  });
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () =>
      setOptions({
        motion:
          document.documentElement.dataset.motion !== "off" && !media.matches,
        captions: document.documentElement.dataset.captions !== "off",
      });
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-motion", "data-captions"],
    });
    media.addEventListener("change", update);
    update();
    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
    };
  }, []);
  return <Context.Provider value={options}>{children}</Context.Provider>;
}
export const usePreferences = () => useContext(Context);
