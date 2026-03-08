import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import specterMascot from "@/assets/specter-mascot.png";
import { playSendSound, playReceiveSound, playVanishSound, playConnectSound } from "@/lib/sounds";
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
import { Ghost, Zap, SkipForward, X, Send, Star, Smile, Copy, Reply, Flag, Undo2, MoreVertical, Menu as MenuIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/hooks/useChat";
import { usePresence } from "@/hooks/usePresence";

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

const stickerMap: Record<string, string> = {
  hello: stickerHello,
  laugh: stickerLaugh,
  love: stickerLove,
  cool: stickerCool,
  spooky: stickerSpooky,
  angry: stickerAngry,
  cry: stickerCry,
  shocked: stickerShocked,
  think: stickerThink,
  thumbsup: stickerThumbsup,
  sleep: stickerSleep,
  dance: stickerDance,
};

const stickers = [
  { src: stickerHello, label: "Hello", key: "hello" },
  { src: stickerLaugh, label: "Laugh", key: "laugh" },
  { src: stickerLove, label: "Love", key: "love" },
  { src: stickerCool, label: "Cool", key: "cool" },
  { src: stickerSpooky, label: "Spooky", key: "spooky" },
  { src: stickerAngry, label: "Angry", key: "angry" },
  { src: stickerCry, label: "Cry", key: "cry" },
  { src: stickerShocked, label: "Shocked", key: "shocked" },
  { src: stickerThink, label: "Think", key: "think" },
  { src: stickerThumbsup, label: "Thumbs Up", key: "thumbsup" },
  { src: stickerSleep, label: "Sleep", key: "sleep" },
  { src: stickerDance, label: "Dance", key: "dance" },
];

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

const floatingGhosts = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  x: Math.random() * 90 + 5,
  y: Math.random() * 80 + 10,
  size: Math.random() * 20 + 30,
  delay: Math.random() * 3,
  duration: Math.random() * 8 + 10,
  opacity: Math.random() * 0.08 + 0.03,
}));


