import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Ghost, Zap, MessageSquare, LogOut, Shield, Wifi, WifiOff } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import specterMascot from "@/assets/specter-mascot.png";

// Terminal demo types
type MessageType = "system" | "you" | "stranger" | "status";
interface ChatMessage { id: number; type: MessageType; text: string; timestamp: string; }

const getTime = (offset: number) => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + offset);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const chatFlow = [
  { delay: 800, messages: [{ type: "system" as const, text: "🔍 Searching for a stranger..." }] },
  { delay: 2200, messages: [{ type: "system" as const, text: "🔗 Connected to Ghost#8a2f — session encrypted" }] },
  { delay: 1200, messages: [{ type: "status" as const, text: "Ghost#8a2f joined the chat" }] },
  { delay: 1800, typingBefore: { who: "you" as const, duration: 1400 }, messages: [{ type: "you" as const, text: "Hey! Where are you from? 👋" }] },
  { delay: 2000, typingBefore: { who: "stranger" as const, duration: 2200 }, messages: [{ type: "stranger" as const, text: "Somewhere between nowhere and everywhere 😄" }] },
  { delay: 1500, typingBefore: { who: "you" as const, duration: 1000 }, messages: [{ type: "you" as const, text: "haha that's mysterious, I like it" }] },
  { delay: 1800, typingBefore: { who: "stranger" as const, duration: 1800 }, messages: [{ type: "stranger" as const, text: "That's the whole point of Specterchat right? 👻" }] },
  { delay: 2000, typingBefore: { who: "you" as const, duration: 1200 }, messages: [{ type: "you" as const, text: "True. No names, no history, just vibes" }] },
  { delay: 2200, typingBefore: { who: "stranger" as const, duration: 1600 }, messages: [{ type: "stranger" as const, text: "Exactly. Pure connection ✨" }] },
  { delay: 3000, messages: [{ type: "status" as const, text: "Ghost#8a2f disconnected" }] },
  { delay: 800, messages: [{ type: "system" as const, text: "Session ended. They vanished into the void..." }] },
];

const TypingIndicator = ({ who }: { who: "you" | "stranger" }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -5 }}
    className={`flex items-end gap-2 ${who === "you" ? "justify-end" : "justify-start"}`}
  >
    <div className={`px-4 py-3 rounded-2xl max-w-fit ${who === "you" ? "bg-primary/20 rounded-br-md" : "bg-secondary rounded-bl-md"}`}>
      <div className="flex gap-1 items-center h-4">
        {[0, 1, 2].map((i) => (
          <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
            animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
        ))}
      </div>
    </div>
  </motion.div>
);

const MessageBubble = ({ msg }: { msg: ChatMessage }) => {
  if (msg.type === "system") {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center my-2">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/60 border border-border text-xs text-muted-foreground">
          {msg.text.includes("encrypted") && <Shield className="w-3 h-3 text-emerald-500" />}
          <span>{msg.text.replace(/^[🔍🔗] /, "")}</span>
        </div>
      </motion.div>
    );
  }
  if (msg.type === "status") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center my-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
          {msg.text.includes("joined") ? <Wifi className="w-3 h-3 text-emerald-500" /> : <WifiOff className="w-3 h-3 text-destructive" />}
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
      {!isYou && <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs shrink-0 border border-border">👻</div>}
      <div className="flex flex-col gap-0.5">
        <div className={`px-4 py-2.5 rounded-2xl max-w-[280px] text-sm leading-relaxed ${isYou ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary text-foreground rounded-bl-md border border-border"}`}>
          {msg.text}
        </div>
        <span className={`text-[10px] text-muted-foreground/40 ${isYou ? "text-right mr-1" : "ml-1"}`}>{msg.timestamp}</span>
      </div>
      {isYou && <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs shrink-0 border border-primary/30">🫣</div>}
    </motion.div>
  );
};

