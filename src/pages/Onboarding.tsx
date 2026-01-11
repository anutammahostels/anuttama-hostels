import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useProperties } from '@/hooks/useProperties';
import { usePolicySettings } from '@/hooks/usePolicySettings';
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
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { HostyliaLogo } from '@/components/brand/HostyliaLogo';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

import { OrganizationStep } from '@/components/onboarding/OrganizationStep';
import { PropertyRulesStep } from '@/components/onboarding/PropertyRulesStep';
import { ReviewStep } from '@/components/onboarding/ReviewStep';

export interface OnboardingData {
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
  { id: 1, title: 'Organization', icon: Building2 },
  { id: 2, title: 'Property Rules', icon: Clock },
  { id: 3, title: 'Mess & Attendance', icon: Utensils },
  { id: 4, title: 'Fees & Review', icon: CreditCard },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const progress = (currentStep / steps.length) * 100;

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setDirection('forward');
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection('backward');
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // 1. Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: data.organizationName,
          type: data.organizationType,
          owner_id: user.id,
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
          owner_id: user.id,
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
        .eq('user_id', user.id)
        .single();

      if (!existingRole) {
        await supabase
          .from('user_roles')
          .insert({ user_id: user.id, role: 'tenant_admin' });
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
      case 1: return data.organizationName.trim() !== '' && data.organizationType !== '';
      case 2: return true;
      case 3: return data.attendanceMarkedBy.length > 0;
      case 4: return data.paymentModes.length > 0;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <HostyliaLogo size="md" />
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Welcome, {profile?.full_name || 'there'}!
            </span>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              Skip for now
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Setup Your Organization</h1>
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
          
          <div className="flex justify-between mt-6">
            {steps.map((step) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isComplete = currentStep > step.id;
              
              return (
                <div key={step.id} className={cn("flex flex-col items-center gap-2 transition-all duration-300", isActive && "scale-105")}>
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                    isComplete && "bg-emerald-500 text-white",
                    isActive && "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-600/30",
                    !isActive && !isComplete && "bg-muted text-muted-foreground"
                  )}>
                    {isComplete ? <CheckCircle2 className="h-6 w-6" /> : <StepIcon className="h-5 w-5" />}
                  </div>
                  <span className={cn("text-xs font-medium hidden sm:block", isActive ? "text-foreground" : "text-muted-foreground")}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border/50 shadow-xl p-6 sm:p-8 mb-8 min-h-[400px]">
          <div key={currentStep} className={cn("animate-fade-in", direction === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left')}>
            {currentStep === 1 && <OrganizationStep data={data} updateData={updateData} />}
            {currentStep === 2 && <PropertyRulesStep data={data} updateData={updateData} section="rules" />}
            {currentStep === 3 && <PropertyRulesStep data={data} updateData={updateData} section="mess" />}
            {currentStep === 4 && <ReviewStep data={data} updateData={updateData} />}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="gap-2">
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
                <><Loader2 className="h-4 w-4 animate-spin" />Setting up...</>
              ) : (
                <><Sparkles className="h-4 w-4" />Complete Setup</>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
