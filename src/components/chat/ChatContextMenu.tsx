import { memo, forwardRef } from "react";
import { Copy, Reply, Undo2, Flag } from "lucide-react";
import type { ChatMessage } from "@/hooks/useChat";

const reactionEmojis = ["❤️","😂","😮","😢","😡","👍","🔥","😍","🤣","👏","🙏","💯","😭","🤔","😊","🥺","😎","🤩","😤","💀","👀","🫡","🤝","✨","🎉","💪","😈","🥰","😏","🤗"];

type Props = {
  msg: ChatMessage;
  onReact: (msgId: string, emoji: string, dbId?: string) => void;
  onCopy: (text: string) => void;
  onReply: (msg: ChatMessage) => void;
  onUnsend: (msgId: string, dbId?: string) => void;
  onReport: (msgId: string, dbId?: string) => void;
};

const ChatContextMenu = memo(forwardRef<HTMLDivElement, Props>(({ msg, onReact, onCopy, onReply, onUnsend, onReport }, ref) => (
  <div
    ref={ref}
    className={`fixed z-[100] w-[220px] rounded-xl border border-border shadow-2xl animate-[slideIn_0.15s_ease-out] overflow-hidden`}
    style={{ background: "hsl(var(--card))" }}
  >
    <div className="flex items-center gap-1 px-2 py-2 border-b border-border overflow-x-auto scrollbar-none">
      {reactionEmojis.map((emoji) => (
        <button key={emoji} onClick={() => onReact(msg.id, emoji, msg.dbId)} className="w-8 h-8 shrink-0 flex items-center justify-center text-base rounded-full hover:bg-primary/10 transition-all hover:scale-110 active:scale-95">
          {emoji}
        </button>
      ))}
    </div>

    {!msg.isSticker && (
      <button onClick={() => onCopy(msg.text)} className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-sm text-foreground hover:bg-secondary/80 active:bg-secondary transition-colors">
        <Copy className="w-4 h-4 text-muted-foreground" /> Copy text
      </button>
    )}
    <button onClick={() => onReply(msg)} className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-sm text-foreground hover:bg-secondary/80 active:bg-secondary transition-colors">
      <Reply className="w-4 h-4 text-blue-400" /> Reply
    </button>
    {msg.type === "me" && (
      <button onClick={() => onUnsend(msg.id, msg.dbId)} className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-sm text-foreground hover:bg-secondary/80 active:bg-secondary transition-colors">
        <Undo2 className="w-4 h-4 text-amber-400" /> Unsend
      </button>
    )}
    {msg.type !== "me" && (
      <button onClick={() => onReport(msg.id, msg.dbId)} className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-sm text-destructive hover:bg-secondary/80 active:bg-secondary transition-colors">
        <Flag className="w-4 h-4" /> Report
      </button>
    )}
  </div>
)));

ChatContextMenu.displayName = "ChatContextMenu";
export default ChatContextMenu;
