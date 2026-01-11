import { Clock, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const approvals = [
  {
    id: 1,
    type: "Gate Pass",
    student: "Rahul Sharma",
    room: "Room 204",
    details: "Weekend leave: 15-17 Jan",
    time: "10 min ago",
  },
  {
    id: 2,
    type: "Gate Pass",
    student: "Ananya Singh",
    room: "Room 112",
    details: "Medical appointment",
    time: "25 min ago",
  },
  {
    id: 3,
    type: "Leave Request",
    student: "Vikram Patel",
    room: "Room 305",
    details: "Family emergency: 3 days",
    time: "1 hour ago",
  },
];

export const PendingApprovals = () => {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-card-foreground">Pending Approvals</h3>
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
            {approvals.length}
          </span>
        </div>
        <button className="text-sm text-primary hover:underline">View all</button>
      </div>

      <div className="space-y-4">
        {approvals.map((approval) => (
          <div
            key={approval.id}
            className="p-4 rounded-xl bg-secondary/50 border border-border"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary mb-1">
                  {approval.type}
                </span>
                <h4 className="font-medium text-card-foreground">{approval.student}</h4>
                <p className="text-xs text-muted-foreground">{approval.room}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {approval.time}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">{approval.details}</p>
            
            <div className="flex gap-2">
              <Button size="sm" variant="success" className="flex-1">
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
