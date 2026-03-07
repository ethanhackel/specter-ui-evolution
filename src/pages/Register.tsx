import { useState } from "react";
import { Link } from "react-router-dom";
import specterMascot from "@/assets/specter-mascot.png";
import { Check } from "lucide-react";

const perks = [
  "Persistent persona across sessions",
  "Interest-based matching priority",
  "Karma & reputation system",
  "Chat history (optional)",
];

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = () => {
    setError("");
    setSuccess("");
    if (!username || !password) { setError("Username and password required"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    // TODO: API call
    setSuccess("✓ Account created! Redirecting...");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(hsl(0 72% 51% / 0.03) 1px, transparent 1px), linear-gradient(90deg, hsl(0 72% 51% / 0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="glass-card w-full max-w-md p-10 relative z-10" style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 60px hsl(0 72% 51% / 0.05)" }}>
        <Link to="/" className="block text-center mb-2">
          <img src={specterMascot} alt="SPECTER" className="w-12 h-12 mx-auto mb-3" />
          <span className="font-heading font-black text-2xl tracking-widest text-gradient">SPECTER</span>
        </Link>
        <p className="text-center text-xs font-mono tracking-[0.2em] text-muted-foreground mb-8">
          // JOIN THE VOID
        </p>

        {/* Perks */}
        <div className="glass-card p-4 mb-6 border-primary/10">
          <p className="text-xs font-mono tracking-[0.2em] text-primary mb-3">// ACCOUNT PERKS</p>
          {perks.map((perk) => (
            <div key={perk} className="flex items-center gap-2 text-sm text-muted-foreground mb-1.5 last:mb-0">
              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              {perk}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded px-4 py-3 text-sm text-destructive mb-5">{error}</div>
        )}
        {success && (
          <div className="rounded px-4 py-3 text-sm mb-5" style={{ background: "hsl(145 63% 42% / 0.08)", border: "1px solid hsl(145 63% 42% / 0.2)", color: "hsl(145 63% 42%)" }}>
            {success}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono tracking-[0.2em] text-muted-foreground mb-2">USERNAME</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="choose_your_handle"
              maxLength={20}
              className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/50"
            />
            <p className="text-xs text-muted-foreground mt-1.5 font-mono">3–20 characters, letters/numbers/underscore</p>
          </div>
          <div>
            <label className="block text-xs font-mono tracking-[0.2em] text-muted-foreground mb-2">
              EMAIL <span className="opacity-50">(optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ghost@nowhere.void"
              className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/50"
            />
          </div>
          <div>
            <label className="block text-xs font-mono tracking-[0.2em] text-muted-foreground mb-2">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="min 6 characters"
              className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/50"
            />
          </div>
          <div>
            <label className="block text-xs font-mono tracking-[0.2em] text-muted-foreground mb-2">CONFIRM PASSWORD</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              placeholder="repeat password"
              className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/50"
            />
          </div>

          <button
            onClick={handleRegister}
            className="w-full py-3.5 rounded bg-primary text-primary-foreground font-heading font-bold text-sm tracking-widest uppercase btn-primary-glow transition-all hover:scale-[1.02]"
          >
            CREATE ACCOUNT
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Already a ghost?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
