import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Scale, UserX, AlertTriangle, Gavel, Ban } from "lucide-react";
import specterMascot from "@/assets/specter-mascot.png";

const sections = [
  {
    icon: FileText,
    title: "Acceptance of Terms",
    content: [
      "By accessing or using SPECTERCHAT, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the platform.",
      "These terms apply to all users of the platform, including anonymous users and registered personas.",
      "We reserve the right to update these terms at any time. Continued use of SPECTERCHAT after changes constitutes acceptance of the modified terms.",
    ],
  },
  {
    icon: Scale,
    title: "Use of the Platform",
    content: [
      "SPECTERCHAT is an anonymous chat platform designed for genuine human connection. You agree to use it respectfully and lawfully.",
      "You must be at least 18 years of age to use SPECTERCHAT. We do not knowingly provide services to minors.",
      "You may use SPECTERCHAT without creating an account (anonymous mode) or by creating a registered persona. Both modes are subject to these terms.",
      "You are responsible for maintaining the confidentiality of your persona credentials if you choose to register.",
    ],
  },
  {
    icon: UserX,
    title: "Prohibited Conduct",
    content: [
      "**Harassment & Abuse:** Any form of harassment, bullying, threats, or abusive behavior toward other users is strictly prohibited.",
      "**Illegal Content:** Sharing, distributing, or soliciting illegal content of any kind, including but not limited to child exploitation material, is grounds for immediate and permanent ban.",
      "**Spam & Solicitation:** Using SPECTERCHAT for commercial solicitation, advertising, spam, or phishing is prohibited.",
      "**Impersonation:** Attempting to impersonate SPECTERCHAT staff, moderators, or other users in a misleading way is not allowed.",
      "**System Abuse:** Attempting to exploit, hack, reverse-engineer, or disrupt SPECTERCHAT's systems, infrastructure, or other users' experiences is strictly prohibited.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Content & Communication",
    content: [
      "All conversations on SPECTERCHAT are ephemeral and are not stored. However, this does not exempt you from legal responsibility for the content of your messages.",
      "You retain responsibility for everything you communicate through the platform. SPECTERCHAT is not liable for user-generated content.",
      "Other users may report conversations that violate these terms. Reported content may be temporarily retained for review by our moderation team.",
      "We reserve the right to implement automated content filtering to detect and prevent prohibited content.",
    ],
  },
  {
    icon: Ban,
    title: "Enforcement & Termination",
    content: [
      "SPECTERCHAT reserves the right to ban, restrict, or terminate access for any user who violates these terms, at our sole discretion.",
      "Bans may be implemented based on session identifiers, persona accounts, or behavioral patterns. Repeat offenders face permanent removal.",
      "We employ a karma-based system where users rate conversations. Consistently low-rated users may face reduced matching priority or temporary restrictions.",
      "You may discontinue using SPECTERCHAT at any time. If you have a registered persona, you can delete it permanently through the platform settings.",
    ],
  },
  {
    icon: Gavel,
    title: "Disclaimers & Liability",
    content: [
      "SPECTERCHAT is provided \"as is\" without warranties of any kind, express or implied. We do not guarantee uninterrupted service or error-free operation.",
      "We are not responsible for the behavior, statements, or actions of other users on the platform. Interactions with strangers carry inherent risks.",
      "To the maximum extent permitted by law, SPECTERCHAT shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.",
      "These terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through binding arbitration.",
      `These terms are effective as of ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`,
    ],
  },
];

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
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
        <motion.div className="text-center px-4 sm:px-6 mb-12 sm:mb-16" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono mb-4">
            <Gavel className="w-3.5 h-3.5" /> Legal
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Terms of <span className="text-gradient">Service</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Please read these terms carefully before using SPECTERCHAT. By using our platform, you agree to abide by these guidelines.
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

export default Terms;
