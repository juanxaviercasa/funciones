import { useEffect, useState } from "react";
import { createClient, type Session } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";
import { synchronizeProgress } from "./protocol";
import { type Progress } from "../persistence";
import { mergeProgress } from "./merge";
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const client =
  url && key ? createClient(url, key, { auth: { flowType: "pkce" } }) : null;
export function CloudAccount({
  progress,
  setProgress,
}: {
  progress: Progress;
  setProgress: React.Dispatch<React.SetStateAction<Progress>>;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!client) return;
    void client.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = client.auth.onAuthStateChange((_event, value) =>
      setSession(value),
    );
    return () => data.subscription.unsubscribe();
  }, []);
  const sync = useMutation({
    mutationFn: async () => {
      if (!client || !session) throw new Error("Inicia sesión primero.");
      // Explicit transfer: never silently associate a shared browser's local data with an account.
      const database = client;
      const merged = await synchronizeProgress(
        progress,
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
          const result = await database.rpc("save_learning_progress", {
            expected_revision: revision,
            new_payload: payload,
          });
          if (result.error) throw result.error;
          return result.data === true;
        },
      );
      setProgress((current) => mergeProgress(current, merged));
    },
    onSuccess: () => setMessage("Progreso sincronizado."),
    onError: (e) => setMessage(e.message),
  });
  return (
    <section className="page narrow">
      <h2>Respaldo opcional en la nube</h2>
      {!client ? (
        <p>
          Modo local activo. Para habilitar la nube, configura Supabase
          siguiendo README.md. No se envía ningún dato.
        </p>
      ) : session ? (
        <>
          <p>
            Sesión de respaldo: {session.user.email}. Tu progreso continúa
            guardándose en este navegador aunque cierres sesión.
          </p>
          <p>
            La transferencia solo ocurre cuando eliges combinar y sincronizar.
          </p>
          <button
            className="primary"
            disabled={sync.isPending}
            onClick={() => {
              if (
                confirm(
                  "¿Combinar el progreso de este navegador con esta cuenta? Usa un perfil de navegador separado en equipos compartidos.",
                )
              )
                sync.mutate();
            }}
          >
            Combinar y sincronizar
          </button>
          <button
            className="secondary"
            disabled={sync.isPending}
            onClick={async () => {
              const { error } = await client.auth.signOut();
              setMessage(error?.message ?? "Sesión cerrada.");
            }}
          >
            Cerrar sesión
          </button>
        </>
      ) : (
        <>
          <p>
            Tu progreso ya se guarda gratis en este dispositivo. Inicia sesión
            solo si quieres recuperarlo al cambiar de navegador o sincronizarlo
            entre dispositivos.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const { error } = await client.auth.signInWithOtp({
                email,
                options: {
                  emailRedirectTo:
                    window.location.origin + window.location.pathname,
                },
              });
              setMessage(
                error?.message ??
                  "Revisa tu correo para abrir el enlace de respaldo.",
              );
            }}
          >
            <label>
              Correo para el respaldo{" "}
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>
            <button className="primary">Enviar enlace de respaldo</button>
          </form>
          <p className="muted">
            Es opcional y no requiere contraseña. Nada se sube hasta que
            confirmes la sincronización.
          </p>
        </>
      )}
      <p role="status">
        {message}
        {sync.isPending && " Sincronizando…"}
      </p>
    </section>
  );
}
