import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

const PasswordInput = ({ className = "", ...props }: Props) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={show ? "text" : "password"}
        className={`w-full bg-secondary border border-border rounded px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-11 text-foreground text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/50 ${className}`}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 sm:right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
        aria-label={show ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default PasswordInput;
