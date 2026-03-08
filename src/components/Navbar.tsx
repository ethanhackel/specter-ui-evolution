import { Link, useNavigate } from "react-router-dom";
import specterMascot from "@/assets/specter-mascot.png";
import { useState } from "react";
import { Menu, X, User, LogOut, Settings, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b" style={{ borderColor: 'hsl(0 0% 100% / 0.06)', background: 'hsl(0 0% 5% / 0.8)' }} aria-label="Main navigation">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={specterMascot} alt="SPECTERCHAT" className="w-7 h-7 sm:w-8 sm:h-8" loading="eager" />
          <span className="font-heading text-lg sm:text-xl font-bold tracking-tight">
            <span className="text-gradient">SPECTER</span><span className="text-foreground">CHAT</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/chat"
                className="px-4 py-2 text-sm font-medium text-secondary-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" /> Start Chatting
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center text-primary hover:text-primary-foreground hover:from-primary hover:to-primary/80 transition-all" aria-label="User menu">
                    <User className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {profile && (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground font-mono truncate">
                      {profile.username}
                    </div>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" /> Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={async () => { await signOut(); navigate("/"); }} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-border px-4 py-4 flex flex-col gap-2" style={{ background: 'hsl(0 0% 5% / 0.95)' }}>
          {user ? (
            <>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 text-sm font-medium text-secondary-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" /> Profile Settings
              </Link>
              <Link
                to="/chat"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 text-sm font-medium rounded-lg glass-card text-center text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" /> Start Chatting
              </Link>
              <button
                onClick={async () => { setMenuOpen(false); await signOut(); navigate("/"); }}
                className="px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors rounded-lg text-left flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </>
          ) : (
            <>
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
                className="px-4 py-3 text-sm font-medium rounded-lg glass-card text-center text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" /> Start Chatting
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;