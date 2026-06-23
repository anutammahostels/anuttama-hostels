import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Phone, MapPin, Clock, Users, Utensils, ShoppingBag, Calendar, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OnboardingData } from '@/pages/Onboarding';

interface PropertyRulesStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  section: 'rules' | 'mess';
}

const phoneOptions = [
  { id: 'no' as const, label: 'No' },
  { id: 'limited' as const, label: 'Limited' },
  { id: 'yes' as const, label: 'Yes' },
];

const outingOptions = [
  { id: 'no' as const, label: 'No' },
  { id: 'permission' as const, label: 'Permission' },
  { id: 'weekends' as const, label: 'Weekends' },
  { id: 'anytime' as const, label: 'Anytime' },
];

const attendanceOptions = [
  { id: 'daily' as const, label: 'Daily' },
  { id: 'floor_wise' as const, label: 'Floor-wise' },
  { id: 'block_wise' as const, label: 'Block-wise' },
];

const attendanceMarkers = [
  { id: 'property_manager', label: 'Manager' },
  { id: 'security', label: 'Security' },
];

export function PropertyRulesStep({ data, updateData, section }: PropertyRulesStepProps) {
  const toggleAttendanceMarker = (markerId: string) => {
    const current = data.attendanceMarkedBy;
    const updated = current.includes(markerId)
      ? current.filter(id => id !== markerId)
      : [...current, markerId];
    updateData({ attendanceMarkedBy: updated });
  };

  if (section === 'rules') {
    return (
      <div className="space-y-5">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground">Property Rules</h2>
          <p className="text-sm text-muted-foreground">Configure your property policies</p>
        </div>

        {/* Phone Policy */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Phone className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <span className="text-sm font-medium">Mobile Phones</span>
          </div>
          <div className="flex gap-2">
            {phoneOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => updateData({ phoneAllowed: option.id })}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all",
                  data.phoneAllowed === option.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 hover:border-primary/50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Outing Policy */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <MapPin className="h-3.5 w-3.5 text-purple-500" />
            </div>
            <span className="text-sm font-medium">Outings</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {outingOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => updateData({ outingAllowed: option.id })}
                className={cn(
                  "py-2 px-2 rounded-lg border text-xs font-medium transition-all",
                  data.outingAllowed === option.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 hover:border-primary/50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Curfew Time */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <Clock className="h-3.5 w-3.5 text-orange-500" />
            </div>
            <span className="text-sm font-medium">Curfew Time</span>
          </div>
          <Input
            type="time"
            value={data.curfewTime}
            onChange={(e) => updateData({ curfewTime: e.target.value })}
            className="max-w-[120px] h-9 rounded-lg"
          />
        </div>

        {/* Toggles */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Parent Visits</span>
            </div>
            <Switch
              checked={data.parentVisits}
              onCheckedChange={(checked) => updateData({ parentVisits: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-teal-500" />
              <span className="text-sm font-medium">Other Visitors</span>
            </div>
            <Switch
              checked={data.visitorsAllowed}
              onCheckedChange={(checked) => updateData({ visitorsAllowed: checked })}
            />
          </div>
        </div>
      </div>
    );
  }

  // Mess & Attendance Section
  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">Mess & Attendance</h2>
        <p className="text-sm text-muted-foreground">Food and attendance setup</p>
      </div>

      {/* Mess Configuration */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Utensils className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <span className="text-sm font-medium">Mess Facility</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
          <span className="text-sm">Mess Available</span>
          <Switch
            checked={data.messAvailable}
            onCheckedChange={(checked) => updateData({ messAvailable: checked })}
          />
        </div>

        {data.messAvailable && (
          <>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
              <span className="text-sm">Mandatory for All</span>
              <Switch
                checked={data.messMandatory}
                onCheckedChange={(checked) => updateData({ messMandatory: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-red-500" />
                <span className="text-sm">External Food Allowed</span>
              </div>
              <Switch
                checked={data.externalFood}
                onCheckedChange={(checked) => updateData({ externalFood: checked })}
              />
            </div>
          </>
        )}
      </div>

      {/* Attendance Configuration */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Calendar className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <span className="text-sm font-medium">Attendance</span>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Type</Label>
          <div className="flex gap-2">
            {attendanceOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => updateData({ attendanceType: option.id })}
                className={cn(
                  "flex-1 py-2 px-2 rounded-lg border text-xs font-medium transition-all",
                  data.attendanceType === option.id
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
          <Label className="text-xs text-muted-foreground">Marked by</Label>
          <div className="flex flex-wrap gap-2">
            {attendanceMarkers.map((marker) => (
              <button
                key={marker.id}
                onClick={() => toggleAttendanceMarker(marker.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all",
                  data.attendanceMarkedBy.includes(marker.id)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 hover:border-primary/50"
                )}
              >
                {data.attendanceMarkedBy.includes(marker.id) && (
                  <CheckCircle2 className="h-3 w-3" />
                )}
                {marker.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
