import { createRoot } from "react-dom/client";
import { Component, ErrorInfo, ReactNode } from "react";
import App from "./App.tsx";
import "./index.css";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0d0d",
          color: "#fff",
          fontFamily: "monospace",
          padding: "2rem",
          textAlign: "center",
          flexDirection: "column",
          gap: "1rem",
        }}>
          <h1 style={{ fontSize: "1.5rem", color: "#ef4444" }}>Something went wrong</h1>
          <pre style={{ fontSize: "0.875rem", color: "#999", maxWidth: "600px", overflow: "auto", whiteSpace: "pre-wrap" }}>
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: "0.5rem 1.5rem", background: "#ef4444", color: "#fff", border: "none", borderRadius: "0.5rem", cursor: "pointer" }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

try {
  const root = document.getElementById("root");
  if (root) {
    createRoot(root).render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  } else {
    console.error("Root element not found");
  }
} catch (e) {
  console.error("Failed to mount app:", e);
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0d0d0d;color:#ef4444;font-family:monospace;padding:2rem;text-align:center"><h1>Failed to load app: ${(e as Error)?.message}</h1></div>`;
  }
}
