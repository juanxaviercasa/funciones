import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import { synchronizeProgress } from "./protocol";
import { mergeProgress } from "./merge";
import type { Progress } from "../persistence";

export function useCloudBackup(
  progress: Progress,
  setProgress: React.Dispatch<React.SetStateAction<Progress>>,
  enabled: boolean,
) {
  const [status, setStatus] = useState("");
  const busy = useRef(false);
  const current = useRef(progress);
  current.current = progress;
  useEffect(() => {
    if (!enabled || !supabase) return;
    const database = supabase;
    const save = async () => {
      if (busy.current || !navigator.onLine) return;
      const {
        data: { session },
      } = await database.auth.getSession();
      if (!session) {
        setStatus("Progreso guardado en este navegador");
        return;
      }
      busy.current = true;
      setStatus("Respaldando progreso…");
      try {
        const merged = await synchronizeProgress(
          current.current,
          async () => {
            const { data, error } = await database
              .from("learning_progress")
              .select("payload,revision")
              .eq("user_id", session.user.id)
              .maybeSingle();
            if (error) throw error;
            return data;
          },
          async (revision, payload) => {
            const { data, error } = await database.rpc(
              "save_learning_progress",
              { expected_revision: revision, new_payload: payload },
            );
            if (error) throw error;
            return data === true;
          },
        );
        setProgress((previous) => {
          const next = mergeProgress(previous, merged);
          return JSON.stringify(previous) === JSON.stringify(next)
            ? previous
            : next;
        });
        setStatus("Progreso respaldado en la nube");
      } catch {
        setStatus(
          "Guardado en este navegador. El respaldo en la nube está pendiente.",
        );
      } finally {
        busy.current = false;
      }
    };
    const timer = window.setTimeout(() => void save(), 1500);
    const retry = window.setInterval(() => void save(), 60_000);
    window.addEventListener("online", save);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(retry);
      window.removeEventListener("online", save);
    };
  }, [progress, enabled, setProgress]);
  return status;
}
