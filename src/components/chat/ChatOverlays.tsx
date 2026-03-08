import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Ghost, Star, Zap, Search } from "lucide-react";
import { Link } from "react-router-dom";
import specterMascot from "@/assets/specter-mascot.png";
import stickerCry from "@/assets/stickers/cry.png";
import type { ChatState } from "@/hooks/useChat";

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

const floatingGhosts = Array.from({ length: 3 }, (_, i) => ({
  id: i,
  x: Math.random() * 90 + 5,
  y: Math.random() * 80 + 10,
  size: Math.random() * 20 + 30,
  delay: Math.random() * 3,
  duration: Math.random() * 8 + 10,
  opacity: Math.random() * 0.08 + 0.03,
}));

// --- Idle ---
export const IdleOverlay = memo(({ setState, setSelectedInterests }: {
  setState: (s: ChatState) => void;
  setSelectedInterests: (s: Set<string>) => void;
}) => (
  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background gap-4 sm:gap-6 px-6 sm:px-8 text-center overflow-hidden">
    {floatingGhosts.map((ghost) => (
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
    <motion.img src={specterMascot} alt="SPECTERCHAT mascot" className="w-16 h-16 sm:w-20 sm:h-20 relative z-10" style={{ filter: "drop-shadow(0 0 25px hsl(0 72% 51% / 0.4))" }} animate={{ y: [-6, 6, -6] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-gradient relative z-10">Enter the Void</h2>
    <p className="text-muted-foreground max-w-sm leading-relaxed relative z-10 text-sm sm:text-base">Click below to be matched with a random stranger. Completely anonymous. No account needed.</p>
    <button onClick={() => { setSelectedInterests(new Set()); setState("picking"); }} className="relative z-10 px-8 sm:px-10 py-3.5 sm:py-4 rounded-sm bg-primary text-primary-foreground font-heading font-bold text-xs sm:text-sm tracking-widest uppercase btn-primary-glow transition-all hover:scale-105 active:scale-95 flex items-center gap-2"><Zap className="w-4 h-4" /> Find a Stranger</button>
    <Link to="/register" className="relative z-10 px-6 sm:px-8 py-2.5 sm:py-3 rounded-sm glass-card font-heading font-medium text-[0.65rem] sm:text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-all">Create Account for More Features</Link>
  </div>
));
IdleOverlay.displayName = "IdleOverlay";

// --- Picking ---
export const PickingOverlay = memo(({ selectedInterests, toggleInterest, onSearch }: {
  selectedInterests: Set<string>;
  toggleInterest: (key: string) => void;
  onSearch: () => void;
}) => (
  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background gap-5 sm:gap-6 px-6 sm:px-8 text-center">
    <motion.img src={specterMascot} alt="Specter" className="w-14 h-14 sm:w-16 sm:h-16" style={{ filter: "drop-shadow(0 0 20px hsl(0 72% 51% / 0.3))" }} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }} />
    <h2 className="font-heading text-xl sm:text-2xl font-bold text-foreground">Pick Your Interests</h2>
    <p className="text-muted-foreground text-xs sm:text-sm max-w-xs">Select topics to match with like-minded strangers, or skip to connect with anyone.</p>
    <div className="flex flex-wrap gap-2 justify-center max-w-sm">
      {interests.map((i) => (
        <button key={i.key} onClick={() => toggleInterest(i.key)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 ${selectedInterests.has(i.key) ? "bg-primary/20 border border-primary/40 text-primary shadow-sm" : "bg-secondary/50 border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"}`}>
          <span className="mr-1.5">{i.emoji}</span>{i.label}
        </button>
      ))}
    </div>
    <div className="flex gap-3">
      <button onClick={onSearch} className="px-8 py-3 rounded-sm bg-primary text-primary-foreground font-heading font-bold text-xs tracking-widest uppercase btn-primary-glow transition-all hover:scale-105 active:scale-95">⚡ Search Now</button>
      <button onClick={onSearch} className="px-6 py-3 rounded-sm glass-card font-heading font-medium text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-all active:scale-95">Skip →</button>
    </div>
  </div>
));
PickingOverlay.displayName = "PickingOverlay";

// --- Searching ---
export const SearchingOverlay = memo(({ selectedInterests, onCancel }: {
  selectedInterests: Set<string>;
  onCancel: () => void;
}) => (
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
            <span key={key} className="px-2 py-1 rounded-md text-[10px] bg-primary/15 border border-primary/30 text-primary">{interest.emoji} {interest.label}</span>
          ) : null;
        })}
      </div>
    )}
    <button onClick={onCancel} className="px-6 py-3 rounded-sm glass-card font-heading font-medium text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-all active:scale-95">✕ Cancel</button>
  </div>
));
SearchingOverlay.displayName = "SearchingOverlay";

// --- Rating ---
export const RatingOverlay = memo(({ partnerName, rating, hoverRating, setRating, setHoverRating, onSubmit, onFindNext, onSkip }: {
  partnerName: string;
  rating: number;
  hoverRating: number;
  setRating: (r: number) => void;
  setHoverRating: (r: number) => void;
  onSubmit: () => void;
  onFindNext: () => void;
  onSkip: () => void;
}) => (
  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background gap-4 sm:gap-5 px-6 sm:px-8 text-center">
    <motion.img src={stickerCry} alt="Sad Specter" className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_0_15px_hsl(var(--primary)/0.4)]" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
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
      <button onClick={onSubmit} className="px-6 sm:px-8 py-3 rounded-sm bg-primary text-primary-foreground font-heading font-bold text-xs tracking-widest uppercase btn-primary-glow transition-all hover:scale-105 active:scale-95">Submit & Find New</button>
      <button onClick={onFindNext} className="px-6 py-3 rounded-sm bg-emerald-600 text-primary-foreground font-heading font-bold text-xs tracking-widest uppercase transition-all hover:scale-105 active:scale-95 hover:bg-emerald-500" style={{ boxShadow: "0 0 15px hsl(150 60% 40% / 0.3)" }}>⚡ Find Next</button>
      <button onClick={onSkip} className="px-6 py-3 rounded-sm glass-card font-heading font-medium text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-all active:scale-95">Skip</button>
    </div>
  </div>
));
RatingOverlay.displayName = "RatingOverlay";
