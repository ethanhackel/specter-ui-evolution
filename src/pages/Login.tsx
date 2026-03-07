import { useState } from "react";
import { Link } from "react-router-dom";
import specterMascot from "@/assets/specter-mascot.png";
import { Ghost } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }
    // TODO: API call
    setError("");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative">
      {/* Grid overlay */}
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
        <p className="text-center text-xs font-mono tracking-[0.2em] text-muted-foreground mb-10">
          // WELCOME BACK, GHOST
        </p>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded px-4 py-3 text-sm text-destructive mb-5">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-mono tracking-[0.2em] text-muted-foreground mb-2">USERNAME</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="your_username"
              className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/50"
            />
          </div>
          <div>
            <label className="block text-xs font-mono tracking-[0.2em] text-muted-foreground mb-2">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="••••••••"
              className="w-full bg-secondary border border-border rounded px-4 py-3 text-foreground text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/50"
            />
          </div>

          <button
            onClick={handleLogin}
            className="w-full py-3.5 rounded bg-primary text-primary-foreground font-heading font-bold text-sm tracking-widest uppercase btn-primary-glow transition-all hover:scale-[1.02]"
          >
            SIGN IN
          </button>

          <div className="relative text-center my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <span className="relative bg-card px-4 text-xs font-mono text-muted-foreground">OR</span>
          </div>

          <Link
            to="/chat"
            className="w-full py-3.5 rounded glass-card flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground font-heading font-bold text-sm tracking-widest uppercase transition-all hover:scale-[1.02]"
          >
            <Ghost className="w-4 h-4" />
            Continue as Ghost
          </Link>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          No account?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
