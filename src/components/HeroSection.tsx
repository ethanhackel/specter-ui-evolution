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

const AnimatedCounter = ({ target, duration = 2 }: { target: number; duration?: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => {
    if (v >= 1000) return Math.round(v).toLocaleString();
    return Math.round(v).toString();
  });

  useEffect(() => {
    const controls = animate(count, target, { duration, ease: "easeOut" });
    return controls.stop;
  }, [target, duration, count]);

  return <motion.span>{rounded}</motion.span>;
};

const stats = [
  { value: 48, label: "ONLINE", icon: Users, pulse: true },
  { value: 1247, label: "TODAY", icon: Activity, pulse: false },
  { value: 5237, label: "TOTAL", icon: Globe, pulse: false },
];

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
              filter: `blur(${(ghost.id * 0.7 + 1.2).toFixed(1)}px)`,
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative mx-auto mb-4 sm:mb-6 w-28 h-28 sm:w-28 sm:h-28 flex items-center justify-center"
        >
          {/* Ambient glow behind mascot */}
          <div
            className="absolute inset-0 rounded-full blur-2xl sm:blur-3xl opacity-40"
            style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.35) 0%, hsl(var(--primary) / 0.08) 60%, transparent 80%)" }}
          />
          <motion.img
            src={specterMascot}
            alt="SPECTERCHAT Ghost"
            className="w-24 h-24 sm:w-24 sm:h-24 relative z-10"
            style={{
              filter: "drop-shadow(0 8px 24px hsl(var(--primary) / 0.3)) drop-shadow(0 2px 8px rgba(0,0,0,0.5))",
            }}
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
          <span className="text-gradient">SPECTER</span><span className="text-foreground">CHAT</span>
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
          className="flex items-center justify-center gap-3 sm:gap-5 mb-8 sm:mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="relative group flex-1 max-w-[140px]"
              whileHover={{ scale: 1.05, y: -4 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              {/* Glow background */}
              <div
                className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
                style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.4), hsl(var(--primary) / 0.1))" }}
              />
              <div
                className="relative glass-card rounded-xl px-3 sm:px-5 py-3 sm:py-4 text-center overflow-hidden"
                style={{ borderColor: "hsl(var(--primary) / 0.15)" }}
              >
                {/* Subtle scan line effect */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(180deg, transparent 0%, hsl(var(--primary) / 0.03) 50%, transparent 100%)",
                    backgroundSize: "100% 200%",
                  }}
                  animate={{ backgroundPosition: ["0% 0%", "0% 100%", "0% 0%"] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <stat.icon className="w-3 h-3 text-primary opacity-60" />
                    {stat.pulse && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                  </div>
                  <span
                    className="font-heading text-2xl sm:text-3xl font-black text-primary block leading-none"
                    style={{ textShadow: "0 0 20px hsl(var(--primary) / 0.5), 0 0 40px hsl(var(--primary) / 0.2)" }}
                  >
                    <AnimatedCounter target={stat.value} duration={2 + i * 0.5} />
                  </span>
                  <span className="text-[0.55rem] sm:text-[0.65rem] font-mono tracking-[0.2em] text-muted-foreground mt-1 block">
                    {stat.label}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Live online indicator - pill badge */}
        <motion.div
          className="flex items-center justify-center mb-5"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div
            className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full backdrop-blur-md"
            style={{
              background: "hsl(145 63% 42% / 0.08)",
              border: "1px solid hsl(145 63% 42% / 0.2)",
              boxShadow: "0 0 20px hsl(145 63% 42% / 0.08), inset 0 1px 0 hsl(145 63% 42% / 0.1)",
            }}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50" style={{ background: "hsl(145 63% 49%)" }} />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: "hsl(145 63% 49%)", boxShadow: "0 0 6px hsl(145 63% 49% / 0.8)" }} />
            </span>
            <span className="text-[0.7rem] sm:text-xs font-medium tracking-wide" style={{ color: "hsl(145 63% 65%)" }}>
              <span className="font-bold">48</span> strangers online
            </span>
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