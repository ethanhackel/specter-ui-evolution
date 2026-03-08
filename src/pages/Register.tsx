import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import specterMascot from "@/assets/specter-mascot.png";
import { Check, ArrowLeft, RefreshCw, X } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";
import { useAuth } from "@/contexts/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { signUp, user, profile, loading: authLoading, checkUsernameAvailable } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

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

  useEffect(() => {
    if (!authLoading && user && profile && !profile.is_guest && !user.is_anonymous) {
      navigate("/chat");
    }
  }, [user, profile, authLoading, navigate]);

  // Debounced username availability check
  useEffect(() => {
    if (username.length < 3) {
      setUsernameStatus("idle");
      return;
    }
    setUsernameStatus("checking");
    const timer = setTimeout(async () => {
      const available = await checkUsernameAvailable(username);
      setUsernameStatus(available ? "available" : "taken");
    }, 400);
    return () => clearTimeout(timer);
  }, [username, checkUsernameAvailable]);

  const handleRegister = async () => {
    setError("");
    setSuccess("");

    if (!username || !password) {
      setError("Username and password required");
      return;
    }
    if (username.length < 3 || username.length > 30) {
      setError("Username must be 3-30 characters");
      return;
    }
    if (usernameStatus === "taken") {
      setError("Username is already taken. Please choose another.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!agreed) {
      setError("Please agree to be a decent human being");
      return;
    }
    if (captchaInput.toUpperCase() !== captcha) {
      setError("Incorrect verification code");
      generateCaptcha();
      return;
    }

    setLoading(true);
    const { error: authError } = await signUp(username, email, password);
    setLoading(false);

    if (authError) {
      setError(authError);
      generateCaptcha();
      return;
    }

    setSuccess("Account created! Redirecting...");
    setTimeout(() => navigate("/chat"), 1500);
  };

  return (
    <div className="min-h-[100dvh] bg-background flex items-center justify-center px-4 sm:px-6 py-8 sm:py-10 relative">
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
        <p className="text-center text-sm sm:text-base font-semibold text-foreground mb-6 sm:mb-10">
          Create your anonymous identity
        </p>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-destructive mb-4 sm:mb-5">{error}</div>
        )}
        {success && (
          <div className="rounded px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm mb-4 sm:mb-5" style={{ background: "hsl(145 63% 42% / 0.08)", border: "1px solid hsl(145 63% 42% / 0.2)", color: "hsl(145 63% 42%)" }}>
            {success}
          </div>
        )}

        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-[0.65rem] sm:text-xs font-mono tracking-[0.2em] text-muted-foreground mb-1.5 sm:mb-2">USERNAME</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="3-30 chars (letters, digits, _)"
                maxLength={30}
                className="w-full bg-secondary border border-border rounded px-3 sm:px-4 py-2.5 sm:py-3 text-foreground text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/50 pr-24"
              />
              {usernameStatus === "checking" && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">checking...</span>
              )}
              {usernameStatus === "available" && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-500 flex items-center gap-1">
                  <Check className="w-3 h-3" /> available
                </span>
              )}
              {usernameStatus === "taken" && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-destructive flex items-center gap-1">
                  <X className="w-3 h-3" /> taken
                </span>
              )}
            </div>
          </div>
          <div>
            <label className="block text-[0.65rem] sm:text-xs font-mono tracking-[0.2em] text-muted-foreground mb-1.5 sm:mb-2">
              EMAIL <span className="text-muted-foreground/50">(optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-secondary border border-border rounded px-3 sm:px-4 py-2.5 sm:py-3 text-foreground text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/50"
            />
          </div>
          <div>
            <label className="block text-[0.65rem] sm:text-xs font-mono tracking-[0.2em] text-muted-foreground mb-1.5 sm:mb-2">PASSWORD</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label className="block text-[0.65rem] sm:text-xs font-mono tracking-[0.2em] text-muted-foreground mb-1.5 sm:mb-2">CONFIRM PASSWORD</label>
            <PasswordInput
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="agree"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 rounded border-border bg-secondary text-primary focus:ring-2 focus:ring-primary/20"
            />
            <label htmlFor="agree" className="text-xs sm:text-sm text-muted-foreground cursor-pointer">
              I agree to be a decent human being
            </label>
          </div>

          <div>
            <label className="block text-[0.65rem] sm:text-xs font-mono tracking-[0.2em] text-muted-foreground mb-1.5 sm:mb-2">VERIFICATION</label>
            <div className="flex gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="flex-1 bg-secondary border-2 border-primary/30 rounded px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-center gap-1.5 sm:gap-2 select-none" style={{ letterSpacing: "0.4em", fontFamily: "monospace" }}>
                {captcha.split("").map((char, i) => {
                  const rotation = ((i * 7 + 3) % 11) - 5;
                  return (
                    <span key={i} className="text-foreground text-lg sm:text-xl font-bold" style={{ transform: `rotate(${rotation}deg)` }}>
                      {char}
                    </span>
                  );
                })}
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
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              placeholder="Enter the code shown above"
              className="w-full bg-secondary border border-border rounded px-3 sm:px-4 py-2.5 sm:py-3 text-foreground text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/50"
              maxLength={6}
            />
          </div>

          <button
            onClick={handleRegister}
            disabled={loading || usernameStatus === "taken"}
            className="w-full py-3 sm:py-3.5 rounded bg-primary text-primary-foreground font-heading font-bold text-xs sm:text-sm tracking-widest uppercase btn-primary-glow transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "CREATING..." : "CREATE ACCOUNT"}
          </button>
        </div>

        <p className="text-center text-xs sm:text-sm text-muted-foreground mt-6 sm:mt-8">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
