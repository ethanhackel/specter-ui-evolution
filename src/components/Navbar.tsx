import { Link } from "react-router-dom";
import specterMascot from "@/assets/specter-mascot.png";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b" style={{ borderColor: 'hsl(0 0% 100% / 0.06)', background: 'hsl(0 0% 5% / 0.8)' }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={specterMascot} alt="SPECTER" className="w-8 h-8" />
          <span className="font-heading text-xl font-bold tracking-tight text-gradient">
            SPECTER
          </span>
        </Link>

        <div className="flex items-center gap-3">
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
      </div>
    </nav>
  );
};

export default Navbar;
