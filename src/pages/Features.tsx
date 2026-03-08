import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Ghost, Zap, Drama, MessageCircle, Star, ShieldCheck, ArrowLeft, Sparkles, Lock, Users, Eye, Fingerprint, Globe } from "lucide-react";
import specterMascot from "@/assets/specter-mascot.png";

const coreFeatures = [
  {
    icon: Ghost,
    title: "Zero Identity Mode",
    description: "No account required. No email. No phone number. Connect instantly as a ghost — your IP is never stored, your chat history is never saved. Total anonymity from the first click.",
    badge: "CORE",
    gradient: "from-primary/20 to-primary/5",
  },
  {
    icon: Zap,
    title: "Instant Matching",
    description: "Our real-time queue pairs you with a stranger in under 2 seconds. Interest-based matching is available for registered users to find like-minded people.",
    badge: "CORE",
    gradient: "from-amber-500/20 to-amber-500/5",
  },
  {
    icon: Drama,
    title: "Persona System",
    description: "Create a reusable persona with a custom handle and avatar color — without ever revealing who you really are. Express yourself freely behind a mask.",
    badge: "NEW",
    gradient: "from-violet-500/20 to-violet-500/5",
  },
  {
    icon: MessageCircle,
    title: "Rich Messaging",
    description: "Full emoji support, live typing indicators, and message reactions. Conversations feel alive with stickers, GIFs, and expressive tools that make chatting fun.",
    gradient: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    icon: Star,
    title: "Karma & Ratings",
    description: "Rate each conversation and build your karma score. Top-rated users unlock priority matching, exclusive badges, and access to premium features.",
    gradient: "from-yellow-500/20 to-yellow-500/5",
  },
  {
    icon: ShieldCheck,
    title: "Report & Safety",
    description: "One-click reporting with 24-hour admin review. Repeat offenders are auto-banned. Real people moderate the platform to keep it safe for everyone.",
    gradient: "from-blue-500/20 to-blue-500/5",
  },
];

const additionalFeatures = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "Every message is encrypted in transit. No one — not even SPECTERCHAT — can read your conversations.",
  },
  {
    icon: Eye,
    title: "No Data Retention",
    description: "Messages are never stored on our servers. Once a session ends, the conversation is permanently erased.",
  },
  {
    icon: Fingerprint,
    title: "No Fingerprinting",
    description: "We don't use browser fingerprinting, cookies, or any tracking mechanism to identify returning users.",
  },
  {
    icon: Users,
    title: "Interest Tags",
    description: "Add interest tags to get matched with people who share your passions — music, gaming, tech, and more.",
  },
  {
    icon: Sparkles,
    title: "Sticker Reactions",
    description: "Express yourself with a curated collection of ghost-themed stickers and emoji reactions during chats.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Connect with strangers from anywhere in the world. Language filters coming soon for better conversations.",
  },
];

const steps = [
  {
    num: "01",
    title: "Enter the Void",
    desc: 'Click "Start Now" — no login needed. You\'re immediately assigned an anonymous ghost identity for the session.',
  },
  {
    num: "02",
    title: "Instant Matching",
    desc: "Our server matches you with a stranger in the queue in real-time. Mutual interests are factored in if set.",
  },
  {
    num: "03",
    title: "Converse Freely",
    desc: "Chat in a private room. Type, send emojis, react. See live typing indicators from your partner.",
  },
  {
    num: "04",
    title: "Vanish at Will",
    desc: "Disconnect at any moment. Rate the conversation, find a new stranger, or close the tab. No trace remains.",
  },
];

const Features = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
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
        <motion.div
          className="text-center px-4 sm:px-6 mb-16 sm:mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[0.65rem] sm:text-xs tracking-[0.3em] text-primary mb-3 font-mono uppercase">// Full Feature Set</p>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Everything <span className="text-gradient">SPECTERCHAT</span> Offers
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Built for real connection, engineered for absolute privacy. Explore every feature that makes SPECTER the most private chat platform on the internet.
          </p>
        </motion.div>

        {/* Core Features */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-20 sm:mb-28">
          <motion.h2
            className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-8 sm:mb-10 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Core <span className="text-gradient">Features</span>
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {coreFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="glass-card-hover p-6 sm:p-8 group relative overflow-hidden"
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                {feature.badge && (
                  <span className="absolute top-4 right-4 text-[0.55rem] font-mono tracking-widest px-2 py-0.5 rounded-sm bg-primary/10 text-primary border border-primary/20 z-10">
                    {feature.badge}
                  </span>
                )}
                <div className="relative z-10">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-accent flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-foreground mb-2 text-base sm:text-lg">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Additional Features */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-20 sm:mb-28">
          <motion.h2
            className="font-heading text-xl sm:text-2xl font-bold text-foreground mb-8 sm:mb-10 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Security & <span className="text-gradient">Privacy</span>
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {additionalFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="glass-card p-5 sm:p-6 flex gap-4 items-start"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-foreground mb-1 text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-16 sm:mb-24">
          <motion.div
            className="text-center mb-10 sm:mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[0.65rem] sm:text-xs tracking-[0.3em] text-primary mb-2 font-mono uppercase">// The Protocol</p>
            <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              How <span className="text-gradient">SPECTER</span> Works
            </h2>
          </motion.div>

          <div className="relative">
            <div className="absolute left-5 sm:left-7 top-0 bottom-0 w-px" style={{ background: "linear-gradient(to bottom, hsl(0 72% 51%), hsl(0 72% 51% / 0.2), transparent)" }} />
            <div className="flex flex-col gap-0">
              {steps.map((step, i) => (
                <motion.div
                  key={step.num}
                  className="flex gap-5 sm:gap-8 py-6 sm:py-8 items-start"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border border-primary flex items-center justify-center font-heading font-bold text-primary bg-background relative z-10 shrink-0 text-xs sm:text-sm"
                    style={{ boxShadow: "0 0 15px hsl(0 72% 51% / 0.3)" }}
                  >
                    {step.num}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-foreground mb-1.5 sm:mb-2 text-sm sm:text-base">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          className="text-center px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-medium rounded-xl bg-primary text-primary-foreground btn-primary-glow transition-all duration-300 hover:scale-105"
          >
            <Ghost className="w-4 h-4" />
            Start Chatting Now
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Features;
