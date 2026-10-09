import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";
import { synchronizeProgress } from "./protocol";
import { type Progress } from "../persistence";
import { mergeProgress } from "./merge";
import { Plans } from "./Plans";
import { AdminDashboard } from "./AdminDashboard";
import { authRedirectUrl, supabase } from "./supabaseClient";

type AuthMode = "login" | "register" | "forgot";
type Profile = {
  display_name: string;
  education_level: string;
  learning_goal: string;
};

const emptyProfile: Profile = {
  display_name: "",
  education_level: "",
  learning_goal: "",
};

export function CloudAccount({
  progress,
  setProgress,
}: {
  progress: Progress;
  setProgress: React.Dispatch<React.SetStateAction<Progress>>;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [mode, setMode] = useState<AuthMode>("login");
  const [recovery, setRecovery] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((event, value) => {
      setSession(value);
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !session) {
      setProfile(emptyProfile);
      return;
    }
    void supabase
      .from("profiles")
      .select("display_name,education_level,learning_goal")
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          setMessage("No pudimos cargar el perfil.");
          return;
        }
        if (data) setProfile(data);
      });
  }, [session]);

  const sync = useMutation({
    mutationFn: async () => {
      if (!supabase || !session) throw new Error("Inicia sesión primero.");
      const database = supabase;
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
    onError: (error) => setMessage(error.message),
  });

  const submitAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setMessage("Procesando…");

    if (recovery) {
      if (password.length < 8 || password !== confirmation) {
        setMessage("Usa al menos 8 caracteres y confirma la misma contraseña.");
        return;
      }
      const { error } = await supabase.auth.updateUser({ password });
      setMessage(error?.message ?? "Contraseña actualizada.");
      if (!error) {
        setRecovery(false);
        setPassword("");
        setConfirmation("");
      }
      return;
    }

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: authRedirectUrl(),
      });
      setMessage(
        error?.message ?? "Revisa tu correo para crear una nueva contraseña.",
      );
      return;
    }

    if (password.length < 8) {
      setMessage("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (mode === "register") {
      if (password !== confirmation) {
        setMessage("Las contraseñas no coinciden.");
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: authRedirectUrl() },
      });
      setMessage(
        error?.message ??
          "Cuenta creada. Revisa tu correo una sola vez para confirmarla.",
      );
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setMessage(error?.message ?? "Sesión iniciada.");
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase || !session) return;
    setSavingProfile(true);
    const { error } = await supabase.from("profiles").upsert(
      {
        user_id: session.user.id,
        ...profile,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    setSavingProfile(false);
    setMessage(error?.message ?? "Perfil actualizado.");
  };

  return (
    <>
      <section className="page narrow account-page">
        <h2>Cuenta y respaldo opcional</h2>
        {!supabase ? (
          <p>
            Modo local activo. Para habilitar la nube, configura Supabase
            siguiendo README.md. No se envía ningún dato.
          </p>
        ) : session ? (
          <>
            <p>
              Cuenta: {session.user.email}. Tu progreso continúa guardándose en
              este navegador aunque cierres sesión.
            </p>
            <p className="account-privacy-note">
              Mientras tu sesión está activa registramos páginas visitadas,
              botones de producto marcados y tiempo visible para mejorar la
              herramienta. No registramos esta actividad sin una cuenta.
            </p>
            <div className="account-actions">
              <button
                className="primary"
                data-analytics="sync-progress"
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
                data-analytics="sign-out"
                disabled={sync.isPending}
                onClick={async () => {
                  if (!supabase) return;
                  const { error } = await supabase.auth.signOut();
                  setMessage(error?.message ?? "Sesión cerrada.");
                }}
              >
                Cerrar sesión
              </button>
            </div>
            <form className="profile-form" onSubmit={saveProfile}>
              <h3>Tu perfil de aprendizaje</h3>
              <label>
                Nombre o alias
                <input
                  maxLength={80}
                  value={profile.display_name}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      display_name: event.target.value,
                    }))
                  }
                  autoComplete="nickname"
                />
              </label>
              <label>
                Nivel educativo
                <select
                  value={profile.education_level}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      education_level: event.target.value,
                    }))
                  }
                >
                  <option value="">Prefiero no indicar</option>
                  <option value="school">Escuela</option>
                  <option value="preuniversity">Preuniversitario</option>
                  <option value="university">Universidad</option>
                  <option value="independent">Aprendizaje independiente</option>
                </select>
              </label>
              <label>
                Objetivo
                <textarea
                  maxLength={300}
                  value={profile.learning_goal}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      learning_goal: event.target.value,
                    }))
                  }
                  placeholder="Ejemplo: prepararme para un examen de ingreso"
                />
              </label>
              <button
                className="secondary"
                disabled={savingProfile}
                data-analytics="save-profile"
              >
                {savingProfile ? "Guardando…" : "Guardar perfil"}
              </button>
            </form>
          </>
        ) : (
          <>
            <p>
              La aplicación funciona sin cuenta. Regístrate solo si quieres
              respaldar tu avance, recuperarlo o usarlo en varios dispositivos.
            </p>
            <div className="auth-tabs" aria-label="Opciones de cuenta">
              <button
                type="button"
                aria-pressed={!recovery && mode === "login"}
                onClick={() => {
                  setRecovery(false);
                  setMode("login");
                  setMessage("");
                }}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                aria-pressed={!recovery && mode === "register"}
                onClick={() => {
                  setRecovery(false);
                  setMode("register");
                  setMessage("");
                }}
              >
                Crear cuenta
              </button>
            </div>
            <form className="auth-form" onSubmit={submitAuth}>
              {recovery ? (
                <h3>Crea una contraseña nueva</h3>
              ) : mode === "forgot" ? (
                <h3>Recupera tu contraseña</h3>
              ) : null}
              {!recovery && (
                <label>
                  Correo electrónico
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                  />
                </label>
              )}
              {mode !== "forgot" && (
                <label>
                  {recovery ? "Nueva contraseña" : "Contraseña"}
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete={
                      mode === "login" && !recovery
                        ? "current-password"
                        : "new-password"
                    }
                  />
                </label>
              )}
              {(mode === "register" || recovery) && (
                <label>
                  Confirmar contraseña
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    autoComplete="new-password"
                  />
                </label>
              )}
              <button className="primary">
                {recovery
                  ? "Actualizar contraseña"
                  : mode === "register"
                    ? "Crear cuenta gratuita"
                    : mode === "forgot"
                      ? "Enviar enlace de recuperación"
                      : "Iniciar sesión"}
              </button>
              {!recovery && mode === "login" && (
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    setMode("forgot");
                    setMessage("");
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}
              {!recovery && mode === "forgot" && (
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    setMode("login");
                    setMessage("");
                  }}
                >
                  Volver al inicio de sesión
                </button>
              )}
            </form>
          </>
        )}
        <p role="status">
          {message}
          {sync.isPending && " Sincronizando…"}
        </p>
      </section>
      <AdminDashboard session={session} />
      <Plans session={session} />
    </>
  );
}
