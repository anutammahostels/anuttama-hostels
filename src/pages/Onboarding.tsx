import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  ArrowLeft, 
  Building2, 
  Clock,
  Utensils,
  CreditCard,
  CheckCircle2,
  Loader2,
  Sparkles,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { HostyliaLogo } from '@/components/brand/HostyliaLogo';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

import { WelcomeScreen } from '@/components/onboarding/WelcomeScreen';
import { AccountStep } from '@/components/onboarding/AccountStep';
import { OrganizationStep } from '@/components/onboarding/OrganizationStep';
import { PropertyRulesStep } from '@/components/onboarding/PropertyRulesStep';
import { ReviewStep } from '@/components/onboarding/ReviewStep';

export interface OnboardingData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  organizationName: string;
  organizationType: 'hostel' | 'boarding_school' | 'college_hostel' | 'coaching' | '';
  phoneAllowed: 'no' | 'limited' | 'yes';
  outingAllowed: 'no' | 'permission' | 'weekends' | 'anytime';
  curfewTime: string;
  parentVisits: boolean;
  visitorsAllowed: boolean;
  messAvailable: boolean;
  messMandatory: boolean;
  externalFood: boolean;
  attendanceType: 'daily' | 'floor_wise' | 'block_wise';
  attendanceMarkedBy: string[];
  feeCycle: 'monthly' | 'quarterly' | 'yearly';
  paymentModes: string[];
}

const initialData: OnboardingData = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  organizationName: '',
  organizationType: '',
  phoneAllowed: 'limited',
  outingAllowed: 'permission',
  curfewTime: '22:00',
  parentVisits: true,
  visitorsAllowed: true,
  messAvailable: true,
  messMandatory: true,
  externalFood: false,
  attendanceType: 'daily',
  attendanceMarkedBy: ['property_manager'],
  feeCycle: 'monthly',
  paymentModes: ['upi', 'bank_transfer'],
};

const steps = [
  { id: 1, title: 'Account', icon: User },
  { id: 2, title: 'Organization', icon: Building2 },
  { id: 3, title: 'Rules', icon: Clock },
  { id: 4, title: 'Mess', icon: Utensils },
  { id: 5, title: 'Review', icon: CreditCard },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
};

