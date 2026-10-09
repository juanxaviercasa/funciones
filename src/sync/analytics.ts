import { useEffect } from "react";
import { supabase } from "./supabaseClient";

function safeLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_/-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function useProductAnalytics(pageName: string) {
  useEffect(() => {
    if (!supabase) return;
    const database = supabase;
    const page = safeLabel(pageName) || "unknown";
    let authenticated = false;
    const record = async (
      eventType: "page_view" | "page_time" | "button_click",
      target = "",
      durationSeconds = 0,
    ) => {
      if (!authenticated) return;
      await database.rpc("record_user_activity", {
        p_event_type: eventType,
        p_page: page,
        p_target: safeLabel(target),
        p_duration_seconds: durationSeconds,
      });
    };
    void database.auth.getSession().then(({ data }) => {
      authenticated = Boolean(data.session);
      if (authenticated) void record("page_view");
    });
    const { data: listener } = database.auth.onAuthStateChange(
      (event, session) => {
        const wasAuthenticated = authenticated;
        authenticated = Boolean(session);
        if (!wasAuthenticated && authenticated && event === "SIGNED_IN") {
          window.setTimeout(() => void record("page_view"), 0);
        }
      },
    );
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible")
        void record("page_time", "", 30);
    }, 30_000);
    const onClick = (event: MouseEvent) => {
      const target = (event.target as Element | null)?.closest<HTMLElement>(
        "[data-analytics]",
      );
      if (target?.dataset.analytics)
        void record("button_click", target.dataset.analytics);
    };
    document.addEventListener("click", onClick);
    return () => {
      listener.subscription.unsubscribe();
      window.clearInterval(timer);
      document.removeEventListener("click", onClick);
    };
  }, [pageName]);
}
