import { motion } from "framer-motion";
import { Users, MessageSquare } from "lucide-react";

const StatsBar = () => {
  return (
    <motion.div
      className="flex items-center justify-center py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
    >
      <div className="glass-card px-8 py-4 flex items-center gap-8">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-heading font-semibold text-foreground">48</span>
          <span className="text-sm text-muted-foreground">online</span>
        </div>
        <div className="w-px h-5 bg-border" />
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="font-heading font-semibold text-foreground">5,237</span>
          <span className="text-sm text-muted-foreground">chats completed</span>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsBar;
