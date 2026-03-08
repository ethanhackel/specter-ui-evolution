import { memo, useCallback } from "react";
import { MoreVertical } from "lucide-react";
import type { ChatMessage } from "@/hooks/useChat";

type Props = {
  msg: ChatMessage;
  messages: ChatMessage[];
  menuOpenId: string | null;
  getStickerSrc: (key?: string) => string;
  setMenuOpenId: (id: string | null) => void;
  handleReactToMsg: (msgId: string, emoji: string, dbId?: string) => void;
};

const ChatMessageBubble = memo(({ msg, messages, menuOpenId, getStickerSrc, setMenuOpenId, handleReactToMsg }: Props) => {
  const scrollToReply = useCallback(() => {
    const replyDbId = msg.replyToDbId;
    if (!replyDbId) return;
    const originalMsg = messages.find((m) => m.dbId === replyDbId || m.id === replyDbId);
    if (originalMsg) {
      const el = document.getElementById(`msg-${originalMsg.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-primary/50");
        setTimeout(() => el.classList.remove("ring-2", "ring-primary/50"), 1500);
      }
    }
  }, [msg.replyToDbId, messages]);

  if (msg.type === "system") {
    return (
      <div className="text-[0.65rem] sm:text-xs font-mono tracking-wider text-muted-foreground text-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card">
        {msg.text}
      </div>
    );
  }

  return (
    <>
      <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full shrink-0 flex items-center justify-center text-[0.5rem] sm:text-[0.6rem] font-heading font-bold ${
        msg.type === "me" ? "bg-primary/20 text-primary" : "bg-accent text-accent-foreground"
      }`}>
        {msg.type === "me" ? "Y" : "G"}
      </div>
      <div className="relative group">
        {msg.replyTo && !msg.unsent && (
          <div
            className={`mb-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[0.6rem] sm:text-[0.65rem] border-l-2 border-primary/40 bg-secondary/50 text-muted-foreground cursor-pointer hover:bg-secondary/70 transition-colors ${msg.type === "me" ? "text-right" : ""}`}
            onClick={scrollToReply}
          >
            <span className="font-semibold text-primary/70">{msg.replyTo.sender}</span>
            <p className="truncate max-w-[180px] sm:max-w-[200px]">{msg.replyTo.text}</p>
          </div>
        )}

        {msg.unsent ? (
          <div className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm leading-relaxed italic border border-dashed border-border/50 text-muted-foreground/50 ${msg.type === "me" ? "rounded-br-sm" : "rounded-bl-sm"}`}>
            This message was unsent
          </div>
        ) : msg.isSticker ? (
          <div className={`p-1.5 sm:p-2 rounded-xl ${msg.type === "me" ? "rounded-br-sm" : "rounded-bl-sm"}`}>
            <img src={getStickerSrc(msg.stickerKey)} alt="sticker" className="w-24 h-24 sm:w-28 sm:h-28 object-contain" loading="lazy" />
          </div>
        ) : (
          <div className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm leading-relaxed ${
            msg.type === "me"
              ? "bg-primary/15 border border-primary/20 rounded-br-sm text-foreground"
              : "bg-secondary border border-border rounded-bl-sm text-foreground"
          }`}>
            {msg.text}
          </div>
        )}

        {msg.reaction && (
          <div
            className={`absolute -bottom-2 ${msg.type === "me" ? "right-2" : "left-2"} bg-secondary border border-border rounded-full px-1.5 py-0.5 text-sm shadow-sm cursor-pointer hover:scale-110 active:scale-105 transition-transform`}
            onClick={() => handleReactToMsg(msg.id, "", msg.dbId)}
          >
            {msg.reaction}
          </div>
        )}

        {!msg.unsent && (
          <button
            onClick={() => setMenuOpenId(menuOpenId === msg.id ? null : msg.id)}
            className={`absolute top-1/2 -translate-y-1/2 ${msg.type === "me" ? "-left-7 sm:-left-8" : "-right-7 sm:-right-8"} w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-secondary/80 border border-border flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 opacity-60 transition-all hover:bg-secondary text-muted-foreground hover:text-foreground`}
            aria-label="Message options"
          >
            <MoreVertical className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        )}

        <span className={`text-[0.55rem] sm:text-[0.6rem] font-mono text-muted-foreground mt-1 block ${msg.reaction ? "mt-3" : "mt-1"} ${msg.type === "me" ? "text-right" : ""}`}>
          {msg.time}
        </span>
      </div>
    </>
  );
});

ChatMessageBubble.displayName = "ChatMessageBubble";

export default ChatMessageBubble;