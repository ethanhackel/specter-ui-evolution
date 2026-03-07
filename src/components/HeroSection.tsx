import { motion } from "framer-motion";
import { Shield, Zap, Smile, Star } from "lucide-react";
import specterMascot from "@/assets/specter-mascot.png";
import { Link } from "react-router-dom";

const features = [
  { icon: Shield, label: "100% Anonymous" },
  { icon: Zap, label: "Instant Match" },
  { icon: Smile, label: "Emoji & Stickers" },
  { icon: Star, label: "Rate & Rank" },
];

const floatingDots = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: Math.random() * 4 + 2,
  x: Math.random() * 100,
  y: Math.random() * 100,
  delay: Math.random() * 4,
  duration: Math.random() * 4 + 4,
}));

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Floating dots */}
      {floatingDots.map((dot) => (
        <motion.div
          key={dot.id}
          className="absolute rounded-full bg-primary"
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

      {/* Subtle radial glow behind mascot */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, hsl(0 72% 51% / 0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.img
            src={specterMascot}
            alt="SPECTER Ghost"
            className="w-28 h-28 mx-auto mb-8"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <motion.h1
          className="font-heading text-6xl sm:text-7xl font-bold mb-4 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <span className="text-gradient">SPECTER</span>
        </motion.h1>

        <motion.p
          className="text-lg text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Chat with Strangers. Vanish Without a Trace.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <Link
            to="/chat"
            className="px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-heading font-semibold text-base btn-primary-glow transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Start Chatting
          </Link>
          <Link
            to="/register"
            className="px-8 py-3.5 rounded-xl glass-card font-heading font-medium text-base text-foreground transition-all duration-300 hover:scale-105"
            style={{ borderColor: 'hsl(0 0% 100% / 0.12)' }}
          >
            Create Account
          </Link>
        </motion.div>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {features.map((feature) => (
            <div
              key={feature.label}
              className="glass-card px-4 py-2 flex items-center gap-2 text-sm text-secondary-foreground"
            >
              <feature.icon className="w-3.5 h-3.5 text-primary" />
              {feature.label}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
