import { Redirect } from "wouter";
import { useAuth } from "@/lib/auth";
import Navigation from "@/components/Navigation";
import NavigationBreadcrumbs from "@/components/NavigationBreadcrumbs";
import BackButton from "@/components/BackButton";
import GlassCard from "@/components/GlassCard";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";

const faqCategories = [
  {
    category: "Account & Getting Started",
    questions: [
      {
        q: "How do I add funds to my account?",
        a: "You can add funds through the Settings page using credit/debit cards, bank transfers (ACH), or wire transfers. Instant deposits are available with cards, while ACH transfers typically take 1-3 business days.",
      },
      {
        q: "What is the minimum deposit required?",
        a: "There is no minimum deposit required to open an account. You can start investing with any amount, though certain investments may have their own minimum requirements.",
      },
      {
        q: "How do I withdraw funds?",
        a: "Navigate to Settings → Withdraw Funds. Withdrawals are processed to your linked bank account within 1-3 business days. You must have settled funds (not pending trades) to withdraw.",
      },
      {
        q: "Is my money insured?",
        a: "Yes. Cash in your account is insured by the FDIC up to $250,000. Securities are protected by SIPC up to $500,000, including $250,000 in cash claims.",
      },
    ],
  },
  {
    category: "Trading & Orders",
    questions: [
      {
        q: "What types of orders can I place?",
        a: "Athena supports Market Orders (immediate execution at current price), Limit Orders (execution at specified price or better), Stop Orders (triggers at specified price), and Stop-Limit Orders (combines stop and limit features).",
      },
      {
        q: "When are market orders executed?",
        a: "Market orders are executed immediately during market hours (9:30 AM - 4:00 PM ET, Monday-Friday). Orders placed outside market hours are queued and executed at market open.",
      },
      {
        q: "What are trading fees?",
        a: "Athena offers commission-free trading for stocks and ETFs. Options trades are $0.65 per contract. There are no account maintenance fees or minimum balance requirements.",
      },
      {
        q: "Can I trade pre-market and after-hours?",
        a: "Yes. Extended hours trading is available from 4:00 AM - 9:30 AM ET (pre-market) and 4:00 PM - 8:00 PM ET (after-hours). Volume may be lower and spreads wider during these times.",
      },
    ],
  },
  {
    category: "Platform Features",
    questions: [
      {
        q: "What are the three interface modes?",
        a: "Athena Mode is voice-first for quick updates, Hybrid Mode combines dashboard trading with AI assistance, and Terminal Mode offers multi-panel institutional analysis. Switch between them using Cmd/Ctrl + 1/2/3.",
      },
      {
        q: "How does the AI assistance work?",
        a: "Athena uses GPT-4 to provide investment advice, answer questions, and generate trade suggestions. She has access to your portfolio context and real-time market data to provide personalized insights.",
      },
      {
        q: "What is the Adaptive Intelligence System?",
        a: "The platform analyzes your conversation patterns and suggests the optimal interface mode. Quick questions trigger Athena Mode recommendations, while deep analysis prompts suggest Terminal Mode.",
      },
      {
        q: "Can I use voice commands?",
        a: "Yes. Press the microphone button or use Space/Cmd+K to activate voice input. Ask questions, check your portfolio, or execute trades using natural language.",
      },
    ],
  },
  {
    category: "Analytics & Research",
    questions: [
      {
        q: "What analytics are available?",
        a: "Athena provides institutional-grade analytics including correlation analysis, factor exposure, market regime tracking, stress testing, and comprehensive risk metrics. Access these in Terminal Mode or the Analytics page.",
      },
      {
        q: "How do AI trade suggestions work?",
        a: "Click 'Get AI Suggestions' on the Dashboard or Trades page. The AI analyzes market conditions, your portfolio, and your risk profile to recommend trades with reasoning and confidence levels.",
      },
      {
        q: "What is correlation analysis?",
        a: "Correlation analysis shows how your holdings move in relation to each other and the broader market. This helps identify diversification opportunities and concentration risks.",
      },
      {
        q: "How often is market data updated?",
        a: "Real-time market data is updated continuously during market hours. Portfolio values refresh every 15 seconds, and charts update in real-time.",
      },
    ],
  },
  {
    category: "Security & Privacy",
    questions: [
      {
        q: "How is my data protected?",
        a: "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We use bank-level security with two-factor authentication, session monitoring, and regular security audits.",
      },
      {
        q: "Do you sell my data?",
        a: "No. We never sell your personal information or trading data to third parties. Your data is used solely to provide and improve our service.",
      },
      {
        q: "How do I enable two-factor authentication?",
        a: "Navigate to Settings → Security → Two-Factor Authentication. You can enable 2FA using an authenticator app or SMS verification.",
      },
      {
        q: "What if I suspect unauthorized access?",
        a: "Immediately change your password in Settings → Security. Contact support at security@athena-invest.com. We'll freeze your account and investigate all recent activity.",
      },
    ],
  },
  {
    category: "Payments & Taxes",
    questions: [
      {
        q: "How do I link my bank account?",
        a: "Go to Settings → Payment Methods → Link Bank Account. We use Plaid for secure bank connections. You'll verify two small deposits to confirm ownership.",
      },
      {
        q: "When will I receive tax documents?",
        a: "1099 tax forms are available by February 15th each year in Settings → Tax Documents. You'll receive 1099-DIV for dividends and 1099-B for capital gains.",
      },
      {
        q: "Are dividends automatically reinvested?",
        a: "You can choose automatic dividend reinvestment in Settings → Preferences. By default, dividends are deposited as cash to your account.",
      },
      {
        q: "What payment methods are accepted?",
        a: "We accept credit/debit cards (Visa, Mastercard, Amex), ACH bank transfers, wire transfers, and select digital wallets. Cryptocurrency deposits are not currently supported.",
      },
    ],
  },
];

