import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { Shield, Wifi, WifiOff } from "lucide-react";

type MessageType = "system" | "you" | "stranger" | "status";

interface ChatMessage {
  id: number;
  type: MessageType;
  text: string;
  timestamp: string;
}

interface ChatSequence {
  messages: Omit<ChatMessage, "id" | "timestamp">[];
  typingBefore?: { who: "you" | "stranger"; duration: number };
}

const getTime = (offset: number) => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + offset);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const chatFlow: (ChatSequence & { delay: number })[] = [
  { delay: 800, messages: [{ type: "system", text: "🔍 Searching for a stranger..." }] },
  { delay: 2200, messages: [{ type: "system", text: "🔗 Connected to Ghost#8a2f — session encrypted" }] },
  { delay: 1200, messages: [{ type: "status", text: "Ghost#8a2f joined the chat" }] },
  { delay: 1800, typingBefore: { who: "you", duration: 1400 }, messages: [{ type: "you", text: "Hey! Where are you from? 👋" }] },
  { delay: 2000, typingBefore: { who: "stranger", duration: 2200 }, messages: [{ type: "stranger", text: "Somewhere between nowhere and everywhere 😄" }] },
  { delay: 1500, typingBefore: { who: "you", duration: 1000 }, messages: [{ type: "you", text: "haha that's mysterious, I like it" }] },
  { delay: 1800, typingBefore: { who: "stranger", duration: 1800 }, messages: [{ type: "stranger", text: "That's the whole point of Specterchat right? 👻" }] },
  { delay: 2000, typingBefore: { who: "you", duration: 1200 }, messages: [{ type: "you", text: "True. No names, no history, just vibes" }] },
  { delay: 2200, typingBefore: { who: "stranger", duration: 1600 }, messages: [{ type: "stranger", text: "Exactly. Pure connection ✨" }] },
  { delay: 3000, messages: [{ type: "status", text: "Ghost#8a2f disconnected" }] },
  { delay: 800, messages: [{ type: "system", text: "Session ended. They vanished into the void..." }] },
  { delay: 2500, messages: [{ type: "system", text: "🔍 Searching for a new stranger..." }] },
  { delay: 2800, messages: [{ type: "system", text: "🔗 Connected to Phantom#c41d — session encrypted" }] },
  { delay: 1000, messages: [{ type: "status", text: "Phantom#c41d joined the chat" }] },
  { delay: 2000, typingBefore: { who: "stranger", duration: 1500 }, messages: [{ type: "stranger", text: "yo what's good 🤙" }] },
  { delay: 1500, typingBefore: { who: "you", duration: 900 }, messages: [{ type: "you", text: "Ayyy welcome!" }] },
];

const TypingIndicator = ({ who }: { who: "you" | "stranger" }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -5, scale: 0.95 }}
    transition={{ duration: 0.2 }}
    className={`flex items-end gap-2 ${who === "you" ? "justify-end" : "justify-start"}`}
  >
    <div
      className={`px-4 py-3 rounded-2xl max-w-fit ${
        who === "you"
          ? "bg-primary/20 rounded-br-md"
          : "bg-secondary rounded-bl-md"
      }`}
    >
      <div className="flex gap-1 items-center h-4">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
            animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

const MessageBubble = ({ msg }: { msg: ChatMessage }) => {
  if (msg.type === "system") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center my-2"
      >
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/60 border border-border text-xs text-muted-foreground">
          {msg.text.includes("encrypted") && <Shield className="w-3 h-3 text-emerald-500" />}
          {msg.text.includes("Searching") && <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>🔍</motion.span>}
          <span>{msg.text.replace(/^[🔍🔗] /, "")}</span>
        </div>
      </motion.div>
    );
  }

  if (msg.type === "status") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center my-3"
      >
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
          {msg.text.includes("joined") ? (
            <Wifi className="w-3 h-3 text-emerald-500" />
          ) : (
            <WifiOff className="w-3 h-3 text-destructive" />
          )}
          <span>{msg.text}</span>
          <span className="text-muted-foreground/30">• {msg.timestamp}</span>
        </div>
      </motion.div>
    );
  }

  const isYou = msg.type === "you";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, x: isYou ? 20 : -20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`flex items-end gap-2 ${isYou ? "justify-end" : "justify-start"}`}
    >
      {!isYou && (
        <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs shrink-0 border border-border">
          👻
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        <div
          className={`px-4 py-2.5 rounded-2xl max-w-[280px] text-sm leading-relaxed ${
            isYou
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-secondary text-foreground rounded-bl-md border border-border"
          }`}
        >
          {msg.text}
        </div>
        <span className={`text-[10px] text-muted-foreground/40 ${isYou ? "text-right mr-1" : "ml-1"}`}>
          {msg.timestamp}
        </span>
      </div>
      {isYou && (
        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs shrink-0 border border-primary/30">
          🫣
        </div>
      )}
    </motion.div>
  );
};