const LiveDemo = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState<{ who: "you" | "stranger" } | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const msgId = useRef(0);
  const hasStarted = useRef(false);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, typing, scrollToBottom]);

  const runSequence = useCallback(async () => {
    let timeOffset = 0;
    for (const step of chatFlow) {
      await new Promise(r => setTimeout(r, step.delay));
      timeOffset++;
      const lastMsg = step.messages[step.messages.length - 1];
      if (lastMsg.text.includes("Connected") || lastMsg.text.includes("joined")) setIsOnline(true);
      if (lastMsg.text.includes("disconnected") || lastMsg.text.includes("ended")) setIsOnline(false);
      if (step.typingBefore) {
        setTyping({ who: step.typingBefore.who });
        await new Promise(r => setTimeout(r, step.typingBefore.duration));
        setTyping(null);
      }
      const newMsgs = step.messages.map(m => ({ ...m, id: ++msgId.current, timestamp: getTime(timeOffset) }));
      setMessages(prev => [...prev, ...newMsgs]);
    }
    await new Promise(r => setTimeout(r, 4000));
    setMessages([]); setIsOnline(false); setTyping(null); msgId.current = 0;
    await new Promise(r => setTimeout(r, 1000));
    runSequence();
  }, []);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    runSequence();
  }, [runSequence]);

  return (
    <div className="glass-card overflow-hidden" style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 60px hsl(0 72% 51% / 0.08)" }}>
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-border bg-secondary/40">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-secondary flex items-center justify-center text-sm border border-border">👻</div>
            <motion.div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${isOnline ? "bg-emerald-500" : "bg-muted-foreground/40"}`}
              animate={isOnline ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 2, repeat: Infinity }} />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">Anonymous Stranger</div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-500/70" /> End-to-end encrypted
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-destructive/80" />
        </div>
      </div>
      <div ref={scrollRef} className="p-4 sm:p-5 space-y-3 h-[320px] sm:h-[380px] overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "hsl(0 0% 20%) transparent" }}>
        <AnimatePresence mode="popLayout">
          {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
        </AnimatePresence>
        <AnimatePresence>{typing && <TypingIndicator who={typing.who} />}</AnimatePresence>
        {messages.length === 0 && !typing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-muted-foreground/40">
            <motion.span className="text-4xl mb-3" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>👻</motion.span>
            <span className="text-xs">Waiting to connect...</span>
          </motion.div>
        )}
      </div>
      <div className="px-4 py-3 border-t border-border bg-secondary/20">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-secondary/60 rounded-xl px-4 py-2.5 text-sm text-muted-foreground/40 border border-border">Type a message...</div>
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

const steps = [
  { icon: Ghost, title: "Enter the Void", desc: 'Click "Start Now" — no login needed. You\'re immediately assigned an anonymous ghost identity. No signup, no email, no phone number required.', detail: "Your session is completely ephemeral. Once you close the tab, all traces vanish." },
  { icon: Zap, title: "Instant Matching", desc: "Our server matches you with a stranger in the queue in real-time. The entire process takes under 2 seconds.", detail: "Interest-based matching is available for registered personas to find like-minded strangers." },
  { icon: MessageSquare, title: "Converse Freely", desc: "Chat in a private, encrypted room. Type messages, send emojis, react with stickers. See live typing indicators.", detail: "Every message is encrypted in transit. No conversation data is ever stored on our servers." },
  { icon: LogOut, title: "Vanish at Will", desc: "Disconnect at any moment. Rate the conversation, find a new stranger, or simply close the tab.", detail: "No trace remains. Your chat partner becomes a ghost, and so do you. Pure anonymity." },
];

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b" style={{ borderColor: 'hsl(0 0% 100% / 0.06)', background: 'hsl(0 0% 5% / 0.8)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={specterMascot} alt="SPECTERCHAT" className="w-7 h-7 sm:w-8 sm:h-8" />
            <span className="font-heading text-lg sm:text-xl font-bold tracking-tight"><span className="text-gradient">SPECTER</span><span className="text-foreground">CHAT</span></span>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </nav>

      <div className="pt-20 sm:pt-24 pb-16">
        {/* Hero */}
        <motion.div className="text-center px-4 sm:px-6 mb-16 sm:mb-20" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="text-[0.65rem] sm:text-xs tracking-[0.3em] text-primary mb-3 font-mono uppercase">// The Protocol</p>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            How <span className="text-gradient">SPECTERCHAT</span> Works
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            From entering the void to vanishing without a trace — here's the complete SPECTERCHAT experience, explained step by step.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-20 sm:mb-28">
          <div className="relative">
            <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-px" style={{ background: "linear-gradient(to bottom, hsl(0 72% 51%), hsl(0 72% 51% / 0.2), transparent)" }} />
            <div className="flex flex-col gap-2">
              {steps.map((step, i) => (
                <motion.div
                  key={step.title}
                  className="flex gap-5 sm:gap-8 py-6 sm:py-8 items-start"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-primary flex items-center justify-center bg-background relative z-10 shrink-0"
                    style={{ boxShadow: "0 0 20px hsl(0 72% 51% / 0.3)" }}>
                    <step.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-foreground mb-2 text-base sm:text-lg">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-2">{step.desc}</p>
                    <p className="text-xs text-muted-foreground/60 leading-relaxed italic">{step.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Demo */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 mb-16 sm:mb-24">
          <motion.div className="text-center mb-8" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading mb-3">
              See It In <span className="text-gradient">Action</span>
            </h2>
            <p className="text-muted-foreground text-sm">A real-time preview of a SPECTERCHAT conversation</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <LiveDemo />
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div className="text-center px-4" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Link to="/chat" className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-medium rounded-xl bg-primary text-primary-foreground btn-primary-glow transition-all duration-300 hover:scale-105">
            <Ghost className="w-4 h-4" /> Try It Yourself
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
