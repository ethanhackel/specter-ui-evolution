import { createRoot } from "react-dom/client";
import { Component, ErrorInfo, ReactNode } from "react";

// Import CSS first
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
            {"\n"}
            {this.state.error?.stack}
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

// Wrap the entire app initialization in a try-catch to surface any module-level errors
async function init() {
  const root = document.getElementById("root");
  if (!root) {
    console.error("Root element not found");
    return;
  }

  try {
    // Dynamic import so module-level errors are caught
    const { default: App } = await import("./App.tsx");
    createRoot(root).render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  } catch (e: any) {
    console.error("Failed to load app:", e);
    root.innerHTML = `
      <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0d0d0d;color:#fff;font-family:monospace;padding:2rem;text-align:center;gap:1rem">
        <h1 style="font-size:1.5rem;color:#ef4444">Failed to load SPECTERCHAT</h1>
        <pre style="font-size:0.75rem;color:#999;max-width:600px;overflow:auto;white-space:pre-wrap">${e?.message}\n${e?.stack || ''}</pre>
        <button onclick="location.reload()" style="padding:0.5rem 1.5rem;background:#ef4444;color:#fff;border:none;border-radius:0.5rem;cursor:pointer">Reload</button>
      </div>
    `;
  }
}

init();