function FAQContent() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = faqCategories
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.a.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <NavigationBreadcrumbs />
      
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 lg:px-16 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex justify-start mb-4">
            <BackButton to="/help" label="Back to Help" />
          </div>
          <h1 className="text-6xl font-extralight text-foreground mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground font-light max-w-3xl mx-auto">
            Find answers to common questions about Athena's platform, trading, and features
          </p>
        </div>

        {/* Search */}
        <div className="mb-12 max-w-2xl mx-auto">
          <Input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 rounded-[28px] bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground text-lg"
            data-testid="input-faq-search"
          />
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {filteredCategories.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <p className="text-muted-foreground">
                No questions found matching "{searchQuery}"
              </p>
            </GlassCard>
          ) : (
            filteredCategories.map((category, idx) => (
              <GlassCard key={idx} className="p-8">
                <h2 className="text-3xl font-light text-foreground mb-6">
                  {category.category}
                </h2>
                <Accordion type="single" collapsible className="space-y-4">
                  {category.questions.map((faq, qIdx) => (
                    <AccordionItem
                      key={qIdx}
                      value={`${idx}-${qIdx}`}
                      className="border-b border-white/10 last:border-0"
                    >
                      <AccordionTrigger
                        className="text-left py-4 hover:no-underline group"
                        data-testid={`faq-question-${idx}-${qIdx}`}
                      >
                        <span className="text-lg font-light text-foreground group-hover:text-primary transition-colors pr-4">
                          {faq.q}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <p className="text-muted-foreground leading-relaxed">
                          {faq.a}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </GlassCard>
            ))
          )}
        </div>

        {/* Contact Support */}
        <GlassCard className="mt-12 p-8 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-light text-foreground mb-3">
              Still have questions?
            </h2>
            <p className="text-muted-foreground mb-6">
              Our support team is available 24/7 to help you with any questions or issues.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@athena-invest.com"
                className="px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Email Support
              </a>
              <a
                href="/help"
                className="px-6 py-3 rounded-full bg-white/10 text-foreground hover-elevate active-elevate-2 transition-colors"
              >
                Visit Help Center
              </a>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const { user } = useAuth();
  
  if (!user) {
    return <Redirect to="/" />;
  }

  return <FAQContent />;
}
