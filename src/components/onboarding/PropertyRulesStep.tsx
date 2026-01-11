import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Users, 
  Utensils, 
  ShoppingBag,
  Calendar,
  UserCheck,
  CheckCircle2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OnboardingData } from '@/pages/Onboarding';

interface PropertyRulesStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  section: 'rules' | 'mess';
}

const phoneOptions = [
  { id: 'no' as const, label: 'Not Allowed', description: 'No phones permitted' },
  { id: 'limited' as const, label: 'Limited Hours', description: 'Allowed at specific times' },
  { id: 'yes' as const, label: 'Allowed', description: 'Full access permitted' },
];

const outingOptions = [
  { id: 'no' as const, label: 'Not Allowed', description: 'No outside visits' },
  { id: 'permission' as const, label: 'Permission Required', description: 'Needs approval' },
  { id: 'weekends' as const, label: 'Weekends Only', description: 'Free on weekends' },
  { id: 'anytime' as const, label: 'Anytime', description: 'Full freedom' },
];

const attendanceOptions = [
  { id: 'daily' as const, label: 'Daily', description: 'Once per day' },
  { id: 'floor_wise' as const, label: 'Floor-wise', description: 'By floor level' },
  { id: 'block_wise' as const, label: 'Block-wise', description: 'By building block' },
];

const attendanceMarkers = [
  { id: 'warden', label: 'Warden' },
  { id: 'property_manager', label: 'Property Manager' },
  { id: 'security', label: 'Security Guard' },
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
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Property Rules Configuration</h2>
          <p className="text-muted-foreground">Set up the basic rules for your property</p>
        </div>

        {/* Phone Policy */}
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Phone className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Mobile Phone Policy</h3>
              <p className="text-sm text-muted-foreground">Are phones allowed on premises?</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {phoneOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => updateData({ phoneAllowed: option.id })}
                className={cn(
                  "p-4 rounded-xl border-2 text-center transition-all",
                  data.phoneAllowed === option.id
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-primary/50"
                )}
              >
                <span className="font-medium text-sm">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Outing Policy */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Outing Policy</h3>
              <p className="text-sm text-muted-foreground">How are outings managed?</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {outingOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => updateData({ outingAllowed: option.id })}
                className={cn(
                  "p-4 rounded-xl border-2 text-center transition-all",
                  data.outingAllowed === option.id
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-primary/50"
                )}
              >
                <span className="font-medium text-sm">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Curfew Time */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Curfew Time</h3>
              <p className="text-sm text-muted-foreground">When should students be inside?</p>
            </div>
          </div>
          
          <Input
            type="time"
            value={data.curfewTime}
            onChange={(e) => updateData({ curfewTime: e.target.value })}
            className="max-w-xs h-12 rounded-xl"
          />
        </div>

        {/* Toggles */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between p-4 rounded-xl border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Parent Visits</h3>
                <p className="text-sm text-muted-foreground">Allow parents to visit students</p>
              </div>
            </div>
            <Switch
              checked={data.parentVisits}
              onCheckedChange={(checked) => updateData({ parentVisits: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-xl border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-teal-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Other Visitors</h3>
                <p className="text-sm text-muted-foreground">Allow friends and relatives</p>
              </div>
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
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Mess & Attendance Setup</h2>
        <p className="text-muted-foreground">Configure food and attendance policies</p>
      </div>

      {/* Mess Configuration */}
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Utensils className="h-5 w-5 text-amber-500" />
          </div>
          <h3 className="font-semibold text-foreground text-lg">Mess Facility</h3>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-border/50">
          <div>
            <h3 className="font-semibold text-foreground">Mess Available</h3>
            <p className="text-sm text-muted-foreground">Do you have a mess facility?</p>
          </div>
          <Switch
            checked={data.messAvailable}
            onCheckedChange={(checked) => updateData({ messAvailable: checked })}
          />
        </div>

        {data.messAvailable && (
          <>
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 animate-fade-in">
              <div>
                <h3 className="font-semibold text-foreground">Mandatory for All</h3>
                <p className="text-sm text-muted-foreground">Is mess subscription required?</p>
              </div>
              <Switch
                checked={data.messMandatory}
                onCheckedChange={(checked) => updateData({ messMandatory: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">External Food</h3>
                  <p className="text-sm text-muted-foreground">Allow ordering from outside</p>
                </div>
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
      <div className="space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-emerald-500" />
          </div>
          <h3 className="font-semibold text-foreground text-lg">Attendance System</h3>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Attendance Type</Label>
          <div className="grid grid-cols-3 gap-3">
            {attendanceOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => updateData({ attendanceType: option.id })}
                className={cn(
                  "p-4 rounded-xl border-2 text-center transition-all",
                  data.attendanceType === option.id
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
          <Label className="text-sm font-medium">Who marks attendance?</Label>
          <div className="flex flex-wrap gap-3">
            {attendanceMarkers.map((marker) => (
              <button
                key={marker.id}
                onClick={() => toggleAttendanceMarker(marker.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all",
                  data.attendanceMarkedBy.includes(marker.id)
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-primary/50"
                )}
              >
                {data.attendanceMarkedBy.includes(marker.id) && (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                )}
                <span className="font-medium text-sm">{marker.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
