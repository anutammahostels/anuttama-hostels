import { Clock, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDashboard, type PendingApproval } from "@/hooks/useDashboard";
import { useGatePasses } from "@/hooks/useGatePasses";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

export const PendingApprovals = () => {
  const navigate = useNavigate();
  const { pendingApprovals, isLoading } = useDashboard();
  const { approveGatePass, rejectGatePass } = useGatePasses();

  const handleApprove = async (id: string) => {
    await approveGatePass.mutateAsync(id);
  };

  const handleReject = async (id: string) => {
    await rejectGatePass.mutateAsync({ id, notes: 'Rejected from dashboard' });
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-secondary/30 border border-border/50">
              <Skeleton className="h-5 w-20 mb-2" />
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-24 mb-3" />
              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 flex-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <h3 className="font-bold text-lg text-card-foreground">Pending Approvals</h3>
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-hostylia-forest to-hostylia-forest-light text-white text-xs font-bold shadow-lg">
            {pendingApprovals.length}
          </span>
        </div>
        <button 
          className="text-sm font-semibold text-hostylia-forest hover:text-hostylia-forest-light transition-colors"
          onClick={() => navigate('/gate-passes')}
        >
          View all
        </button>
      </div>

      {pendingApprovals.length === 0 ? (
        <div className="text-center py-8">
          <Check className="h-10 w-10 mx-auto text-success mb-2" />
          <p className="text-muted-foreground">No pending approvals</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingApprovals.map((approval) => (
            <div
              key={approval.id}
              className="p-4 rounded-xl bg-secondary/30 border border-border/50 hover:border-hostylia-forest/20 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={cn(
                    "inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold mb-2",
                    "bg-hostylia-forest/10 text-hostylia-forest"
                  )}>
                    {approval.type}
                  </span>
                  <h4 className="font-semibold text-card-foreground">{approval.studentName}</h4>
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
                  onClick={() => handleApprove(approval.id)}
                  disabled={approveGatePass.isPending}
                >
                  {approveGatePass.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1.5" />
                      Approve
                    </>
                  )}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                  onClick={() => handleReject(approval.id)}
                  disabled={rejectGatePass.isPending}
                >
                  {rejectGatePass.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-1.5" />
                      Reject
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};