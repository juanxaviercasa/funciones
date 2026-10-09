import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

type Dashboard = {
  registered_users: number;
  active_users: number;
  page_views: number;
  study_minutes: number;
  pages: Array<{ page: string; views: number; users: number; minutes: number }>;
  actions: Array<{ page: string; target: string; clicks: number }>;
  plans: Array<{ plan_slug: string; clicks: number; waitlist: number }>;
  users: Array<{
    id: string;
    email: string;
    display_name: string | null;
    education_level: string | null;
    lessons_completed: number;
    xp: number;
    last_sign_in_at: string | null;
  }>;
  waitlist: Array<{ plan_slug: string; email: string; consented_at: string }>;
};

const empty: Dashboard = {
  registered_users: 0,
  active_users: 0,
  page_views: 0,
  study_minutes: 0,
  pages: [],
  actions: [],
  plans: [],
  users: [],
  waitlist: [],
};
const dateTime = (value: string | null) =>
  value ? new Date(value).toLocaleString("es-PE") : "—";

export function AdminDashboard({ session }: { session: Session | null }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [dashboard, setDashboard] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadDashboard = async () => {
    if (!supabase || !session) return;
    setLoading(true);
    const { data, error } = await supabase.rpc("get_admin_dashboard", {
      p_days: 30,
    });
    setLoading(false);
    if (error) return setMessage("No se pudo actualizar el panel.");
    setDashboard({ ...empty, ...(data as Partial<Dashboard>) });
    setMessage("Panel actualizado.");
  };

  useEffect(() => {
    setIsAdmin(false);
    setDashboard(empty);
    if (!supabase || !session) return;
    let active = true;
    void supabase.rpc("is_current_user_admin").then(({ data }) => {
      if (active && data === true) {
        setIsAdmin(true);
        void loadDashboard();
      }
    });
    return () => {
      active = false;
    };
    // session user id is the authorization boundary; loadDashboard is intentionally fresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id]);

  if (!session || !isAdmin) return null;
  return (
    <section className="page admin-dashboard" aria-labelledby="admin-title">
      <div className="admin-heading">
        <div>
          <span className="kicker">ACCESO PRIVADO</span>
          <h2 id="admin-title">Panel de administración</h2>
          <p>Métricas de los últimos 30 días y usuarios registrados.</p>
        </div>
        <button
          className="secondary"
          disabled={loading}
          data-analytics="admin-refresh"
          onClick={() => void loadDashboard()}
        >
          {loading ? "Actualizando…" : "Actualizar"}
        </button>
      </div>
      <div className="admin-metrics">
        <article>
          <strong>{dashboard.registered_users}</strong>
          <span>Usuarios registrados</span>
        </article>
        <article>
          <strong>{dashboard.active_users}</strong>
          <span>Usuarios activos</span>
        </article>
        <article>
          <strong>{dashboard.page_views}</strong>
          <span>Visitas de página</span>
        </article>
        <article>
          <strong>{dashboard.study_minutes}</strong>
          <span>Minutos visibles</span>
        </article>
      </div>
      <div className="admin-grid">
        <article className="admin-card">
          <h3>Páginas más usadas</h3>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Página</th>
                  <th>Visitas</th>
                  <th>Usuarios</th>
                  <th>Minutos</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.pages.map((row) => (
                  <tr key={row.page}>
                    <td>{row.page}</td>
                    <td>{row.views}</td>
                    <td>{row.users}</td>
                    <td>{row.minutes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
        <article className="admin-card">
          <h3>Interacciones</h3>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Página</th>
                  <th>Acción</th>
                  <th>Clics</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.actions.map((row) => (
                  <tr key={`${row.page}-${row.target}`}>
                    <td>{row.page}</td>
                    <td>{row.target}</td>
                    <td>{row.clicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
      <article className="admin-card">
        <h3>Interés en planes</h3>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Plan</th>
                <th>Clics</th>
                <th>Lista de interés</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.plans.map((row) => (
                <tr key={row.plan_slug}>
                  <td>{row.plan_slug}</td>
                  <td>{row.clicks}</td>
                  <td>{row.waitlist}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
      <article className="admin-card">
        <h3>Usuarios recientes</h3>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Correo</th>
                <th>Nombre</th>
                <th>Nivel</th>
                <th>Lecciones</th>
                <th>XP</th>
                <th>Último acceso</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.users.map((row) => (
                <tr key={row.id}>
                  <td>{row.email}</td>
                  <td>{row.display_name || "—"}</td>
                  <td>{row.education_level || "—"}</td>
                  <td>{row.lessons_completed}</td>
                  <td>{row.xp}</td>
                  <td>{dateTime(row.last_sign_in_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
      <article className="admin-card">
        <h3>Lista de interés</h3>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Plan</th>
                <th>Correo</th>
                <th>Consentimiento</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.waitlist.map((row) => (
                <tr key={`${row.plan_slug}-${row.email}`}>
                  <td>{row.plan_slug}</td>
                  <td>{row.email}</td>
                  <td>{dateTime(row.consented_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
      <p role="status">{message}</p>
    </section>
  );
}
