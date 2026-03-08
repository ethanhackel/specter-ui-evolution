import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import specterMascot from "@/assets/specter-mascot.png";
import { ArrowLeft, RefreshCw } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [error, setError] = useState("");

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(result);
    setCaptchaInput("");
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleLogin = () => {
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }
    if (captchaInput.toUpperCase() !== captcha) {
      setError("Incorrect verification code");
      generateCaptcha();
      return;
    }
    setError("");
    navigate("/chat");
  };

  return (
    <div className="min-h-[100dvh] bg-background flex items-center justify-center px-4 sm:px-6 py-8 relative">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(hsl(0 72% 51% / 0.03) 1px, transparent 1px), linear-gradient(90deg, hsl(0 72% 51% / 0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="glass-card w-full max-w-md p-6 sm:p-10 relative z-10" style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 60px hsl(0 72% 51% / 0.05)" }}>
        <Link to="/" className="absolute top-4 sm:top-6 left-4 sm:left-6 flex items-center gap-2 text-xs sm:text-sm text-primary hover:text-primary/80 transition-colors group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-mono tracking-wider">Back</span>
        </Link>

        <Link to="/" className="block text-center mb-2 mt-8">
          <img src={specterMascot} alt="SPECTERCHAT" className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3" />
          <span className="font-heading font-black text-xl sm:text-2xl tracking-widest"><span className="text-gradient">SPECTER</span><span className="text-foreground">CHAT</span></span>
        </Link>
        <p className="text-center text-sm sm:text-base font-semibold text-foreground mb-1.5 sm:mb-2">
          Welcome Back
        </p>
        <p className="text-center text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-10">
          Sign in to your haunted account
        </p>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-destructive mb-4 sm:mb-5">
            {error}
          </div>
        )}

        <div className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-[0.65rem] sm:text-xs font-mono tracking-[0.2em] text-muted-foreground mb-1.5 sm:mb-2">USERNAME</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              className="w-full bg-secondary border border-border rounded px-3 sm:px-4 py-2.5 sm:py-3 text-foreground text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/50"
            />
          </div>
          <div>
            <label className="block text-[0.65rem] sm:text-xs font-mono tracking-[0.2em] text-muted-foreground mb-1.5 sm:mb-2">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full bg-secondary border border-border rounded px-3 sm:px-4 py-2.5 sm:py-3 text-foreground text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/50"
            />
          </div>

          <div>
            <label className="block text-[0.65rem] sm:text-xs font-mono tracking-[0.2em] text-muted-foreground mb-1.5 sm:mb-2">VERIFICATION</label>
            <div className="flex gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="flex-1 bg-secondary border-2 border-primary/30 rounded px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-center gap-1.5 sm:gap-2 select-none" style={{ letterSpacing: "0.4em", fontFamily: "monospace" }}>
                {captcha.split("").map((char, i) => (
                  <span key={i} className="text-foreground text-lg sm:text-xl font-bold" style={{ transform: `rotate(${(Math.random() - 0.5) * 10}deg)` }}>
                    {char}
                  </span>
                ))}
              </div>
              <button
                onClick={generateCaptcha}
                type="button"
                className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded glass-card flex items-center justify-center text-primary hover:bg-primary/10 transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <input
              type="text"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Enter the code shown above"
              className="w-full bg-secondary border border-border rounded px-3 sm:px-4 py-2.5 sm:py-3 text-foreground text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/50"
              maxLength={6}
            />
          </div>

          <button
            onClick={handleLogin}
            className="w-full py-3 sm:py-3.5 rounded bg-primary text-primary-foreground font-heading font-bold text-xs sm:text-sm tracking-widest uppercase btn-primary-glow transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            SIGN IN
          </button>
        </div>

        <p className="text-center text-xs sm:text-sm text-muted-foreground mt-6 sm:mt-8">
          New to SPECTER?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;