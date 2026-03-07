import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="font-heading font-black text-lg tracking-widest text-muted-foreground">
            SPEC<span className="text-primary">TER</span>
          </span>
        </div>
        <div className="flex items-center gap-8 text-sm text-muted-foreground">
          <Link to="#features" className="hover:text-foreground transition-colors">Features</Link>
          <Link to="#how" className="hover:text-foreground transition-colors">How it works</Link>
          <Link to="/login" className="hover:text-foreground transition-colors">Sign In</Link>
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-6">
        <p className="text-xs font-mono text-muted-foreground tracking-wider">
          © {new Date().getFullYear()} SPECTER — Anonymous chat, no trace.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
