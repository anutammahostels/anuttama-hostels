import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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

import { AccountStep } from '@/components/onboarding/AccountStep';
import { OrganizationStep } from '@/components/onboarding/OrganizationStep';
import { PropertyRulesStep } from '@/components/onboarding/PropertyRulesStep';
import { ReviewStep } from '@/components/onboarding/ReviewStep';

export interface OnboardingData {
  // Account details
  fullName: string;
  email: string;
  phone: string;
  password: string;
  // Organization
  organizationName: string;
  organizationType: 'hostel' | 'boarding_school' | 'college_hostel' | 'coaching' | '';
  // Property rules
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
  attendanceMarkedBy: ['warden'],
  feeCycle: 'monthly',
  paymentModes: ['upi', 'bank_transfer'],
};

const steps = [
  { id: 1, title: 'Account', icon: User },
  { id: 2, title: 'Organization', icon: Building2 },
  { id: 3, title: 'Property Rules', icon: Clock },
  { id: 4, title: 'Mess & Attendance', icon: Utensils },
  { id: 5, title: 'Review & Complete', icon: CreditCard },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // If user is already logged in, skip account step
  useEffect(() => {
    if (user && currentStep === 1) {
      setData(prev => ({
        ...prev,
        fullName: profile?.full_name || '',
        email: user.email || '',
        phone: profile?.phone || '',
      }));
      setCurrentStep(2);
    }
  }, [user, profile, currentStep]);

  const progress = (currentStep / steps.length) * 100;

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleAccountComplete = (accountData: { fullName: string; email: string; phone: string; password: string }) => {
    updateData(accountData);
    setDirection('forward');
    setCurrentStep(2);
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setDirection('forward');
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      // Don't go back to account step if user is logged in
      if (currentStep === 2 && user) return;
      setDirection('backward');
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      let userId = user?.id;

      // If no user, create account first
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

        // Update profile with phone
        await supabase
          .from('profiles')
          .update({ phone: data.phone })
          .eq('id', userId);
      }

      // 1. Create organization
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

      // 2. Create first property
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

      // 3. Save policy settings
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

      // 4. Assign tenant_admin role if not already assigned
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
      case 1: return false; // Handled by AccountStep
      case 2: return data.organizationName.trim() !== '' && data.organizationType !== '';
      case 3: return true;
      case 4: return data.attendanceMarkedBy.length > 0;
      case 5: return data.paymentModes.length > 0;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <HostyliaLogo size="md" />
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-muted-foreground hidden sm:block">
                Welcome, {profile?.full_name || 'there'}!
              </span>
            )}
            {!user && currentStep === 1 && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
                Already have an account? Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {currentStep === 1 ? 'Create Your Account' : 'Setup Your Organization'}
              </h1>
              <p className="text-muted-foreground">Step {currentStep} of {steps.length}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
              <p className="text-sm text-muted-foreground">Complete</p>
            </div>
          </div>
          
          <div className="relative">
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="flex justify-between mt-6 overflow-x-auto pb-2">
            {steps.map((step) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isComplete = currentStep > step.id;
              
              return (
                <div key={step.id} className={cn("flex flex-col items-center gap-2 transition-all duration-300 min-w-[60px]", isActive && "scale-105")}>
                  <div className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300",
                    isComplete && "bg-emerald-500 text-white",
                    isActive && "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-600/30",
                    !isActive && !isComplete && "bg-muted text-muted-foreground"
                  )}>
                    {isComplete ? <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" /> : <StepIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </div>
                  <span className={cn("text-xs font-medium hidden sm:block text-center", isActive ? "text-foreground" : "text-muted-foreground")}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 shadow-xl p-6 sm:p-8 mb-8 min-h-[400px]">
          <div key={currentStep} className={cn("animate-fade-in", direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left')}>
            {currentStep === 1 && <AccountStep onComplete={handleAccountComplete} />}
            {currentStep === 2 && <OrganizationStep data={data} updateData={updateData} />}
            {currentStep === 3 && <PropertyRulesStep data={data} updateData={updateData} section="rules" />}
            {currentStep === 4 && <PropertyRulesStep data={data} updateData={updateData} section="mess" />}
            {currentStep === 5 && <ReviewStep data={data} updateData={updateData} />}
          </div>
        </div>

        {currentStep !== 1 && (
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={prevStep} 
              disabled={currentStep === 1 || (currentStep === 2 && !!user)} 
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            
            {currentStep < steps.length ? (
              <Button onClick={nextStep} disabled={!canProceed()} className="gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500">
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting || !canProceed()} className="gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500">
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Creating Account...</>
                ) : (
                  <><Sparkles className="h-4 w-4" />Complete Setup</>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Free trial badge */}
        {currentStep === 1 && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-600 font-medium">7 Days Free Trial • No Credit Card Required</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
