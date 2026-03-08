import { motion } from "framer-motion";
import { Ghost, Zap, Drama, MessageCircle, Star, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Ghost,
    title: "Zero Identity Mode",
    description: "No account required. No email. No phone. Connect instantly as a ghost — your IP is never stored, your chat history is never saved.",
    badge: "CORE",
  },
  {
    icon: Zap,
    title: "Instant Matching",
    description: "Our real-time queue pairs you with a stranger in under 2 seconds. Interest-based matching available for registered users.",
    badge: "CORE",
  },
  {
    icon: Drama,
    title: "Persona System",
    description: "Create a reusable persona with a custom handle and avatar color — without ever revealing who you really are.",
    badge: "NEW",
  },
  {
    icon: MessageCircle,
    title: "Rich Messaging",
    description: "Full emoji support, live typing indicators, and message reactions. Conversations feel alive, not robotic.",
  },
  {
    icon: Star,
    title: "Karma & Ratings",
    description: "Rate each conversation and build your karma score. Top-rated users unlock priority matching and exclusive features.",
  },
  {
    icon: ShieldCheck,
    title: "Report & Safety",
    description: "One-click reporting with 24h admin review. Repeat offenders are auto-banned. Real people moderate the platform.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6" id="features">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-10 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[0.65rem] sm:text-xs tracking-[0.3em] text-primary mb-2 sm:mb-3 font-mono uppercase">
            // What Makes Us Different
          </p>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            Built for <span className="text-gradient">real</span> connection.
            <br />
            Engineered for <span className="text-gradient">privacy</span>.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="glass-card-hover p-5 sm:p-7 group cursor-default relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              {feature.badge && (
                <span className="absolute top-3 sm:top-4 right-3 sm:right-4 text-[0.55rem] sm:text-[0.6rem] font-mono tracking-widest px-2 py-0.5 rounded-sm bg-primary/10 text-primary border border-primary/20">
                  {feature.badge}
                </span>
              )}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-accent flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-foreground mb-1.5 sm:mb-2 text-sm sm:text-base">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;