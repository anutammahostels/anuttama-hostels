import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Building2, 
  Phone, 
  MapPin, 
  Clock, 
  Users, 
  Utensils, 
  Calendar, 
  CreditCard,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OnboardingData } from '@/pages/Onboarding';

interface ReviewStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
}

const feeCycleOptions = [
  { id: 'monthly' as const, label: 'Monthly' },
  { id: 'quarterly' as const, label: 'Quarterly' },
  { id: 'yearly' as const, label: 'Yearly' },
];

const paymentModeOptions = [
  { id: 'cash', label: 'Cash' },
  { id: 'upi', label: 'UPI' },
  { id: 'cheque', label: 'Cheque' },
  { id: 'bank_transfer', label: 'Bank Transfer' },
  { id: 'online', label: 'Online Payment' },
];

const orgTypeLabels: Record<string, string> = {
  hostel: 'Independent Hostel',
  boarding_school: 'School + Boarding',
  college_hostel: 'College Hostel',
  coaching: 'Coaching Residential',
};

export function ReviewStep({ data, updateData }: ReviewStepProps) {
  const togglePaymentMode = (modeId: string) => {
    const current = data.paymentModes;
    const updated = current.includes(modeId)
      ? current.filter(id => id !== modeId)
      : [...current, modeId];
    updateData({ paymentModes: updated });
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-600/30">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Almost There!</h2>
        <p className="text-muted-foreground">Configure fees and review your setup</p>
      </div>

      {/* Fee Configuration */}
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-indigo-500" />
          </div>
          <h3 className="font-semibold text-foreground text-lg">Fee Configuration</h3>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Fee Collection Cycle</Label>
          <div className="grid grid-cols-3 gap-3">
            {feeCycleOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => updateData({ feeCycle: option.id })}
                className={cn(
                  "p-4 rounded-xl border-2 text-center transition-all",
                  data.feeCycle === option.id
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-primary/50"
                )}
              >
                <span className="font-medium text-sm">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Accepted Payment Methods</Label>
          <div className="flex flex-wrap gap-3">
            {paymentModeOptions.map((mode) => (
              <button
                key={mode.id}
                onClick={() => togglePaymentMode(mode.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all",
                  data.paymentModes.includes(mode.id)
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-primary/50"
                )}
              >
                {data.paymentModes.includes(mode.id) && (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                )}
                <span className="font-medium text-sm">{mode.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <h3 className="font-semibold text-foreground text-lg flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          Setup Summary
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Organization */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Organization</span>
            </div>
            <p className="font-semibold text-foreground">{data.organizationName || 'Not set'}</p>
            <p className="text-sm text-muted-foreground">
              {data.organizationType ? orgTypeLabels[data.organizationType] : 'Not selected'}
            </p>
          </div>

          {/* Phone Policy */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Phone Policy</span>
            </div>
            <p className="font-semibold text-foreground capitalize">{data.phoneAllowed.replace('_', ' ')}</p>
          </div>

          {/* Outing Policy */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Outing Policy</span>
            </div>
            <p className="font-semibold text-foreground capitalize">{data.outingAllowed.replace('_', ' ')}</p>
          </div>

          {/* Curfew */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Curfew Time</span>
            </div>
            <p className="font-semibold text-foreground">{data.curfewTime}</p>
          </div>

          {/* Mess */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Utensils className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Mess Facility</span>
            </div>
            <p className="font-semibold text-foreground">
              {data.messAvailable ? (data.messMandatory ? 'Mandatory' : 'Optional') : 'Not Available'}
            </p>
          </div>

          {/* Attendance */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Attendance</span>
            </div>
            <p className="font-semibold text-foreground capitalize">{data.attendanceType.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
