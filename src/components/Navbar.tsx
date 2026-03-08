import { Link } from "react-router-dom";
import specterMascot from "@/assets/specter-mascot.png";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b" style={{ borderColor: 'hsl(0 0% 100% / 0.06)', background: 'hsl(0 0% 5% / 0.8)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={specterMascot} alt="SPECTER" className="w-7 h-7 sm:w-8 sm:h-8" />
          <span className="font-heading text-lg sm:text-xl font-bold tracking-tight text-gradient">
            SPECTER
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-secondary-foreground hover:text-foreground transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground btn-primary-glow transition-all duration-300 hover:scale-105"
          >
            Register
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-border px-4 py-4 flex flex-col gap-2" style={{ background: 'hsl(0 0% 5% / 0.95)' }}>
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-3 text-sm font-medium text-secondary-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-3 text-sm font-medium rounded-lg bg-primary text-primary-foreground btn-primary-glow text-center"
          >
            Register
          </Link>
          <Link
            to="/chat"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-3 text-sm font-medium rounded-lg glass-card text-center text-muted-foreground hover:text-foreground"
          >
            ⚡ Start Chatting
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;