export default function Onboarding() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState(1);
  
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setShowWelcome(false);
      if (currentStep === 1) {
        setData(prev => ({
          ...prev,
          fullName: profile?.full_name || '',
          email: user.email || '',
          phone: profile?.phone || '',
        }));
        setCurrentStep(2);
      }
    }
  }, [user, profile, currentStep]);

  const progress = (currentStep / steps.length) * 100;

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleAccountComplete = (accountData: { fullName: string; email: string; phone: string; password: string }) => {
    updateData(accountData);
    setDirection(1);
    setCurrentStep(2);
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      if (currentStep === 2 && user) return;
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      let userId = user?.id;

      if (!userId) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
              phone: data.phone,
            },
          },
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('Failed to create account');

        userId = authData.user.id;

        await supabase
          .from('profiles')
          .update({ phone: data.phone })
          .eq('id', userId);
      }

      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: data.organizationName,
          type: data.organizationType,
          owner_id: userId,
          settings: {},
        })
        .select()
        .single();
      
      if (orgError) throw orgError;

      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .insert({
          name: data.organizationName,
          owner_id: userId,
          organization_id: orgData.id,
          status: 'active',
        })
        .select()
        .single();
      
      if (propertyError) throw propertyError;

      const policies = [
        { setting_key: 'phone_policy', setting_value: { allowed: data.phoneAllowed } },
        { setting_key: 'outing_policy', setting_value: { allowed: data.outingAllowed } },
        { setting_key: 'curfew', setting_value: { time: data.curfewTime } },
        { setting_key: 'visitors', setting_value: { parentVisits: data.parentVisits, visitorsAllowed: data.visitorsAllowed } },
        { setting_key: 'mess', setting_value: { available: data.messAvailable, mandatory: data.messMandatory, externalFood: data.externalFood } },
        { setting_key: 'attendance', setting_value: { type: data.attendanceType, markedBy: data.attendanceMarkedBy } },
        { setting_key: 'fees', setting_value: { cycle: data.feeCycle, paymentModes: data.paymentModes } },
      ];

      const { error: policyError } = await supabase
        .from('policy_settings')
        .insert(policies.map(p => ({
          property_id: propertyData.id,
          setting_key: p.setting_key,
          setting_value: p.setting_value,
        })));

      if (policyError) throw policyError;

      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (!existingRole) {
        await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'tenant_admin' });
      }

      toast({
        title: 'Setup Complete! 🎉',
        description: 'Your organization has been configured successfully.',
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete setup. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return false;
      case 2: return data.organizationName.trim() !== '' && data.organizationType !== '';
      case 3: return true;
      case 4: return data.attendanceMarkedBy.length > 0;
      case 5: return data.paymentModes.length > 0;
      default: return true;
    }
  };

  // Show welcome screen first
  if (showWelcome && !user) {
    return <WelcomeScreen onGetStarted={() => setShowWelcome(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#29926A]">
      {/* Compact Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <HostyliaLogo size="sm" />
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-xs text-muted-foreground hidden sm:block">
                {profile?.full_name}
              </span>
            )}
            {!user && currentStep === 1 && (
              <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 sm:py-6 max-w-2xl">
        {/* Compact Progress Section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          {/* Step indicator pills */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              const isComplete = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <motion.div 
                    initial={false}
                    animate={{ 
                      scale: isActive ? 1.05 : 1,
                      backgroundColor: isComplete ? 'rgb(16 185 129)' : isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted))'
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors",
                      isComplete && "text-white",
                      isActive && "text-primary-foreground",
                      !isActive && !isComplete && "text-muted-foreground"
                    )}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <step.icon className="h-3 w-3" />
                    )}
                    <span className="hidden sm:inline">{step.title}</span>
                    <span className="sm:hidden">{step.id}</span>
                  </motion.div>
                  {index < steps.length - 1 && (
                    <motion.div 
                      initial={false}
                      animate={{ 
                        backgroundColor: currentStep > step.id ? 'rgb(16 185 129)' : 'hsl(var(--muted))'
                      }}
                      className="w-4 h-0.5 mx-1"
                    />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Progress bar */}
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-[#29926A]"
            />
          </div>
        </motion.div>

        {/* Main Content Card */}
        <div className="bg-card rounded-xl border border-border/50 shadow-lg p-4 sm:p-6 mb-4 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {currentStep === 1 && <AccountStep onComplete={handleAccountComplete} />}
              {currentStep === 2 && <OrganizationStep data={data} updateData={updateData} />}
              {currentStep === 3 && <PropertyRulesStep data={data} updateData={updateData} section="rules" />}
              {currentStep === 4 && <PropertyRulesStep data={data} updateData={updateData} section="mess" />}
              {currentStep === 5 && <ReviewStep data={data} updateData={updateData} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {currentStep !== 1 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between"
          >
            <Button 
              variant="ghost" 
              size="sm"
              onClick={prevStep} 
              disabled={currentStep === 1 || (currentStep === 2 && !!user)} 
              className="gap-1.5 h-9"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
            
            {currentStep < steps.length ? (
              <Button 
                size="sm"
                onClick={nextStep} 
                disabled={!canProceed()} 
                className="gap-1.5 h-9 bg-[#29926A] hover:from-emerald-500 hover:to-green-500"
              >
                Continue
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button 
                size="sm"
                onClick={handleSubmit} 
                disabled={isSubmitting || !canProceed()} 
                className="gap-1.5 h-9 bg-[#29926A] hover:from-emerald-500 hover:to-green-500"
              >
                {isSubmitting ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" />Creating...</>
                ) : (
                  <><Sparkles className="h-3.5 w-3.5" />Complete</>
                )}
              </Button>
            )}
          </motion.div>
        )}

        {/* Free trial badge */}
        {currentStep === 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Sparkles className="h-3 w-3 text-emerald-500" />
              <span className="text-xs text-emerald-600 font-medium">7 Days Free Trial</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
