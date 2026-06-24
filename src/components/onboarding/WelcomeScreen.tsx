import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Building2, 
  Users, 
  Shield, 
  Clock, 
  CreditCard, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { HostyliaLogo } from '@/components/brand/HostyliaLogo';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const benefits = [
  { icon: Building2, text: 'Manage multiple properties', color: 'text-blue-500 bg-blue-500/10' },
  { icon: Users, text: 'All stakeholder dashboards', color: 'text-purple-500 bg-purple-500/10' },
  { icon: Shield, text: 'Secure & compliant', color: 'text-emerald-500 bg-emerald-500/10' },
  { icon: Clock, text: 'Save 20+ hours/week', color: 'text-orange-500 bg-orange-500/10' },
  { icon: CreditCard, text: 'Automated billing', color: 'text-pink-500 bg-pink-500/10' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-center">
          <HostyliaLogo size="sm" />
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-600/30">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Welcome to Hostylia
            </h1>
            <p className="text-muted-foreground mb-6">
              Set up your property management in under 2 minutes
            </p>
          </motion.div>

          {/* Benefits */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-2 mb-8"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={item}
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${benefit.color}`}>
                  <benefit.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-foreground">{benefit.text}</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-3"
          >
            <Button
              onClick={onGetStarted}
              size="lg"
              className="w-full h-12 rounded-xl bg-[#29926A] hover:bg-[#22805C] text-white text-base font-semibold"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Sparkles className="h-3 w-3 text-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">7 Days Free Trial</span>
              </div>
              <span className="text-xs text-muted-foreground">• No credit card</span>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 flex justify-center gap-6"
          >
            {[
              { value: '500+', label: 'Properties' },
              { value: '50K+', label: 'Students' },
              { value: '4.9★', label: 'Rating' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-lg font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
