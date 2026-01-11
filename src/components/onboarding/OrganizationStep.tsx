import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, GraduationCap, School, BookOpen, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OnboardingData } from '@/pages/Onboarding';

interface OrganizationStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

const organizationTypes = [
  {
    id: 'hostel' as const,
    title: 'Independent Hostel',
    description: 'Standalone hostel or PG accommodation',
    icon: Building2,
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'boarding_school' as const,
    title: 'School + Boarding',
    description: 'School with residential facilities',
    icon: GraduationCap,
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'college_hostel' as const,
    title: 'College Hostel',
    description: 'University or college dormitory',
    icon: School,
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    id: 'coaching' as const,
    title: 'Coaching Residential',
    description: 'Competitive exam prep with housing',
    icon: BookOpen,
    color: 'from-orange-500 to-orange-600',
  },
];

export function OrganizationStep({ data, updateData }: OrganizationStepProps) {
  const [showTypes, setShowTypes] = useState(data.organizationName.trim() !== '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!data.organizationName && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (data.organizationName.trim() !== '' && !showTypes) {
      const timer = setTimeout(() => setShowTypes(true), 300);
      return () => clearTimeout(timer);
    }
  }, [data.organizationName, showTypes]);

  return (
    <div className="space-y-8">
      {/* Organization Name */}
      <div className="space-y-4 animate-fade-in">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">What's your organization called?</h2>
          <p className="text-muted-foreground">This will be displayed across your dashboard</p>
        </div>
        
        <div className="max-w-md mx-auto">
          <Input
            ref={inputRef}
            type="text"
            placeholder="e.g., Sunrise Boys Hostel"
            value={data.organizationName}
            onChange={(e) => updateData({ organizationName: e.target.value })}
            className="h-14 text-lg text-center rounded-xl border-2 border-border/50 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Organization Type */}
      {showTypes && (
        <div className="space-y-4 animate-slide-up">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">What type of institution is it?</h2>
            <p className="text-muted-foreground">This helps us customize your experience</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {organizationTypes.map((type, index) => {
              const Icon = type.icon;
              const isSelected = data.organizationType === type.id;
              
              return (
                <button
                  key={type.id}
                  onClick={() => updateData({ organizationType: type.id })}
                  className={cn(
                    "relative p-6 rounded-2xl border-2 text-left transition-all duration-300 group animate-fade-in",
                    isSelected 
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
                      : "border-border/50 hover:border-primary/50 hover:bg-muted/50"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all",
                    isSelected 
                      ? `bg-gradient-to-r ${type.color} text-white shadow-lg` 
                      : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <h3 className="font-semibold text-foreground mb-1">{type.title}</h3>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