const Chat = () => {
  const { user, signInAnonymously, loading: authLoading } = useAuth();
  const {
    state, setState,
    messages,
    timer,
    partnerName,
    isTyping,
    selectedInterests, setSelectedInterests,
    findMatch,
    cancelSearch,
    leaveChat,
    sendMessage,
    sendSticker: sendStickerHook,
    sendTypingIndicator,
    unsendMessage,
    reactToMessage,
    submitRating,
    reportMessage,
  } = useChat({ userId: user?.id, username: "You" });

  // Presence heartbeat
  usePresence(user?.id);

  const [input, setInput] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTab, setPickerTab] = useState<PickerTab>("emoji");
  const [emojiCategory, setEmojiCategory] = useState(0);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: string; text: string; sender: string; dbId?: string } | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [autoAuthDone, setAutoAuthDone] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto sign-in anonymously if not authenticated
  useEffect(() => {
    if (!authLoading && !user && !autoAuthDone) {
      setAutoAuthDone(true);
      signInAnonymously();
    }
  }, [authLoading, user, autoAuthDone, signInAnonymously]);

  // Preload sticker images on mount
  useEffect(() => {
    stickers.forEach((s) => {
      const img = new Image();
      img.src = s.src;
    });
  }, []);

  // Handle mobile keyboard
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const vh = window.visualViewport.height;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      }
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      handleResize();
    }
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (pickerRef.current && !pickerRef.current.contains(target)) {
        setPickerOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpenId(null);
      }
    };
    if (pickerOpen || menuOpenId !== null) {
      document.addEventListener("mousedown", handler);
      document.addEventListener("touchstart", handler, { passive: true });
    }
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [pickerOpen, menuOpenId]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleFindMatch = useCallback(() => {
    setMobileDrawerOpen(false);
    findMatch();
  }, [findMatch]);

  const handleSendMessage = useCallback(() => {
    if (!input.trim() || state !== "connected") return;
    const text = input.trim();
    setInput("");
    sendMessage(
      text,
      replyingTo ? { text: replyingTo.text, sender: replyingTo.sender } : undefined,
      replyingTo?.dbId
    );
    setReplyingTo(null);
  }, [input, state, sendMessage, replyingTo]);

  const handleSendSticker = useCallback((key: string) => {
    if (state !== "connected") return;
    setPickerOpen(false);
    sendStickerHook(key);
  }, [state, sendStickerHook]);

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

  const handleSubmitRating = () => {
    submitRating(rating);
    setRating(0);
    setHoverRating(0);
  };

  const findNext = () => {
    submitRating(0);
    setRating(0);
    setHoverRating(0);
    setSelectedInterests(new Set());
    setState("picking");
  };

  const skipRating = () => {
    submitRating(0);
    setRating(0);
    setHoverRating(0);
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setMenuOpenId(null);
  };

  const replyToMsg = (msg: typeof messages[0]) => {
    setReplyingTo({
      id: msg.id,
      text: msg.isSticker ? "🖼️ Sticker" : msg.text,
      sender: msg.type === "me" ? "You" : partnerName,
      dbId: msg.dbId,
    });
    setMenuOpenId(null);
    inputRef.current?.focus();
  };

  const handleReactToMsg = (msgId: string, emoji: string, dbId?: string) => {
    reactToMessage(msgId, emoji, dbId);
    setMenuOpenId(null);
  };

  const handleUnsendMsg = (msgId: string, dbId?: string) => {
    unsendMessage(msgId, dbId);
    setMenuOpenId(null);
  };

  const handleReportMsg = (msgId: string, dbId?: string) => {
    reportMessage(msgId, dbId);
    setMenuOpenId(null);
    alert("Message reported. Our team will review it.");
  };

  // Typing indicator on input change
  const handleInputChange = (val: string) => {
    setInput(val);
    if (val.trim()) sendTypingIndicator();
  };

  const statusConfig = {
    idle: { label: "IDLE", dotClass: "bg-muted-foreground", pillBg: "bg-muted/50" },
    picking: { label: "PICKING", dotClass: "bg-amber-500", pillBg: "bg-amber-500/10" },
    searching: { label: "SEARCHING", dotClass: "bg-amber-500 animate-pulse", pillBg: "bg-amber-500/10" },
    connected: { label: "CONNECTED", dotClass: "bg-emerald-500", pillBg: "bg-emerald-500/10" },
    rating: { label: "DISCONNECTED", dotClass: "bg-destructive", pillBg: "bg-destructive/10" },
  };

  const status = statusConfig[state];

  // Get sticker src from key
  const getStickerSrc = (key?: string) => key ? stickerMap[key] || "" : "";

  // Show loading while auth is setting up
  if (authLoading || (!user && !autoAuthDone)) {
    return (
      <div className="h-[100dvh] bg-background flex items-center justify-center">
        <div className="text-center">
          <img src={specterMascot} alt="" className="w-16 h-16 mx-auto mb-4" style={{ filter: "drop-shadow(0 0 20px hsl(0 72% 51% / 0.4))" }} />
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm mt-4 font-mono">Entering the void...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      <img src={specterMascot} alt="" width={1} height={1} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} aria-hidden="true" fetchPriority="high" />
      <img src={stickerCry} alt="" width={1} height={1} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} aria-hidden="true" fetchPriority="high" />
      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "linear-gradient(hsl(0 72% 51% / 0.02) 1px, transparent 1px), linear-gradient(90deg, hsl(0 72% 51% / 0.02) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Top Bar */}
      <div className="relative z-10 px-3 sm:px-6 py-2.5 sm:py-3 border-b border-border flex items-center justify-between shrink-0" style={{ background: "hsl(var(--card))" }}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="sm:hidden w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
          >
            <MenuIcon className="w-4.5 h-4.5" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <img src={specterMascot} alt="" className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="font-heading font-black text-xs sm:text-sm tracking-widest hidden xs:inline"><span className="text-gradient">SPECTER</span><span className="text-foreground">CHAT</span></span>
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
                <button onClick={() => leaveChat()} className="px-2.5 sm:px-3 py-1.5 rounded text-[0.6rem] sm:text-xs font-heading font-bold tracking-wider glass-card hover:border-amber-500/40 transition-all flex items-center gap-1 sm:gap-1.5 text-muted-foreground hover:text-amber-500 active:scale-95">
                  <SkipForward className="w-3 h-3" /> <span className="hidden xs:inline">SKIP</span>
                </button>
                <button onClick={() => leaveChat()} className="px-2.5 sm:px-3 py-1.5 rounded text-[0.6rem] sm:text-xs font-heading font-bold tracking-wider glass-card hover:border-destructive/40 transition-all flex items-center gap-1 sm:gap-1.5 text-muted-foreground hover:text-destructive active:scale-95">
                  <X className="w-3 h-3" /> <span className="hidden xs:inline">LEAVE</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Mobile Drawer Overlay */}
        <AnimatePresence>
          {mobileDrawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="sm:hidden fixed inset-0 z-30 bg-background/60 backdrop-blur-sm"
                onClick={() => setMobileDrawerOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="sm:hidden fixed left-0 top-0 bottom-0 z-40 w-72 border-r border-border flex flex-col py-6 overflow-y-auto"
                style={{ background: "hsl(var(--card))" }}
              >
                <div className="px-5 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={specterMascot} alt="" className="w-6 h-6" />
                    <span className="font-heading font-black text-sm tracking-widest"><span className="text-gradient">SPECTER</span><span className="text-foreground">CHAT</span></span>
                  </div>
                  <button onClick={() => setMobileDrawerOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="px-5 mb-6">
                  <p className="text-[0.6rem] font-mono tracking-[0.25em] text-muted-foreground mb-3 uppercase">Session</p>
                  <div className="bg-secondary/50 border border-border rounded-lg p-4 text-center">
                    <p className="font-heading text-3xl font-bold text-primary tracking-wider" style={{ textShadow: "0 0 15px hsl(0 72% 51% / 0.3)" }}>
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
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <div className="hidden sm:flex w-64 shrink-0 border-r border-border flex-col py-6 overflow-y-auto" style={{ background: "hsl(var(--card))" }}>
          <div className="px-5 mb-6 flex items-center gap-2">
            <img src={specterMascot} alt="" className="w-6 h-6" />
            <span className="font-heading font-black text-sm tracking-widest"><span className="text-gradient">SPECTER</span><span className="text-foreground">CHAT</span></span>
          </div>

          <div className="px-5 mb-6">
            <p className="text-[0.6rem] font-mono tracking-[0.25em] text-muted-foreground mb-3 uppercase">Session</p>
            <div className="bg-secondary/50 border border-border rounded-lg p-4 text-center">
              <p className="font-heading text-3xl font-bold text-primary tracking-wider" style={{ textShadow: "0 0 15px hsl(0 72% 51% / 0.3)" }}>
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
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Idle Overlay */}
          {state === "idle" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background gap-4 sm:gap-6 px-6 sm:px-8 text-center overflow-hidden">
              {floatingGhosts.slice(0, 3).map((ghost) => (
                <motion.div
                  key={ghost.id}
                  className="absolute pointer-events-none gpu-accelerate"
                  style={{ left: `${ghost.x}%`, top: `${ghost.y}%`, opacity: ghost.opacity }}
                  animate={{ y: [-30, 30, -30], x: [-20, 20, -20], rotate: [-5, 5, -5], opacity: [ghost.opacity * 0.5, ghost.opacity, ghost.opacity * 0.5] }}
                  transition={{ duration: ghost.duration, delay: ghost.delay, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Ghost className="text-primary" style={{ width: ghost.size, height: ghost.size, filter: `blur(${(ghost.id * 0.7 + 1.2).toFixed(1)}px)` }} />
                </motion.div>
              ))}

              <motion.img
                src={specterMascot}
                alt="SPECTERCHAT mascot"
                className="w-16 h-16 sm:w-20 sm:h-20 relative z-10"
                style={{ filter: "drop-shadow(0 0 25px hsl(0 72% 51% / 0.4))" }}
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gradient relative z-10">Enter the Void</h2>
              <p className="text-muted-foreground max-w-sm leading-relaxed relative z-10 text-sm sm:text-base">
                Click below to be matched with a random stranger. Completely anonymous. No account needed.
              </p>

              <button
                onClick={() => { setSelectedInterests(new Set()); setState("picking"); }}
                className="relative z-10 px-8 sm:px-10 py-3.5 sm:py-4 rounded-sm bg-primary text-primary-foreground font-heading font-bold text-xs sm:text-sm tracking-widest uppercase btn-primary-glow transition-all hover:scale-105 active:scale-95"
              >
                ⚡ Find a Stranger
              </button>
              <Link
                to="/register"
                className="relative z-10 px-6 sm:px-8 py-2.5 sm:py-3 rounded-sm glass-card font-heading font-medium text-[0.65rem] sm:text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-all"
              >
                Create Account for More Features
              </Link>
            </div>
          )}

          {/* Interests Picking */}
          {state === "picking" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background gap-5 sm:gap-6 px-6 sm:px-8 text-center">
              <motion.img
                src={specterMascot} alt="Specter" className="w-14 h-14 sm:w-16 sm:h-16"
                style={{ filter: "drop-shadow(0 0 20px hsl(0 72% 51% / 0.3))" }}
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}
              />
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Pick Your Interests</h2>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-xs">Select topics to match with like-minded strangers, or skip to connect with anyone.</p>
              <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                {interests.map((i) => (
                  <button
                    key={i.key}
                    onClick={() => toggleInterest(i.key)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                      selectedInterests.has(i.key)
                        ? "bg-primary/20 border border-primary/40 text-primary shadow-sm"
                        : "bg-secondary/50 border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                    }`}
                  >
                    <span className="mr-1.5">{i.emoji}</span>{i.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={handleFindMatch} className="px-8 py-3 rounded-sm bg-primary text-primary-foreground font-heading font-bold text-xs tracking-widest uppercase btn-primary-glow transition-all hover:scale-105 active:scale-95">
                  ⚡ Search Now
                </button>
                <button onClick={handleFindMatch} className="px-6 py-3 rounded-sm glass-card font-heading font-medium text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-all active:scale-95">
                  Skip →
                </button>
              </div>
            </div>
          )}

          {/* Searching */}
          {state === "searching" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background gap-5 sm:gap-6 px-6 sm:px-8 text-center">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                {[0, 1].map((i) => (
                  <div key={i} className="absolute rounded-full border-2 border-primary" style={{ inset: `${i * 14}px`, animation: `ring-anim 2s ease-out ${i * 0.5}s infinite` }} />
                ))}
                <div className="absolute inset-0 flex items-center justify-center">
                  <img src={specterMascot} alt="Specter" className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-[0_0_12px_hsl(var(--primary)/0.5)]" />
                </div>
              </div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Searching the void...</h2>
              <p className="text-muted-foreground text-xs sm:text-sm">Looking for a stranger to connect with.</p>
              {selectedInterests.size > 0 && (
                <div className="flex flex-wrap gap-1.5 justify-center max-w-xs">
                  {Array.from(selectedInterests).map((key) => {
                    const interest = interests.find((i) => i.key === key);
                    return interest ? (
                      <span key={key} className="px-2 py-1 rounded-md text-[10px] bg-primary/15 border border-primary/30 text-primary">
                        {interest.emoji} {interest.label}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
              <button onClick={cancelSearch} className="px-6 py-3 rounded-sm glass-card font-heading font-medium text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-all active:scale-95">
                ✕ Cancel
              </button>
            </div>
          )}

          {/* Rating */}
          {state === "rating" && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background gap-4 sm:gap-5 px-6 sm:px-8 text-center">
              <motion.img
                src={stickerCry} alt="Sad Specter" className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_0_15px_hsl(var(--primary)/0.4)]"
                animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Chat Ended</h2>
              <p className="text-muted-foreground text-xs sm:text-sm">Rate your conversation with {partnerName}</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(s)} className="transition-transform hover:scale-125 active:scale-110 p-1">
                    <Star className={`w-7 h-7 sm:w-8 sm:h-8 ${s <= (hoverRating || rating) ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <button onClick={handleSubmitRating} className="px-6 sm:px-8 py-3 rounded-sm bg-primary text-primary-foreground font-heading font-bold text-xs tracking-widest uppercase btn-primary-glow transition-all hover:scale-105 active:scale-95">
                  Submit & Find New
                </button>
                <button onClick={findNext} className="px-6 py-3 rounded-sm bg-emerald-600 text-primary-foreground font-heading font-bold text-xs tracking-widest uppercase transition-all hover:scale-105 active:scale-95 hover:bg-emerald-500" style={{ boxShadow: "0 0 15px hsl(150 60% 40% / 0.3)" }}>
                  ⚡ Find Next
                </button>
                <button onClick={skipRating} className="px-6 py-3 rounded-sm glass-card font-heading font-medium text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-all active:scale-95">
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 flex flex-col gap-2 sm:gap-3 overscroll-contain">
            {messages.map((msg) => (
              <div
                key={msg.id}
                id={`msg-${msg.id}`}
                className={`flex max-w-[85%] sm:max-w-[75%] gap-1.5 sm:gap-2 items-end animate-[slideIn_0.25s_ease-out] transition-all duration-300 ${
                  msg.type === "me" ? "self-end flex-row-reverse" :
                  msg.type === "system" ? "self-center max-w-[95%] sm:max-w-[90%]" :
                  "self-start"
                }`}
              >
                {msg.type === "system" ? (
                  <div className="text-[0.65rem] sm:text-xs font-mono tracking-wider text-muted-foreground text-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card">
                    {msg.text}
                  </div>
                ) : (
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
                          onClick={() => {
                            // Find the original message by dbId matching reply_to
                            const replyDbId = (msg as any).replyToDbId;
                            const originalMsg = messages.find((m) => m.dbId === replyDbId || m.id === replyDbId);
                            if (originalMsg) {
                              const el = document.getElementById(`msg-${originalMsg.id}`);
                              if (el) {
                                el.scrollIntoView({ behavior: "smooth", block: "center" });
                                el.classList.add("ring-2", "ring-primary/50");
                                setTimeout(() => el.classList.remove("ring-2", "ring-primary/50"), 1500);
                              }
                            }
                          }}
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
                          <img src={getStickerSrc(msg.stickerKey)} alt="sticker" className="w-24 h-24 sm:w-28 sm:h-28 object-contain" />
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
                        <div className={`absolute -bottom-2 ${msg.type === "me" ? "right-2" : "left-2"} bg-secondary border border-border rounded-full px-1.5 py-0.5 text-sm shadow-sm cursor-pointer hover:scale-110 active:scale-105 transition-transform`}
                          onClick={() => handleReactToMsg(msg.id, "", msg.dbId)}>
                          {msg.reaction}
                        </div>
                      )}

                      {!msg.unsent && (
                        <button
                          onClick={() => setMenuOpenId(menuOpenId === msg.id ? null : msg.id)}
                          className={`absolute top-1/2 -translate-y-1/2 ${msg.type === "me" ? "-left-7 sm:-left-8" : "-right-7 sm:-right-8"} w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-secondary/80 border border-border flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 opacity-60 transition-all hover:bg-secondary text-muted-foreground hover:text-foreground`}
                        >
                          <MoreVertical className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      )}

                      {menuOpenId === msg.id && !msg.unsent && (
                        <div
                          ref={menuRef}
                          className={`absolute z-50 ${msg.type === "me" ? "right-0" : "left-0"} top-full mt-1 w-[200px] rounded-xl border border-border shadow-xl animate-[slideIn_0.15s_ease-out] overflow-hidden`}
                          style={{ background: "hsl(var(--card))" }}
                        >
                          <div className="flex items-center gap-1 px-2 py-2 border-b border-border overflow-x-auto picker-scroll" style={{ scrollbarWidth: 'none' }}>
                            {["❤️","😂","😮","😢","😡","👍","🔥","😍","🤣","👏","🙏","💯","😭","🤔","😊","🥺","😎","🤩","😤","💀","👀","🫡","🤝","✨","🎉","💪","😈","🥰","😏","🤗"].map((emoji) => (
                              <button key={emoji} onClick={() => handleReactToMsg(msg.id, emoji, msg.dbId)} className="w-8 h-8 sm:w-7 sm:h-7 shrink-0 flex items-center justify-center text-base rounded-full hover:bg-primary/10 transition-all hover:scale-110 active:scale-95">
                                {emoji}
                              </button>
                            ))}
                          </div>

                          {!msg.isSticker && (
                            <button onClick={() => copyText(msg.text)} className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-sm text-foreground hover:bg-secondary/80 active:bg-secondary transition-colors">
                              <Copy className="w-4 h-4 text-muted-foreground" /> Copy text
                            </button>
                          )}
                          <button onClick={() => replyToMsg(msg)} className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-sm text-foreground hover:bg-secondary/80 active:bg-secondary transition-colors">
                            <Reply className="w-4 h-4 text-blue-400" /> Reply
                          </button>
                          {msg.type === "me" && (
                            <button onClick={() => handleUnsendMsg(msg.id, msg.dbId)} className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-sm text-foreground hover:bg-secondary/80 active:bg-secondary transition-colors">
                              <Undo2 className="w-4 h-4 text-amber-400" /> Unsend
                            </button>
                          )}
                          {msg.type !== "me" && (
                            <button onClick={() => handleReportMsg(msg.id, msg.dbId)} className="w-full flex items-center gap-3 px-4 py-3 sm:py-2.5 text-sm text-destructive hover:bg-secondary/80 active:bg-secondary transition-colors">
                              <Flag className="w-4 h-4" /> Report
                            </button>
                          )}
                        </div>
                      )}

                      <span className={`text-[0.55rem] sm:text-[0.6rem] font-mono text-muted-foreground mt-1 block ${msg.reaction ? "mt-3" : "mt-1"} ${msg.type === "me" ? "text-right" : ""}`}>
                        {msg.time}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 self-start px-3 sm:px-4 py-2 text-xs font-mono text-muted-foreground">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary gpu-accelerate" style={{ animation: `tdot 1.4s ${i * 0.2}s infinite` }} />
                  ))}
                </div>
                typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="shrink-0 border-t border-border relative" style={{ background: "hsl(var(--card))" }}>
            {pickerOpen && (
              <div ref={pickerRef} className="absolute bottom-full left-0 right-0 border-t border-border animate-[slideIn_0.2s_ease-out]" style={{ background: "hsl(var(--card))" }}>
                <div className="flex border-b border-border">
                  <button onClick={() => setPickerTab("emoji")} className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 text-[0.65rem] sm:text-xs font-heading font-bold tracking-wider transition-all ${pickerTab === "emoji" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
                    <Smile className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> EMOJI
                  </button>
                  <button onClick={() => setPickerTab("sticker")} className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 text-[0.65rem] sm:text-xs font-heading font-bold tracking-wider transition-all ${pickerTab === "sticker" ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
                    <img src={specterMascot} alt="" className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${pickerTab === "sticker" ? "opacity-100" : "opacity-60"}`} /> STICKERS
                  </button>
                </div>

                <div className={pickerTab === "emoji" ? "block" : "hidden"}>
                  <div className="flex gap-1 px-2 sm:px-3 py-1.5 sm:py-2 border-b border-border overflow-x-auto scrollbar-none">
                    {emojiCategories.map((cat, idx) => (
                      <button key={cat.name} onClick={() => setEmojiCategory(idx)} className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[0.6rem] sm:text-[0.65rem] font-medium whitespace-nowrap transition-all ${emojiCategory === idx ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                  <div className="h-44 sm:h-52 overflow-y-auto p-2 sm:p-3 picker-scroll overscroll-contain">
                    <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-0.5">
                      {emojiCategories[emojiCategory].emojis.map((emoji, idx) => (
                        <button key={idx} onClick={() => addEmoji(emoji)} className="w-9 h-9 sm:w-9 sm:h-9 flex items-center justify-center text-lg sm:text-xl rounded-lg hover:bg-primary/10 active:bg-primary/20 transition-colors active:scale-90">
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={pickerTab === "sticker" ? "block" : "hidden"}>
                  <div className="h-44 sm:h-52 overflow-y-auto p-3 sm:p-4 picker-scroll overscroll-contain">
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3">
                      {stickers.map((sticker) => (
                        <button key={sticker.key} onClick={() => handleSendSticker(sticker.key)} disabled={state !== "connected"} className="flex flex-col items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-xl hover:bg-primary/10 active:bg-primary/20 transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed group">
                          <img src={sticker.src} alt={sticker.label} loading="eager" decoding="async" className="w-12 h-12 sm:w-14 sm:h-14 object-contain group-hover:scale-110 transition-transform" />
                          <span className="text-[0.55rem] sm:text-[0.6rem] text-muted-foreground font-medium">{sticker.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {replyingTo && (
              <div className="px-3 sm:px-4 pt-2 sm:pt-3 pb-0 flex items-center gap-2 sm:gap-3">
                <div className="flex-1 bg-secondary/50 border-l-2 border-primary/50 rounded-r-lg px-2.5 sm:px-3 py-1.5 sm:py-2">
                  <p className="text-[0.6rem] sm:text-[0.65rem] font-semibold text-primary/70">{replyingTo.sender}</p>
                  <p className="text-[0.65rem] sm:text-xs text-muted-foreground truncate">{replyingTo.text}</p>
                </div>
                <button onClick={() => setReplyingTo(null)} className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="p-2.5 sm:p-4">
              <div className="flex gap-1.5 sm:gap-2 items-end">
                <button onClick={() => { setPickerOpen(!pickerOpen); setPickerTab("emoji"); }} className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-lg flex items-center justify-center transition-all active:scale-90 ${pickerOpen && pickerTab === "emoji" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                  <Smile className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                </button>
                <button onClick={() => { setPickerOpen(!pickerOpen); setPickerTab("sticker"); }} className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-lg flex items-center justify-center transition-all active:scale-90 ${pickerOpen && pickerTab === "sticker" ? "bg-primary/20" : "hover:bg-secondary/50"}`}>
                  <img src={specterMascot} alt="Stickers" className={`w-5 h-5 sm:w-6 sm:h-6 transition-all ${pickerOpen && pickerTab === "sticker" ? "opacity-100 scale-110" : "opacity-70 hover:opacity-100"}`} />
                </button>

                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={state !== "connected"}
                  placeholder={state === "connected" ? "Message..." : "Find a stranger to start chatting"}
                  className="flex-1 bg-secondary border border-border rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-foreground text-sm outline-none resize-none min-h-[40px] sm:min-h-[42px] max-h-[120px] transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/40 disabled:opacity-40 disabled:cursor-not-allowed"
                  rows={1}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={state !== "connected" || !input.trim()}
                  className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-lg bg-primary flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed btn-primary-glow"
                >
                  <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
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
