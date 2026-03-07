import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import specterMascot from "@/assets/specter-mascot.png";
import { Ghost, Zap, SkipForward, X, AlertTriangle, Send, Star } from "lucide-react";

type ChatState = "idle" | "searching" | "connected" | "rating";

type Message = {
  id: number;
  type: "me" | "them" | "system";
  text: string;
  time: string;
};

const interests = [
  { emoji: "🎮", label: "Gaming", key: "gaming" },
  { emoji: "🎵", label: "Music", key: "music" },
  { emoji: "🎨", label: "Art", key: "art" },
  { emoji: "💻", label: "Tech", key: "tech" },
  { emoji: "🎬", label: "Films", key: "films" },
  { emoji: "✈️", label: "Travel", key: "travel" },
  { emoji: "📚", label: "Books", key: "books" },
  { emoji: "⛩️", label: "Anime", key: "anime" },
  { emoji: "⚽", label: "Sports", key: "sports" },
  { emoji: "🍜", label: "Food", key: "food" },
];

const quickEmojis = ["😂", "😭", "🔥", "❤️", "👀", "💀", "🤔", "😎", "🥺", "✨"];

const Chat = () => {
  const [state, setState] = useState<ChatState>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
  const [timer, setTimer] = useState(0);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [partnerName, setPartnerName] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (state === "connected") {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const findMatch = () => {
    setState("searching");
    setMessages([]);
    setTimer(0);
    // Simulate match after 2-3 seconds
    setTimeout(() => {
      const ghostId = Math.random().toString(36).substring(2, 6);
      setPartnerName(`Ghost#${ghostId}`);
      setState("connected");
      setMessages([
        { id: 1, type: "system", text: `Connected with Ghost#${ghostId} — say hello! 👋`, time: now() },
      ]);
    }, 2000 + Math.random() * 1500);
  };

  const cancelSearch = () => setState("idle");

  const leaveChat = () => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: "system", text: "You disconnected from the chat.", time: now() },
    ]);
    setState("rating");
  };

  const skipPartner = () => {
    leaveChat();
  };

  const sendMessage = () => {
    if (!input.trim() || state !== "connected") return;
    const msg = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: "me", text: msg, time: now() },
    ]);

    // Simulate reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replies = [
        "Haha that's interesting! 😄",
        "Tell me more about that",
        "I totally agree with you",
        "That's a cool perspective",
        "Where are you from? 🌍",
        "Nice! I was thinking the same thing",
      ];
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, type: "them", text: replies[Math.floor(Math.random() * replies.length)], time: now() },
      ]);
    }, 1000 + Math.random() * 2000);
  };

  const toggleInterest = (key: string) => {
    setSelectedInterests((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const submitRating = () => {
    setState("idle");
    setRating(0);
    setHoverRating(0);
  };

  const statusConfig = {
    idle: { label: "IDLE", dotClass: "bg-muted-foreground", pillBg: "bg-muted/50" },
    searching: { label: "SEARCHING", dotClass: "bg-amber-500 animate-pulse", pillBg: "bg-amber-500/10" },
    connected: { label: "CONNECTED", dotClass: "bg-emerald-500", pillBg: "bg-emerald-500/10" },
    rating: { label: "DISCONNECTED", dotClass: "bg-destructive", pillBg: "bg-destructive/10" },
  };

  const status = statusConfig[state];

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "linear-gradient(hsl(0 72% 51% / 0.02) 1px, transparent 1px), linear-gradient(90deg, hsl(0 72% 51% / 0.02) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Top Bar */}
      <div className="relative z-10 px-4 sm:px-6 py-3 border-b border-border flex items-center justify-between shrink-0" style={{ background: "hsl(var(--card))" }}>
        <Link to="/" className="flex items-center gap-2">
          <img src={specterMascot} alt="" className="w-6 h-6" />
          <span className="font-heading font-black text-sm tracking-widest text-gradient">SPECTER</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono tracking-widest ${status.pillBg} border border-border`}>
            <span className={`w-2 h-2 rounded-full ${status.dotClass}`} />
            <span className="text-muted-foreground">{status.label}</span>
          </div>

          <div className="flex gap-2">
            {state === "idle" && (
              <button onClick={findMatch} className="px-3 py-1.5 rounded text-xs font-heading font-bold tracking-wider glass-card hover:border-primary/40 transition-all flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                <Zap className="w-3 h-3" /> FIND
              </button>
            )}
            {state === "connected" && (
              <>
                <button onClick={skipPartner} className="px-3 py-1.5 rounded text-xs font-heading font-bold tracking-wider glass-card hover:border-amber-500/40 transition-all flex items-center gap-1.5 text-muted-foreground hover:text-amber-500">
                  <SkipForward className="w-3 h-3" /> SKIP
                </button>
                <button onClick={leaveChat} className="px-3 py-1.5 rounded text-xs font-heading font-bold tracking-wider glass-card hover:border-destructive/40 transition-all flex items-center gap-1.5 text-muted-foreground hover:text-destructive">
                  <X className="w-3 h-3" /> LEAVE
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Sidebar */}
        <div className="hidden sm:flex w-64 shrink-0 border-r border-border flex-col py-6 overflow-y-auto" style={{ background: "hsl(var(--card))" }}>
          {/* Logo Header */}
          <div className="px-5 mb-6 flex items-center gap-2">
            <img src={specterMascot} alt="" className="w-6 h-6" />
            <span className="font-heading font-black text-sm tracking-widest text-gradient">SPECTER</span>
          </div>

          {/* Session Timer */}
          <div className="px-5 mb-6">
            <p className="text-[0.6rem] font-mono tracking-[0.25em] text-muted-foreground mb-3 uppercase">// Session</p>
            <div className="bg-secondary/50 border border-border rounded-lg p-4 text-center">
              <p className="font-heading text-3xl font-bold text-primary tracking-wider" style={{ textShadow: "0 0 15px hsl(0 72% 51% / 0.3)" }}>
                {formatTime(timer)}
              </p>
            </div>
          </div>

          {/* Partner Info */}
          {state === "connected" && (
            <div className="px-5 mb-6">
              <p className="text-[0.6rem] font-mono tracking-[0.25em] text-muted-foreground mb-3 uppercase">// Stranger</p>
              <div className="bg-secondary/50 border border-primary/20 rounded-lg p-4">
                <p className="font-heading text-base font-bold text-primary mb-1">{partnerName}</p>
                <p className="text-xs font-mono text-muted-foreground">Connected</p>
              </div>
            </div>
          )}

          {/* Interests */}
          <div className="px-5 flex-1 overflow-y-auto">
            <p className="text-[0.6rem] font-mono tracking-[0.25em] text-muted-foreground mb-3 uppercase">// Interests</p>
            <div className="flex flex-wrap gap-2">
              {interests.map((i) => (
                <button
                  key={i.key}
                  onClick={() => toggleInterest(i.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedInterests.has(i.key)
                      ? "bg-primary/20 border border-primary/40 text-primary shadow-sm"
                      : "bg-secondary/50 border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                  }`}
                >
                  <span className="mr-1.5">{i.emoji}</span>
                  {i.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Idle Overlay */}
          {state === "idle" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background gap-6 px-8 text-center">
              <Ghost className="w-16 h-16 text-primary" style={{ filter: "drop-shadow(0 0 20px hsl(0 72% 51% / 0.3))" }} />
              <h2 className="font-heading text-3xl font-bold text-gradient">Enter the Void</h2>
              <p className="text-muted-foreground max-w-sm leading-relaxed">
                Click below to be matched with a random stranger. Completely anonymous. No account needed.
              </p>
              <button
                onClick={findMatch}
                className="px-10 py-4 rounded-sm bg-primary text-primary-foreground font-heading font-bold text-sm tracking-widest uppercase btn-primary-glow transition-all hover:scale-105"
              >
                ⚡ Find a Stranger
              </button>
              <Link
                to="/register"
                className="px-8 py-3 rounded-sm glass-card font-heading font-medium text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-all"
              >
                Create Account for More Features
              </Link>
            </div>
          )}

          {/* Searching Overlay */}
          {state === "searching" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background gap-6 px-8 text-center">
              <div className="relative w-24 h-24">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="absolute rounded-full border-2 border-primary"
                    style={{
                      inset: `${i * 12}px`,
                      animation: `ring-anim 2s ease-out ${i * 0.5}s infinite`,
                    }}
                  />
                ))}
                <div
                  className="absolute bg-primary rounded-full"
                  style={{
                    inset: "40px",
                    boxShadow: "0 0 20px hsl(0 72% 51% / 0.5)",
                  }}
                />
              </div>
              <h2 className="font-heading text-2xl font-bold text-foreground">Searching the void...</h2>
              <p className="text-muted-foreground text-sm">Looking for a stranger to connect with.</p>
              <button
                onClick={cancelSearch}
                className="px-6 py-3 rounded-sm glass-card font-heading font-medium text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-all"
              >
                ✕ Cancel
              </button>
            </div>
          )}

          {/* Rating Overlay */}
          {state === "rating" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background gap-5 px-8 text-center">
              <h2 className="font-heading text-2xl font-bold text-foreground">Chat Ended</h2>
              <p className="text-muted-foreground text-sm">Rate your conversation with {partnerName}</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(s)}
                    className="transition-transform hover:scale-125"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        s <= (hoverRating || rating) ? "text-amber-500 fill-amber-500" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={submitRating}
                  className="px-8 py-3 rounded-sm bg-primary text-primary-foreground font-heading font-bold text-xs tracking-widest uppercase btn-primary-glow transition-all hover:scale-105"
                >
                  Submit & Find New
                </button>
                <button
                  onClick={submitRating}
                  className="px-6 py-3 rounded-sm glass-card font-heading font-medium text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-all"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex max-w-[75%] gap-2 items-end animate-[slideIn_0.25s_ease-out] ${
                  msg.type === "me" ? "self-end flex-row-reverse" :
                  msg.type === "system" ? "self-center max-w-[90%]" :
                  "self-start"
                }`}
              >
                {msg.type === "system" ? (
                  <div className="text-xs font-mono tracking-wider text-muted-foreground text-center px-4 py-2 rounded-full glass-card">
                    {msg.text}
                  </div>
                ) : (
                  <>
                    <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[0.6rem] font-heading font-bold ${
                      msg.type === "me" ? "bg-primary/20 text-primary" : "bg-accent text-accent-foreground"
                    }`}>
                      {msg.type === "me" ? "Y" : "G"}
                    </div>
                    <div>
                      <div className={`px-4 py-3 rounded-xl text-sm leading-relaxed ${
                        msg.type === "me"
                          ? "bg-primary/15 border border-primary/20 rounded-br-sm text-foreground"
                          : "bg-secondary border border-border rounded-bl-sm text-foreground"
                      }`}>
                        {msg.text}
                      </div>
                      <span className={`text-[0.6rem] font-mono text-muted-foreground mt-1 block ${msg.type === "me" ? "text-right" : ""}`}>
                        {msg.time}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 self-start px-4 py-2 text-xs font-mono text-muted-foreground">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-primary"
                      style={{
                        animation: `tdot 1.4s ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
                typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="shrink-0 p-4 border-t border-border" style={{ background: "hsl(var(--card))" }}>
            {/* Quick emojis */}
            <div className="flex gap-1.5 mb-3 flex-wrap">
              {quickEmojis.map((e) => (
                <button
                  key={e}
                  onClick={() => setInput((prev) => prev + e)}
                  disabled={state !== "connected"}
                  className="w-8 h-8 rounded text-base hover:bg-primary/10 transition-colors disabled:opacity-30"
                >
                  {e}
                </button>
              ))}
            </div>

            <div className="flex gap-3 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={state !== "connected"}
                placeholder={state === "connected" ? "Type a message..." : "Find a stranger to start chatting"}
                className="flex-1 bg-secondary border border-border rounded-lg px-4 py-3 text-foreground text-sm outline-none resize-none min-h-[48px] max-h-[120px] transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/40 disabled:opacity-40 disabled:cursor-not-allowed"
                rows={1}
              />
              <button
                onClick={sendMessage}
                disabled={state !== "connected" || !input.trim()}
                className="w-12 h-12 shrink-0 rounded-lg bg-primary flex items-center justify-center transition-all hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed btn-primary-glow"
              >
                <Send className="w-5 h-5 text-primary-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ring-anim {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes tdot {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
          40% { transform: scale(1.2); opacity: 1; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
};

export default Chat;
