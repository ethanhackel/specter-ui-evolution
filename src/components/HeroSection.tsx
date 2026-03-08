import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { Shield, Zap, Smile, Star, Ghost, Users, Activity, Globe } from "lucide-react";
import specterMascot from "@/assets/specter-mascot.png";
import { Link } from "react-router-dom";

const features = [
  { icon: Shield, label: "100% Anonymous" },
  { icon: Zap, label: "Instant Match" },
  { icon: Smile, label: "Emoji & Stickers" },
  { icon: Star, label: "Rate & Rank" },
];

const floatingDots = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  size: Math.random() * 4 + 2,
  x: Math.random() * 100,
  y: Math.random() * 100,
  delay: Math.random() * 4,
  duration: Math.random() * 4 + 4,
}));

const floatingGhosts = Array.from({ length: 4 }, (_, i) => ({
  id: i,
  x: Math.random() * 90 + 5,
  y: Math.random() * 80 + 10,
  size: Math.random() * 20 + 20,
  delay: Math.random() * 3,
  duration: Math.random() * 8 + 10,
  opacity: Math.random() * 0.08 + 0.03,
}));

const HeroSection = () => {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden pt-14 sm:pt-16">
      {/* Floating ghosts - fewer for performance */}
      {floatingGhosts.map((ghost) => (
        <motion.div
          key={ghost.id}
          className="absolute pointer-events-none gpu-accelerate"
          style={{
            left: `${ghost.x}%`,
            top: `${ghost.y}%`,
            opacity: ghost.opacity,
          }}
          animate={{
            y: [-30, 30, -30],
            x: [-20, 20, -20],
            rotate: [-5, 5, -5],
            opacity: [ghost.opacity * 0.5, ghost.opacity, ghost.opacity * 0.5],
          }}
          transition={{
            duration: ghost.duration,
            delay: ghost.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Ghost
            className="text-primary"
            style={{
              width: ghost.size,
              height: ghost.size,
              filter: `blur(${Math.random() * 2 + 1}px)`,
            }}
          />
        </motion.div>
      ))}

      {/* Floating dots */}
      {floatingDots.map((dot) => (
        <motion.div
          key={dot.id}
          className="absolute rounded-full bg-primary gpu-accelerate"
          style={{
            width: dot.size,
            height: dot.size,
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            opacity: 0.15,
          }}
          animate={{
            y: [-15, 15, -15],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: dot.duration,
            delay: dot.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(0 72% 51% / 0.06) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 text-center px-5 sm:px-6 max-w-2xl mx-auto">
        {/* Live badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-[0.65rem] sm:text-xs font-mono tracking-widest mb-5 sm:mb-6"
          style={{
            background: "hsl(145 63% 42% / 0.08)",
            border: "1px solid hsl(145 63% 42% / 0.2)",
            color: "hsl(145 63% 42%)",
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>48 ONLINE NOW</span>
        </motion.div>

        <motion.div
          className="mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <p className="text-[0.6rem] sm:text-xs tracking-[0.25em] text-muted-foreground font-mono mb-4 sm:mb-6">
            // ANONYMOUS STRANGER CHAT — v2.0
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <motion.img
            src={specterMascot}
            alt="SPECTER Ghost"
            className="w-18 h-18 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.h1
          className="font-heading text-5xl sm:text-6xl md:text-8xl font-black mb-2 sm:mb-3 tracking-tight leading-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <span className="text-gradient">SPECTER</span>
        </motion.h1>

        <motion.p
          className="font-heading text-base sm:text-lg md:text-xl text-muted-foreground tracking-[0.2em] sm:tracking-[0.3em] mb-4 sm:mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          Connect. Converse. Vanish.
        </motion.p>

        <motion.p
          className="text-xs sm:text-sm text-muted-foreground mb-8 sm:mb-10 max-w-lg mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          Instant one-on-one conversations with complete strangers. No identity. No history.
          Just raw, unfiltered human connection — then gone like a ghost.
        </motion.p>

        {/* Stats */}
        <motion.div
          className="flex items-center justify-center gap-6 sm:gap-10 mb-8 sm:mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          <div className="text-center">
            <span className="font-heading text-xl sm:text-2xl font-bold text-primary block" style={{ textShadow: "0 0 15px hsl(0 72% 51% / 0.4)" }}>
              48
            </span>
            <span className="text-[0.6rem] sm:text-xs font-mono tracking-widest text-muted-foreground">// ONLINE</span>
          </div>
          <div className="w-px h-6 sm:h-8 bg-border" />
          <div className="text-center">
            <span className="font-heading text-xl sm:text-2xl font-bold text-primary block" style={{ textShadow: "0 0 15px hsl(0 72% 51% / 0.4)" }}>
              1,247
            </span>
            <span className="text-[0.6rem] sm:text-xs font-mono tracking-widest text-muted-foreground">// TODAY</span>
          </div>
          <div className="w-px h-6 sm:h-8 bg-border" />
          <div className="text-center">
            <span className="font-heading text-xl sm:text-2xl font-bold text-primary block" style={{ textShadow: "0 0 15px hsl(0 72% 51% / 0.4)" }}>
              5,237
            </span>
            <span className="text-[0.6rem] sm:text-xs font-mono tracking-widest text-muted-foreground">// TOTAL</span>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
        >
          <Link
            to="/chat"
            className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 rounded-sm bg-primary text-primary-foreground font-heading font-bold text-xs sm:text-sm tracking-widest uppercase btn-primary-glow transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            ⚡ Start Now — Anonymous
          </Link>
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 rounded-sm glass-card font-heading font-medium text-xs sm:text-sm tracking-widest uppercase text-muted-foreground transition-all duration-300 hover:text-foreground hover:scale-105 active:scale-95 text-center"
          >
            Create Account
          </Link>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {features.map((feature) => (
            <div
              key={feature.label}
              className="glass-card px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 text-[0.65rem] sm:text-xs text-secondary-foreground"
            >
              <feature.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
              {feature.label}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;