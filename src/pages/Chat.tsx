import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import specterMascot from "@/assets/specter-mascot.png";
import stickerSpooky from "@/assets/stickers/spooky.png";
import stickerHello from "@/assets/stickers/hello.png";
import stickerLaugh from "@/assets/stickers/laugh.png";
import stickerLove from "@/assets/stickers/love.png";
import stickerCry from "@/assets/stickers/cry.png";
import stickerCool from "@/assets/stickers/cool.png";
import stickerAngry from "@/assets/stickers/angry.png";
import stickerSleep from "@/assets/stickers/sleep.png";
import stickerThink from "@/assets/stickers/think.png";
import stickerThumbsup from "@/assets/stickers/thumbsup.png";
import stickerShocked from "@/assets/stickers/shocked.png";
import stickerDance from "@/assets/stickers/dance.png";
import { Ghost, Zap, SkipForward, X, Send, Star, Smile } from "lucide-react";

type ChatState = "idle" | "searching" | "connected" | "rating";

type Message = {
  id: number;
  type: "me" | "them" | "system";
  text: string;
  time: string;
  isSticker?: boolean;
  stickerSrc?: string;
};

type PickerTab = "emoji" | "sticker";

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

const stickers = [
  { src: stickerHello, label: "Hello" },
  { src: stickerLaugh, label: "Laugh" },
  { src: stickerLove, label: "Love" },
  { src: stickerCool, label: "Cool" },
  { src: stickerSpooky, label: "Spooky" },
  { src: stickerAngry, label: "Angry" },
  { src: stickerCry, label: "Cry" },
  { src: stickerShocked, label: "Shocked" },
  { src: stickerThink, label: "Think" },
  { src: stickerThumbsup, label: "Thumbs Up" },
  { src: stickerSleep, label: "Sleep" },
  { src: stickerDance, label: "Dance" },
];