const TerminalDemo = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState<{ who: "you" | "stranger" } | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const msgId = useRef(0);
  const hasStarted = useRef(false);
  const cancelledRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  const runSequence = useCallback(async () => {
    let timeOffset = 0;
    for (const step of chatFlow) {
      await new Promise((r) => setTimeout(r, step.delay));
      timeOffset++;

      // Update online status
      const lastMsg = step.messages[step.messages.length - 1];
      if (lastMsg.text.includes("Connected to") || lastMsg.text.includes("joined")) {
        setIsOnline(true);
      }
      if (lastMsg.text.includes("disconnected") || lastMsg.text.includes("ended")) {
        setIsOnline(false);
      }

      if (step.typingBefore) {
        setTyping({ who: step.typingBefore.who });
        await new Promise((r) => setTimeout(r, step.typingBefore!.duration));
        setTyping(null);
      }

      const newMsgs = step.messages.map((m) => ({
        ...m,
        id: ++msgId.current,
        timestamp: getTime(timeOffset),
      }));
      setMessages((prev) => [...prev, ...newMsgs]);
    }

    // Loop: reset after pause
    await new Promise((r) => setTimeout(r, 4000));
    setMessages([]);
    setIsOnline(false);
    setTyping(null);
    msgId.current = 0;
    await new Promise((r) => setTimeout(r, 1000));
    runSequence();
  }, []);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          runSequence();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    const el = document.getElementById("terminal-demo");
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, [runSequence]);

  return (
    <div id="terminal-demo" className="max-w-2xl mx-auto px-6 mb-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Section heading */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold font-['Space_Grotesk'] mb-3">
            See It In <span className="text-gradient">Action</span>
          </h2>
          <p className="text-muted-foreground text-sm">A real-time preview of a Specterchat conversation</p>
        </div>

        {/* Chat window */}
        <div
          className="glass-card overflow-hidden"
          style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 60px hsl(0 72% 51% / 0.08)" }}
        >
          {/* Header bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-secondary/40">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-sm border border-border">
                  👻
                </div>
                <motion.div
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
                    isOnline ? "bg-emerald-500" : "bg-muted-foreground/40"
                  }`}
                  animate={isOnline ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">Anonymous Stranger</div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-500/70" />
                  End-to-end encrypted
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors cursor-pointer" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-colors cursor-pointer" />
              <div className="w-3 h-3 rounded-full bg-destructive/80 hover:bg-destructive transition-colors cursor-pointer" />
            </div>
          </div>

          {/* Messages area */}
          <div
            ref={scrollRef}
            className="p-5 space-y-3 h-[380px] overflow-y-auto scrollbar-thin"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "hsl(0 0% 20%) transparent",
            }}
          >
            <AnimatePresence mode="popLayout">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {typing && <TypingIndicator who={typing.who} />}
            </AnimatePresence>

            {messages.length === 0 && !typing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-muted-foreground/40"
              >
                <motion.span
                  className="text-4xl mb-3"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  👻
                </motion.span>
                <span className="text-xs">Waiting to connect...</span>
              </motion.div>
            )}
          </div>

          {/* Input bar (decorative) */}
          <div className="px-4 py-3 border-t border-border bg-secondary/20">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-secondary/60 rounded-xl px-4 py-2.5 text-sm text-muted-foreground/40 border border-border">
                Type a message...
              </div>
              <motion.div
                className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.05, backgroundColor: "hsl(0 72% 51% / 0.3)" }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TerminalDemo;
