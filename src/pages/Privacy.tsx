import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Eye, Lock, Server, Trash2, Globe } from "lucide-react";
import specterMascot from "@/assets/specter-mascot.png";

const sections = [
  {
    icon: Eye,
    title: "Information We Collect",
    content: [
      "SPECTER is designed to collect as little information as possible. We do not require any personal information to use our platform.",
      "**Anonymous Users:** No data is collected. No IP addresses are stored. No cookies are used for tracking. Your session exists only in memory and is erased upon disconnection.",
      "**Registered Personas:** If you choose to create a persona, we store only your chosen handle, avatar preferences, and karma score. No real identity information is ever required or stored.",
      "**Technical Data:** We may temporarily process minimal technical data (such as connection timestamps) for service stability. This data is automatically purged within 24 hours and is never linked to any user identity.",
    ],
  },
  {
    icon: Lock,
    title: "How We Protect Your Data",
    content: [
      "All chat messages are encrypted in transit using industry-standard TLS encryption. Messages are processed in real-time and are never written to persistent storage.",
      "We employ end-to-end encryption for all active chat sessions. Once a session ends, all message data is permanently and irrecoverably destroyed.",
      "Our infrastructure is designed with a zero-knowledge architecture — even SPECTER's own team cannot read your messages or identify you.",
      "Regular security audits and penetration testing ensure our systems remain hardened against threats.",
    ],
  },
  {
    icon: Server,
    title: "Data Storage & Retention",
    content: [
      "**Chat Messages:** Never stored. All messages exist only in volatile memory during an active session and are permanently erased when the session ends.",
      "**Session Data:** Temporary session tokens are generated for connection management and are destroyed immediately upon disconnection.",
      "**Persona Data:** If you create a registered persona, your handle and preferences are stored securely. You can delete your persona at any time, which permanently removes all associated data.",
      "**Logs:** Minimal server logs are retained for up to 24 hours for debugging purposes only. These logs contain no user-identifiable information.",
    ],
  },
  {
    icon: Trash2,
    title: "Your Rights & Data Deletion",
    content: [
      "You have the right to use SPECTER without providing any personal information whatsoever.",
      "If you've created a registered persona, you can permanently delete it at any time. This action is irreversible and removes all associated data from our systems.",
      "Since we don't collect personal data for anonymous users, there is nothing to delete — your anonymity is maintained by design.",
      "You may contact us at any time to inquire about data practices or request information about data we may hold.",
    ],
  },
  {
    icon: Globe,
    title: "Third-Party Services",
    content: [
      "SPECTER does not sell, trade, or share any user data with third parties. Period.",
      "We do not use any third-party analytics, advertising, or tracking services.",
      "Our platform does not integrate with social media platforms or any external service that could compromise your anonymity.",
      "We do not use browser fingerprinting, tracking pixels, or any form of cross-site tracking technology.",
    ],
  },
  {
    icon: Shield,
    title: "Changes & Contact",
    content: [
      "We may update this Privacy Policy from time to time. Any changes will be reflected on this page with an updated effective date.",
      "We will never change our core commitment: SPECTER will always prioritize your privacy and anonymity above all else.",
      "If you have any questions, concerns, or requests regarding this Privacy Policy, please reach out to us through our platform's feedback system.",
      `This policy is effective as of ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`,
    ],
  },
];

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b" style={{ borderColor: 'hsl(0 0% 100% / 0.06)', background: 'hsl(0 0% 5% / 0.8)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={specterMascot} alt="SPECTER" className="w-7 h-7 sm:w-8 sm:h-8" />
            <span className="font-heading text-lg sm:text-xl font-bold tracking-tight text-gradient">SPECTER</span>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </nav>

      <div className="pt-20 sm:pt-24 pb-16">
        <motion.div className="text-center px-4 sm:px-6 mb-12 sm:mb-16" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono mb-4">
            <Shield className="w-3.5 h-3.5" /> Privacy First
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Privacy <span className="text-gradient">Policy</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Your privacy isn't just a feature — it's our foundation. SPECTER is built from the ground up to ensure you remain completely anonymous.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              className="glass-card p-6 sm:p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <section.icon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-heading font-bold text-foreground text-base sm:text-lg">{section.title}</h2>
              </div>
              <div className="space-y-3">
                {section.content.map((paragraph, j) => (
                  <p key={j} className="text-xs sm:text-sm text-muted-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-medium">$1</strong>') }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Privacy;