// Comprehensive emoji list organized by category
const emojiCategories = [
  {
    name: "Smileys",
    emojis: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","😚","😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🫡","🤐","🤨","😐","😑","😶","🫥","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🥵","🥶","🥴","😵","🤯","🤠","🥳","🥸","😎","🤓","🧐","😕","🫤","😟","🙁","😮","😯","😲","😳","🥺","🥹","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿","💀","☠️","💩","🤡","👹","👺","👻","👽","👾","🤖"]
  },
  {
    name: "Hearts",
    emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❤️‍🔥","❤️‍🩹","❣️","💕","💞","💓","💗","💖","💘","💝","💟"]
  },
  {
    name: "Hands",
    emojis: ["👋","🤚","🖐️","✋","🖖","🫱","🫲","🫳","🫴","👌","🤌","🤏","✌️","🤞","🫰","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","🫵","👍","👎","✊","👊","🤛","🤜","👏","🙌","🫶","👐","🤲","🤝","🙏"]
  },
  {
    name: "Animals",
    emojis: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐻‍❄️","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐒","🐔","🐧","🐦","🐤","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🪱","🐛","🦋","🐌","🐞","🐜","🪰","🪲","🐢","🐍","🦎","🦂","🕷️","🦀","🐙","🦑"]
  },
  {
    name: "Objects",
    emojis: ["⚡","🔥","✨","🌟","💫","🌈","☁️","🌙","🎵","🎶","🎸","🎹","🥁","🎮","🕹️","🎯","🎲","🧩","🎭","🎨","🏆","🥇","⚽","🏀","🏈","⚾","🎾","🏐","🎱","💎","👑","🎩","💍","🔮","🧿","🎪","🎠","🎡","🎢","🚀","🛸","🌍","💣","💊","🔔","📱","💻","⌨️","🖥️","📷","📺","🎬"]
  },
  {
    name: "Food",
    emojis: ["🍎","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🥑","🍆","🌶️","🫑","🥒","🥬","🥦","🧄","🧅","🍄","🌽","🥕","🥔","🍞","🥐","🥖","🧀","🍕","🍔","🍟","🌭","🍿","🧂","🥚","🍳","🥞","🧇","🥓","🥩","🍗","🍖","🌮","🌯","🫔","🥙","🧆","🥗","🍝","🍜","🍲","🍛","🍣","🍱","🥟","🍤","🍙","🍚","🍘","🍥","🥠","🥮","🍢","🍡","🍧","🍨","🍦","🥧","🧁","🍰","🎂","🍮","🍭","🍬","🍫","🍩","🍪","☕","🍵","🧋","🥤","🍶","🍺","🍻","🥂","🍷","🍸","🍹","🧃"]
  },
];

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
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState<PickerTab>("emoji");
  const [emojiCategory, setEmojiCategory] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const pickerRef = useRef<HTMLDivElement>(null);

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

  // Close picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    if (pickerOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [pickerOpen]);

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

  const skipPartner = () => leaveChat();

  const sendMessage = () => {
    if (!input.trim() || state !== "connected") return;
    const msg = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: "me", text: msg, time: now() },
    ]);
    simulateReply();
  };

  const sendSticker = (src: string) => {
    if (state !== "connected") return;
    setPickerOpen(false);
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: "me", text: "", time: now(), isSticker: true, stickerSrc: src },
    ]);
    simulateReply();
  };

  const simulateReply = () => {
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

  const addEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji);
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
          <div className="px-5 mb-6 flex items-center gap-2">
            <img src={specterMascot} alt="" className="w-6 h-6" />
            <span className="font-heading font-black text-sm tracking-widest text-gradient">SPECTER</span>
          </div>

          <div className="px-5 mb-6">
            <p className="text-[0.6rem] font-mono tracking-[0.25em] text-muted-foreground mb-3 uppercase">// Session</p>
            <div className="bg-secondary/50 border border-border rounded-lg p-4 text-center">
              <p className="font-heading text-3xl font-bold text-primary tracking-wider" style={{ textShadow: "0 0 15px hsl(0 72% 51% / 0.3)" }}>
                {formatTime(timer)}
              </p>
            </div>
          </div>

          {state === "connected" && (
            <div className="px-5 mb-6">
              <p className="text-[0.6rem] font-mono tracking-[0.25em] text-muted-foreground mb-3 uppercase">// Stranger</p>
              <div className="bg-secondary/50 border border-primary/20 rounded-lg p-4">
                <p className="font-heading text-base font-bold text-primary mb-1">{partnerName}</p>
                <p className="text-xs font-mono text-muted-foreground">Connected</p>
              </div>
            </div>
          )}

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
                      {msg.isSticker ? (
                        <div className={`p-2 rounded-xl ${
                          msg.type === "me" ? "rounded-br-sm" : "rounded-bl-sm"
                        }`}>
                          <img src={msg.stickerSrc} alt="sticker" className="w-28 h-28 object-contain" />
                        </div>
                      ) : (
                        <div className={`px-4 py-3 rounded-xl text-sm leading-relaxed ${
                          msg.type === "me"
                            ? "bg-primary/15 border border-primary/20 rounded-br-sm text-foreground"
                            : "bg-secondary border border-border rounded-bl-sm text-foreground"
                        }`}>
                          {msg.text}
                        </div>
                      )}
                      <span className={`text-[0.6rem] font-mono text-muted-foreground mt-1 block ${msg.type === "me" ? "text-right" : ""}`}>
                        {msg.time}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 self-start px-4 py-2 text-xs font-mono text-muted-foreground">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-primary"
                      style={{ animation: `tdot 1.4s ${i * 0.2}s infinite` }}
                    />
                  ))}
                </div>
                typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="shrink-0 border-t border-border relative" style={{ background: "hsl(var(--card))" }}>
            {/* Emoji / Sticker Picker */}
            {pickerOpen && (
              <div
                ref={pickerRef}
                className="absolute bottom-full left-0 right-0 border-t border-border animate-[slideIn_0.2s_ease-out]"
                style={{ background: "hsl(var(--card))" }}
              >
                {/* Tabs */}
                <div className="flex border-b border-border">
                  <button
                    onClick={() => setPickerTab("emoji")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-heading font-bold tracking-wider transition-all ${
                      pickerTab === "emoji"
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Smile className="w-4 h-4" /> EMOJI
                  </button>
                  <button
                    onClick={() => setPickerTab("sticker")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-heading font-bold tracking-wider transition-all ${
                      pickerTab === "sticker"
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <img src={specterMascot} alt="" className={`w-4 h-4 ${pickerTab === "sticker" ? "opacity-100" : "opacity-60"}`} /> STICKERS
                  </button>
                </div>

                {pickerTab === "emoji" ? (
                  <div>
                    {/* Category tabs */}
                    <div className="flex gap-1 px-3 py-2 border-b border-border overflow-x-auto scrollbar-none">
                      {emojiCategories.map((cat, idx) => (
                        <button
                          key={cat.name}
                          onClick={() => setEmojiCategory(idx)}
                          className={`px-3 py-1.5 rounded-lg text-[0.65rem] font-medium whitespace-nowrap transition-all ${
                            emojiCategory === idx
                              ? "bg-primary/20 text-primary border border-primary/30"
                              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                    {/* Emoji grid */}
                    <div className="h-52 overflow-y-auto p-3 picker-scroll">
                      <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-0.5">
                        {emojiCategories[emojiCategory].emojis.map((emoji, idx) => (
                          <button
                            key={idx}
                            onClick={() => addEmoji(emoji)}
                            className="w-9 h-9 flex items-center justify-center text-xl rounded-lg hover:bg-primary/10 transition-colors active:scale-90"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-52 overflow-y-auto p-4 picker-scroll">
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                      {stickers.map((sticker) => (
                        <button
                          key={sticker.label}
                          onClick={() => sendSticker(sticker.src)}
                          disabled={state !== "connected"}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-primary/10 transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed group"
                        >
                          <img
                            src={sticker.src}
                            alt={sticker.label}
                            className="w-14 h-14 object-contain group-hover:scale-110 transition-transform"
                          />
                          <span className="text-[0.6rem] text-muted-foreground font-medium">{sticker.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="p-4">
              <div className="flex gap-2 items-end">
                {/* Emoji button */}
                <button
                  onClick={() => { setPickerOpen(!pickerOpen); setPickerTab("emoji"); }}
                  className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center transition-all ${
                    pickerOpen && pickerTab === "emoji"
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <Smile className="w-5 h-5" />
                </button>

                {/* Sticker button */}
                <button
                  onClick={() => { setPickerOpen(!pickerOpen); setPickerTab("sticker"); }}
                  className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center transition-all ${
                    pickerOpen && pickerTab === "sticker"
                      ? "bg-primary/20"
                      : "hover:bg-secondary/50"
                  }`}
                >
                  <img src={specterMascot} alt="Stickers" className={`w-6 h-6 transition-all ${pickerOpen && pickerTab === "sticker" ? "opacity-100 scale-110" : "opacity-70 hover:opacity-100"}`} />
                </button>

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
                  placeholder={state === "connected" ? "Message..." : "Find a stranger to start chatting"}
                  className="flex-1 bg-secondary border border-border rounded-lg px-4 py-2.5 text-foreground text-sm outline-none resize-none min-h-[42px] max-h-[120px] transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/40 disabled:opacity-40 disabled:cursor-not-allowed"
                  rows={1}
                />
                <button
                  onClick={sendMessage}
                  disabled={state !== "connected" || !input.trim()}
                  className="w-10 h-10 shrink-0 rounded-lg bg-primary flex items-center justify-center transition-all hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed btn-primary-glow"
                >
                  <Send className="w-4 h-4 text-primary-foreground" />
                </button>
              </div>
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
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        .picker-scroll { scrollbar-width: thin; scrollbar-color: hsl(0 72% 51% / 0.3) transparent; }
        .picker-scroll::-webkit-scrollbar { width: 4px; }
        .picker-scroll::-webkit-scrollbar-track { background: transparent; }
        .picker-scroll::-webkit-scrollbar-thumb { background: hsl(0 72% 51% / 0.3); border-radius: 9999px; }
        .picker-scroll::-webkit-scrollbar-thumb:hover { background: hsl(0 72% 51% / 0.5); }
      `}</style>
    </div>
  );
};

export default Chat;
