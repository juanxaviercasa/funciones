import React from "react";
export class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    console.error("Funciones Lab:", error.message);
  }
  render() {
    return this.state.failed ? (
      <main className="page">
        <h1>No pudimos mostrar esta pantalla</h1>
        <p>
          Tu progreso guardado sigue disponible. Recarga para volver a
          intentarlo.
        </p>
        <button onClick={() => location.reload()}>Recargar</button>
      </main>
    ) : (
      this.props.children
    );
  }
}
