import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border py-8 sm:py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
        <div>
          <span className="font-heading font-black text-lg tracking-widest text-muted-foreground">
            SPECTER<span className="text-primary">CHAT</span>
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
          <Link to="/features" className="hover:text-foreground transition-colors py-1">Features</Link>
          <Link to="/how-it-works" className="hover:text-foreground transition-colors py-1">How it works</Link>
          <Link to="/login" className="hover:text-foreground transition-colors py-1">Sign In</Link>
          <Link to="/privacy" className="hover:text-foreground transition-colors py-1">Privacy</Link>
          <Link to="/terms" className="hover:text-foreground transition-colors py-1">Terms</Link>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-4 sm:mt-6">
        <p className="text-[0.65rem] sm:text-xs font-mono text-muted-foreground tracking-wider text-center sm:text-left">
          © {new Date().getFullYear()} SPECTERCHAT — Anonymous chat, no trace.
        </p>
      </div>
    </footer>
  );
};

export default Footer;