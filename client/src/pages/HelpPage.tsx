import { Redirect } from "wouter";
import { useAuth } from "@/lib/auth";
import Navigation from "@/components/Navigation";
import NavigationBreadcrumbs from "@/components/NavigationBreadcrumbs";
import BackButton from "@/components/BackButton";
import GlassCard from "@/components/GlassCard";
import { MessageCircle, BookOpen, FileText, Shield, Headphones, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const helpResources = [
  {
    icon: BookOpen,
    title: "Tutorials & Guides",
    description: "Step-by-step tutorials for all experience levels",
    link: "/tutorials",
    cta: "View Tutorials",
  },
  {
    icon: FileText,
    title: "FAQ",
    description: "Answers to common questions about trading and the platform",
    link: "/faq",
    cta: "Browse FAQs",
  },
  {
    icon: Shield,
    title: "Security Center",
    description: "Learn about our security measures and best practices",
    link: "/security",
    cta: "Security Info",
  },
  {
    icon: MessageCircle,
    title: "Ask Athena",
    description: "Get instant answers from our AI assistant",
    link: "/athena",
    cta: "Chat Now",
  },
];

const contactOptions = [
  {
    icon: Mail,
    title: "Email Support",
    description: "support@athena-invest.com",
    detail: "Response within 24 hours",
  },
  {
    icon: Headphones,
    title: "Phone Support",
    description: "1-800-ATHENA-1",
    detail: "Mon-Fri 9am-9pm ET",
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Available 24/7",
    detail: "Average wait time: 2 minutes",
  },
];

function HelpContent() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <NavigationBreadcrumbs />
      
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex justify-start mb-4">
            <BackButton />
          </div>
          <h1 className="text-6xl font-extralight text-foreground mb-4">
            Help Center
          </h1>
          <p className="text-xl text-muted-foreground font-light max-w-3xl mx-auto">
            Everything you need to know about using Athena, from getting started to advanced trading strategies
          </p>
        </div>

        {/* Quick Actions */}
        <GlassCard className="mb-12 p-8 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <h2 className="text-2xl font-light text-foreground mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 px-6 justify-start rounded-[20px] bg-white/5 hover:bg-white/10"
              asChild
            >
              <Link href="/tutorials">
                <BookOpen className="w-5 h-5 mr-3" />
                Start Tutorial
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 px-6 justify-start rounded-[20px] bg-white/5 hover:bg-white/10"
              asChild
            >
              <Link href="/dashboard">
                <MessageCircle className="w-5 h-5 mr-3" />
                Execute Trade
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 px-6 justify-start rounded-[20px] bg-white/5 hover:bg-white/10"
              asChild
            >
              <Link href="/settings">
                <Shield className="w-5 h-5 mr-3" />
                Add Funds
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 px-6 justify-start rounded-[20px] bg-white/5 hover:bg-white/10"
              asChild
            >
              <Link href="/faq">
                <FileText className="w-5 h-5 mr-3" />
                View FAQs
              </Link>
            </Button>
          </div>
        </GlassCard>

        {/* Help Resources */}
        <div className="mb-12">
          <h2 className="text-3xl font-light text-foreground mb-6">Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {helpResources.map((resource, idx) => {
              const Icon = resource.icon;
              return (
                <GlassCard key={idx} className="p-8 hover-elevate active-elevate-2 transition-all">
                  <Link href={resource.link}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-light text-foreground mb-2">
                          {resource.title}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {resource.description}
                        </p>
                        <span className="text-primary text-sm font-medium">
                          {resource.cta} →
                        </span>
                      </div>
                    </div>
                  </Link>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Contact Support */}
        <div className="mb-12">
          <h2 className="text-3xl font-light text-foreground mb-6">Contact Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactOptions.map((option, idx) => {
              const Icon = option.icon;
              return (
                <GlassCard key={idx} className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-light text-foreground mb-2">
                      {option.title}
                    </h3>
                    <p className="text-foreground font-medium mb-1">
                      {option.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {option.detail}
                    </p>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Popular Articles */}
        <GlassCard className="p-8">
          <h2 className="text-3xl font-light text-foreground mb-6">Popular Articles</h2>
          <div className="space-y-4">
            <Link href="/tutorials">
              <div className="p-4 rounded-[20px] bg-white/5 border border-white/10 hover-elevate active-elevate-2 transition-all">
                <h3 className="text-lg font-light text-foreground mb-1">
                  How to Execute Your First Trade
                </h3>
                <p className="text-sm text-muted-foreground">
                  A complete guide to placing your first order on Athena
                </p>
              </div>
            </Link>
            <Link href="/tutorials">
              <div className="p-4 rounded-[20px] bg-white/5 border border-white/10 hover-elevate active-elevate-2 transition-all">
                <h3 className="text-lg font-light text-foreground mb-1">
                  Understanding the Three Interface Modes
                </h3>
                <p className="text-sm text-muted-foreground">
                  Learn when to use Athena, Hybrid, and Terminal modes
                </p>
              </div>
            </Link>
            <Link href="/tutorials">
              <div className="p-4 rounded-[20px] bg-white/5 border border-white/10 hover-elevate active-elevate-2 transition-all">
                <h3 className="text-lg font-light text-foreground mb-1">
                  Using AI Trade Suggestions
                </h3>
                <p className="text-sm text-muted-foreground">
                  Get personalized investment recommendations from Athena
                </p>
              </div>
            </Link>
            <Link href="/faq">
              <div className="p-4 rounded-[20px] bg-white/5 border border-white/10 hover-elevate active-elevate-2 transition-all">
                <h3 className="text-lg font-light text-foreground mb-1">
                  Account Security Best Practices
                </h3>
                <p className="text-sm text-muted-foreground">
                  Protect your account with two-factor authentication and more
                </p>
              </div>
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export default function HelpPage() {
  const { user } = useAuth();
  
  if (!user) {
    return <Redirect to="/" />;
  }

  return <HelpContent />;
}
