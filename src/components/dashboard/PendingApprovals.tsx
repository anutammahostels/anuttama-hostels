import { Clock, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Approval {
  id: number;
  type: string;
  student: string;
  room: string;
  details: string;
  time: string;
  typeColor: string;
}

const approvals: Approval[] = [
  {
    id: 1,
    type: "Gate Pass",
    student: "Rahul Sharma",
    room: "Room 204",
    details: "Weekend leave: 15-17 Jan",
    time: "10 min ago",
    typeColor: "bg-hostylia-forest/10 text-hostylia-forest",
  },
  {
    id: 2,
    type: "Gate Pass",
    student: "Ananya Singh",
    room: "Room 112",
    details: "Medical appointment",
    time: "25 min ago",
    typeColor: "bg-hostylia-forest/10 text-hostylia-forest",
  },
  {
    id: 3,
    type: "Leave Request",
    student: "Vikram Patel",
    room: "Room 305",
    details: "Family emergency: 3 days",
    time: "1 hour ago",
    typeColor: "bg-amber-500/10 text-amber-600",
  },
];

export const PendingApprovals = () => {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <h3 className="font-bold text-lg text-card-foreground">Pending Approvals</h3>
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-hostylia-forest to-hostylia-forest-light text-white text-xs font-bold shadow-lg">
            {approvals.length}
          </span>
        </div>
        <button className="text-sm font-semibold text-hostylia-forest hover:text-hostylia-forest-light transition-colors">
          View all
        </button>
      </div>

      <div className="space-y-4">
        {approvals.map((approval) => (
          <div
            key={approval.id}
            className="p-4 rounded-xl bg-secondary/30 border border-border/50 hover:border-hostylia-forest/20 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className={cn(
                  "inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold mb-2",
                  approval.typeColor
                )}>
                  {approval.type}
                </span>
                <h4 className="font-semibold text-card-foreground">{approval.student}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{approval.room}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {approval.time}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">{approval.details}</p>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1 bg-gradient-to-r from-hostylia-forest to-hostylia-forest-light hover:from-hostylia-forest-light hover:to-hostylia-forest text-white shadow-md hover:shadow-lg transition-all"
              >
                <Check className="h-4 w-4 mr-1.5" />
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              >
                <X className="h-4 w-4 mr-1.5" />
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
