import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

type Plan = {
  slug: "free" | "pro" | "teacher";
  name: string;
  price: string;
  description: string;
  features: string[];
  action: string;
  featured?: boolean;
};

const plans: Plan[] = [
  {
    slug: "free",
    name: "Libre",
    price: "S/ 0",
    description: "Aprende y practica sin crear una cuenta.",
    features: [
      "Lecciones y laboratorio",
      "Práctica adaptativa",
      "Cuenta y respaldo básico opcional",
    ],
    action: "Plan disponible",
  },
  {
    slug: "pro",
    name: "Pro",
    price: "Próximamente",
    description: "Más personalización para avanzar con un plan propio.",
    features: [
      "Estadísticas avanzadas",
      "Plan de estudio personalizado",
      "Contenido y reportes adicionales",
    ],
    action: "Me interesa Pro",
    featured: true,
  },
  {
    slug: "teacher",
    name: "Docente",
    price: "Próximamente",
    description: "Seguimiento y actividades para grupos de aprendizaje.",
    features: [
      "Aulas y estudiantes",
      "Tareas y reportes",
      "Licencias para instituciones",
    ],
    action: "Me interesa Docente",
  },
];

export function Plans({ session }: { session: Session | null }) {
  const [selected, setSelected] = useState<Plan | null>(null);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setSelected(null);
    setConsent(false);
    setStatus("");
  }, [session?.user.id]);

  const showInterest = async (plan: Plan) => {
    if (!session) {
      setStatus(
        "Inicia sesión o crea una cuenta para registrar tu interés en este plan.",
      );
      document
        .querySelector<HTMLElement>(".account-page")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setSelected(plan);
    setConsent(false);
    setStatus("Registrando interés…");
    if (!supabase) return;
    const { error } = await supabase.rpc("record_plan_interest", {
      p_plan_slug: plan.slug,
      p_join_waitlist: false,
    });
    setStatus(
      error
        ? "No pudimos registrar el interés todavía."
        : "Interés registrado. Puedes unirte a la lista si quieres recibir un aviso.",
    );
  };

  const joinWaitlist = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase || !session || !selected || !consent) return;
    setStatus("Registrando…");
    const { error } = await supabase.rpc("record_plan_interest", {
      p_plan_slug: selected.slug,
      p_join_waitlist: true,
    });
    setStatus(
      error
        ? "No pudimos registrarte. Intenta de nuevo."
        : "Listo. Te avisaremos al correo de tu cuenta si abrimos este plan.",
    );
  };

  return (
    <section className="page pricing-page" aria-labelledby="plans-title">
      <div className="section-heading">
        <span className="kicker">PRÓXIMOS PASOS</span>
        <h2 id="plans-title">Elige cómo quieres aprender</h2>
        <p>
          Todo lo actual permanece libre. Los planes futuros se activarán solo
          cuando aporten suficiente valor.
        </p>
      </div>
      <div className="plans-grid">
        {plans.map((plan) => (
          <article
            className={`plan-card${plan.featured ? " featured" : ""}`}
            key={plan.slug}
          >
            {plan.featured && <span className="plan-badge">En evaluación</span>}
            <h3>{plan.name}</h3>
            <p className="plan-price">{plan.price}</p>
            <p>{plan.description}</p>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <button
              className={plan.featured ? "primary" : "secondary"}
              disabled={plan.slug === "free"}
              data-analytics={`plan-${plan.slug}`}
              onClick={() => void showInterest(plan)}
            >
              {plan.action}
            </button>
          </article>
        ))}
      </div>
      {selected && session && (
        <form className="waitlist-panel" onSubmit={joinWaitlist}>
          <div>
            <h3>Lista de interés · {selected.name}</h3>
            <p>
              Esto no es una compra. Usaremos el interés para decidir qué
              construir y enviaremos un único aviso al correo de tu cuenta si el
              plan se abre.
            </p>
          </div>
          <label className="consent-row">
            <input
              type="checkbox"
              required
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            Acepto recibir un aviso relacionado con este plan.
          </label>
          <button
            className="primary"
            data-analytics={`waitlist-${selected.slug}`}
          >
            Unirme a la lista
          </button>
        </form>
      )}
      <p role="status">{status}</p>
    </section>
  );
}
