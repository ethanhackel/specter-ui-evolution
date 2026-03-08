import { memo } from "react";
import specterMascot from "@/assets/specter-mascot.png";

type ChatSidebarProps = {
  timer: number;
  state: string;
  partnerName: string;
};

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const ChatSidebar = memo(({ timer, state, partnerName }: ChatSidebarProps) => (
  <>
    <div className="px-5 mb-6 flex items-center gap-2">
      <img src={specterMascot} alt="" className="w-6 h-6" />
      <span className="font-heading font-black text-sm tracking-widest">
        <span className="text-gradient">SPECTER</span>
        <span className="text-foreground">CHAT</span>
      </span>
    </div>

    <div className="px-5 mb-6">
      <p className="text-[0.6rem] font-mono tracking-[0.25em] text-muted-foreground mb-3 uppercase">Session</p>
      <div className="bg-secondary/50 border border-border rounded-lg p-4 text-center">
        <p
          className="font-heading text-3xl font-bold text-primary tracking-wider"
          style={{ textShadow: "0 0 15px hsl(0 72% 51% / 0.3)" }}
        >
          {formatTime(timer)}
        </p>
      </div>
    </div>

    {state === "connected" && (
      <div className="px-5 mb-6">
        <p className="text-[0.6rem] font-mono tracking-[0.25em] text-muted-foreground mb-3 uppercase">Stranger</p>
        <div className="bg-secondary/50 border border-primary/20 rounded-lg p-4">
          <p className="font-heading text-base font-bold text-primary mb-1">{partnerName}</p>
          <p className="text-xs font-mono text-muted-foreground">Connected</p>
        </div>
      </div>
    )}
  </>
));

ChatSidebar.displayName = "ChatSidebar";

export default ChatSidebar;
export { formatTime };