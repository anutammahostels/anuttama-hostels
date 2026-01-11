import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Building2, GraduationCap, School, BookOpen, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OnboardingData } from '@/pages/Onboarding';

interface OrganizationStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

const organizationTypes = [
  { id: 'hostel' as const, title: 'Hostel/PG', icon: Building2, color: 'text-blue-500 bg-blue-500/10' },
  { id: 'boarding_school' as const, title: 'Boarding School', icon: GraduationCap, color: 'text-purple-500 bg-purple-500/10' },
  { id: 'college_hostel' as const, title: 'College Hostel', icon: School, color: 'text-emerald-500 bg-emerald-500/10' },
  { id: 'coaching' as const, title: 'Coaching', icon: BookOpen, color: 'text-orange-500 bg-orange-500/10' },
];

export function OrganizationStep({ data, updateData }: OrganizationStepProps) {
  const [showTypes, setShowTypes] = useState(data.organizationName.trim() !== '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!data.organizationName) {
      inputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    if (data.organizationName.trim() !== '' && !showTypes) {
      const timer = setTimeout(() => setShowTypes(true), 200);
      return () => clearTimeout(timer);
    }
  }, [data.organizationName, showTypes]);

  return (
    <div className="space-y-5">
      {/* Organization Name */}
      <div className="space-y-3 animate-fade-in">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground">Organization Name</h2>
          <p className="text-sm text-muted-foreground">What's your property called?</p>
        </div>
        
        <div className="max-w-sm mx-auto">
          <Input
            ref={inputRef}
            type="text"
            placeholder="e.g., Sunrise Boys Hostel"
            value={data.organizationName}
            onChange={(e) => updateData({ organizationName: e.target.value })}
            className="h-11 text-center rounded-lg border-border/50 focus:border-primary"
          />
        </div>
      </div>

      {/* Organization Type */}
      {showTypes && (
        <div className="space-y-3 animate-fade-in">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">Type of Institution</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
            {organizationTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = data.organizationType === type.id;
              
              return (
                <button
                  key={type.id}
                  onClick={() => updateData({ organizationType: type.id })}
                  className={cn(
                    "relative p-3 rounded-lg border-2 text-left transition-all group",
                    isSelected 
                      ? "border-primary bg-primary/5" 
                      : "border-border/50 hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", type.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{type.title}</span>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
