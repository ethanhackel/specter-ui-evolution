import { motion } from "framer-motion";

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

const HowItWorks = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs tracking-[0.3em] text-primary mb-3 font-mono uppercase">
            // The Protocol
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
            How <span className="text-gradient">SPECTER</span> Works
          </h2>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-7 top-0 bottom-0 w-px"
            style={{
              background: "linear-gradient(to bottom, hsl(0 72% 51%), hsl(0 72% 51% / 0.2), transparent)",
            }}
          />

          <div className="flex flex-col gap-0">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                className="flex gap-8 py-8 items-start"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-14 h-14 rounded-full border border-primary flex items-center justify-center font-heading font-bold text-primary bg-background relative z-10 shrink-0 text-sm"
                  style={{ boxShadow: "0 0 15px hsl(0 72% 51% / 0.3)" }}
                >
                  {step.num}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-md">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
