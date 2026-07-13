import { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import { useCenter } from "@/contexts/CenterContext";

interface CenterFilterProps {
  className?: string;
  showLabel?: boolean;
}

export const CenterFilter = ({ className, showLabel = true }: CenterFilterProps) => {
  const { properties, isLoading } = useProperties();
  const { centerId, setCenterId } = useCenter();

  // If the user is only assigned to a single property (e.g. isolated center admin),
  // auto-lock the filter to that property.
  const isLocked = !isLoading && properties.length === 1;
  const lockedId = isLocked ? properties[0].id : null;

  useEffect(() => {
    if (isLocked && lockedId && centerId !== lockedId) {
      setCenterId(lockedId);
    }
  }, [isLocked, lockedId, centerId, setCenterId]);

  if (isLocked && lockedId) {
    return (
      <div className={`flex items-center gap-2 ${className ?? ""}`}>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/60 px-2.5 py-1.5 rounded-md">
          <Building2 className="h-3.5 w-3.5" />
          <span className="font-medium text-foreground">{properties[0].name}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      {showLabel && (
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" />
          <span>Center</span>
        </div>
      )}
      <Select value={centerId} onValueChange={setCenterId} disabled={isLoading}>
        <SelectTrigger className="h-9 w-[160px] text-sm">
          <SelectValue placeholder="All centers" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Centers</SelectItem>
          {properties.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
