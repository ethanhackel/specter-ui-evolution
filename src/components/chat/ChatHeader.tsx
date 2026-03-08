import { memo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Ghost, Zap, Flag, X, Menu as MenuIcon, User, LogOut } from "lucide-react";
import ReportSessionDialog from "@/components/chat/ReportSessionDialog";
import specterMascot from "@/assets/specter-mascot.png";
import { formatTime } from "@/components/chat/ChatSidebar";
import type { ChatState } from "@/hooks/useChat";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  state: ChatState;
  timer: number;
  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;
  onFind: () => void;
  onLeave: () => void;
  setState: (s: ChatState) => void;
  setSelectedInterests: (s: Set<string>) => void;
  onReportSession?: (reason: string) => void;
};

const statusConfig: Record<ChatState, { label: string; dotClass: string; pillBg: string }> = {
  idle: { label: "IDLE", dotClass: "bg-muted-foreground", pillBg: "bg-muted/50" },
  picking: { label: "PICKING", dotClass: "bg-amber-500", pillBg: "bg-amber-500/10" },
  searching: { label: "SEARCHING", dotClass: "bg-amber-500 animate-pulse", pillBg: "bg-amber-500/10" },
  connected: { label: "CONNECTED", dotClass: "bg-emerald-500", pillBg: "bg-emerald-500/10" },
  rating: { label: "DISCONNECTED", dotClass: "bg-destructive", pillBg: "bg-destructive/10" },
};

const ChatHeader = memo(({ state, timer, mobileDrawerOpen, setMobileDrawerOpen, onFind, onLeave, setState, setSelectedInterests, onReportSession }: Props) => {
  const status = statusConfig[state];
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <header className="relative z-10 px-3 sm:px-6 py-2.5 sm:py-3 border-b border-border flex items-center justify-between shrink-0 bg-card">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="sm:hidden w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
          aria-label="Open menu"
        >
          <MenuIcon className="w-4.5 h-4.5" />
        </button>
        <Link to="/" className="flex items-center gap-2">
          <img src={specterMascot} alt="" className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="font-heading font-black text-xs sm:text-sm tracking-widest hidden xs:inline">
            <span className="text-gradient">SPECTER</span>
            <span className="text-foreground">CHAT</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {state === "connected" && (
          <span className="sm:hidden text-xs font-mono text-primary font-bold">{formatTime(timer)}</span>
        )}

        <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[0.6rem] sm:text-xs font-mono tracking-widest ${status.pillBg} border border-border`}>
          <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${status.dotClass}`} />
          <span className="text-muted-foreground">{status.label}</span>
        </div>

        <div className="flex gap-1.5 sm:gap-2">
          {state === "idle" && (
            <button onClick={() => { setSelectedInterests(new Set()); setState("picking"); }} className="px-2.5 sm:px-3 py-1.5 rounded text-[0.6rem] sm:text-xs font-heading font-bold tracking-wider glass-card hover:border-primary/40 transition-all flex items-center gap-1 sm:gap-1.5 text-muted-foreground hover:text-foreground active:scale-95">
              <Zap className="w-3 h-3" /> FIND
            </button>
          )}
          {state === "connected" && (
            <>
              <button onClick={() => setReportOpen(true)} className="px-2.5 sm:px-3 py-1.5 rounded text-[0.6rem] sm:text-xs font-heading font-bold tracking-wider glass-card hover:border-destructive/40 transition-all flex items-center gap-1 sm:gap-1.5 text-muted-foreground hover:text-destructive active:scale-95">
                <Flag className="w-3 h-3" /> <span className="hidden xs:inline">REPORT</span>
              </button>
              <button onClick={onLeave} className="px-2.5 sm:px-3 py-1.5 rounded text-[0.6rem] sm:text-xs font-heading font-bold tracking-wider glass-card hover:border-destructive/40 transition-all flex items-center gap-1 sm:gap-1.5 text-muted-foreground hover:text-destructive active:scale-95">
                <X className="w-3 h-3" /> <span className="hidden xs:inline">LEAVE</span>
              </button>
            </>
          )}
        </div>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center text-primary hover:text-primary-foreground hover:from-primary hover:to-primary/80 transition-all" aria-label="User menu">
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
              <User className="w-4 h-4 mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={async () => { await signOut(); navigate("/"); }} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ReportSessionDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        onSubmit={(reason) => {
          onReportSession?.(reason);
          setReportOpen(false);
        }}
      />
    </header>
  );
});

ChatHeader.displayName = "ChatHeader";
export default ChatHeader;
