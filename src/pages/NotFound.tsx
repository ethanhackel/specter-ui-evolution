import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import mascot from "@/assets/specter-mascot.png";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <div className="text-center">
        <img src={mascot} alt="Specter mascot" className="w-20 h-20 mx-auto mb-4 drop-shadow-[0_0_15px_hsl(var(--primary)/0.4)] animate-float" />
        <h1 className="mb-3 text-5xl font-heading font-black text-gradient">404</h1>
        <p className="mb-6 text-base text-muted-foreground">This page has vanished into the void.</p>
        <Link to="/" className="inline-flex px-6 py-3 rounded-sm bg-primary text-primary-foreground font-heading font-bold text-xs tracking-widest uppercase btn-primary-glow transition-all hover:scale-105 active:scale-95">
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
