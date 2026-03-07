import { motion } from "framer-motion";
import { Eye, Globe, Lock, Sparkles, MessageCircle, Trophy } from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "Stay Invisible",
    description: "No personal data collected. Chat freely knowing your identity is completely protected.",
  },
  {
    icon: Globe,
    title: "Global Matching",
    description: "Connect with strangers from around the world instantly. No waiting, no queues.",
  },
  {
    icon: Lock,
    title: "End-to-End Privacy",
    description: "Your conversations are never stored. Once you leave, everything vanishes.",
  },
  {
    icon: Sparkles,
    title: "Rich Expressions",
    description: "Express yourself with emojis, stickers, and reactions to make chats more fun.",
  },
  {
    icon: MessageCircle,
    title: "Smart Conversations",
    description: "Interest-based matching helps you find people you'll actually enjoy talking to.",
  },
  {
    icon: Trophy,
    title: "Community Rankings",
    description: "Rate your chat partners and climb the leaderboard as a top conversationalist.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4 text-foreground">
            Why <span className="text-gradient">SPECTER</span>?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Built for those who value privacy and genuine connections.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="glass-card-hover p-6 group cursor-default"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
