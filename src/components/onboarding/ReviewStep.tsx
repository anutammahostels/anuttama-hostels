import { Label } from '@/components/ui/label';
import { Building2, Phone, MapPin, Clock, Utensils, Calendar, CreditCard, CheckCircle2, Sparkles } from 'lucide-react';
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
  { id: 'bank_transfer', label: 'Bank' },
  { id: 'online', label: 'Online' },
];

const orgTypeLabels: Record<string, string> = {
  hostel: 'Hostel/PG',
  boarding_school: 'Boarding School',
  college_hostel: 'College Hostel',
  coaching: 'Coaching',
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
    <div className="space-y-5">
      <div className="text-center">
        <div className="w-10 h-10 rounded-xl bg-[#29926A] flex items-center justify-center mx-auto mb-2 shadow-md">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Almost Done!</h2>
        <p className="text-sm text-muted-foreground">Configure fees & review</p>
      </div>

      {/* Fee Configuration */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <CreditCard className="h-3.5 w-3.5 text-indigo-500" />
          </div>
          <span className="text-sm font-medium">Fees Setup</span>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Collection Cycle</Label>
          <div className="flex gap-2">
            {feeCycleOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => updateData({ feeCycle: option.id })}
                className={cn(
                  "flex-1 py-2 px-2 rounded-lg border text-xs font-medium transition-all",
                  data.feeCycle === option.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 hover:border-primary/50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Payment Methods</Label>
          <div className="flex flex-wrap gap-1.5">
            {paymentModeOptions.map((mode) => (
              <button
                key={mode.id}
                onClick={() => togglePaymentMode(mode.id)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all",
                  data.paymentModes.includes(mode.id)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 hover:border-primary/50"
                )}
              >
                {data.paymentModes.includes(mode.id) && (
                  <CheckCircle2 className="h-3 w-3" />
                )}
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          Summary
        </div>

        <div className="grid grid-cols-2 gap-2">
          <SummaryCard icon={Building2} label="Organization" value={data.organizationName || 'Not set'} sub={orgTypeLabels[data.organizationType] || ''} />
          <SummaryCard icon={Phone} label="Phone" value={data.phoneAllowed.charAt(0).toUpperCase() + data.phoneAllowed.slice(1)} />
          <SummaryCard icon={MapPin} label="Outing" value={data.outingAllowed.charAt(0).toUpperCase() + data.outingAllowed.slice(1).replace('_', ' ')} />
          <SummaryCard icon={Clock} label="Curfew" value={data.curfewTime} />
          <SummaryCard icon={Utensils} label="Mess" value={data.messAvailable ? (data.messMandatory ? 'Mandatory' : 'Optional') : 'N/A'} />
          <SummaryCard icon={Calendar} label="Attendance" value={data.attendanceType.replace('_', ' ')} />
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        <Icon className="h-3 w-3" />
        <span className="text-[10px] font-medium uppercase">{label}</span>
      </div>
      <p className="text-sm font-medium text-foreground truncate">{value}</p>
      {sub && <p className="text-xs text-muted-foreground truncate">{sub}</p>}
    </div>
  );
}
