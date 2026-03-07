import { motion } from "framer-motion";

const lines = [
  { prompt: "[SPECTER] ", text: "Searching for a stranger...", color: "text-muted-foreground" },
  { prompt: "[SYSTEM]  ", text: "✓ Match found — Ghost#8a2f connected", color: "text-emerald-500" },
  { prompt: "[SYSTEM]  ", text: "Connection established. Session encrypted.", color: "text-amber-500" },
  { prompt: "[YOU]     ", text: "Hey stranger, where are you from?", color: "text-primary", gap: true },
  { prompt: "[GHOST]   ", text: "Somewhere between nowhere and everywhere 😄", color: "text-muted-foreground" },
  { prompt: "[YOU]     ", text: "Perfect place to be...", color: "text-primary" },
  { prompt: "[SYSTEM]  ", text: "Ghost#8a2f has disconnected — session ended", color: "text-destructive", gap: true },
  { prompt: "[SPECTER] ", text: "They vanished. Find another?", color: "text-muted-foreground", cursor: true },
];

const TerminalDemo = () => {
  return (
    <motion.div
      className="max-w-3xl mx-auto px-6 mb-24"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="glass-card overflow-hidden" style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.4)" }}>
        {/* Terminal bar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-secondary/50">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="ml-3 text-xs font-mono text-muted-foreground">specter://chat-session</span>
        </div>

        {/* Terminal body */}
        <div className="p-6 font-mono text-sm leading-loose">
          {lines.map((line, i) => (
            <div key={i} className={line.gap ? "mt-3" : ""}>
              <span className="text-primary/70">{line.prompt}</span>
              <span className={line.color}>{line.text}</span>
              {line.cursor && (
                <span className="inline-block w-2 h-4 bg-primary ml-1 align-text-bottom animate-pulse" />
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TerminalDemo;
