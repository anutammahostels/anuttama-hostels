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
      <div className="rounded-xl md:rounded-2xl border border-border/50 bg-card p-3 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3 md:mb-6">
          <Skeleton className="h-5 w-32 md:h-6 md:w-40" />
          <Skeleton className="h-5 w-5 md:h-6 md:w-6 rounded-full" />
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="p-3 rounded-lg bg-secondary/30 border border-border/50">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-20 mb-2" />
              <div className="flex gap-2">
                <Skeleton className="h-7 flex-1" />
                <Skeleton className="h-7 flex-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl md:rounded-2xl border border-border/50 bg-card p-3 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3 md:mb-6">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm md:text-lg text-card-foreground">Approvals</h3>
          <span className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#29926A] text-white text-[10px] md:text-xs font-bold shadow-lg">
            {pendingApprovals.length}
          </span>
        </div>
        <button 
          className="text-xs md:text-sm font-semibold text-hostylia-forest hover:text-hostylia-forest-light transition-colors"
          onClick={() => navigate('/dashboard/passes')}
        >
          View all
        </button>
      </div>

      {pendingApprovals.length === 0 ? (
        <div className="text-center py-6">
          <Check className="h-8 w-8 mx-auto text-success mb-2" />
          <p className="text-xs md:text-sm text-muted-foreground">No pending approvals</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingApprovals.slice(0, 2).map((approval) => (
            <div
              key={approval.id}
              className="p-3 rounded-lg md:rounded-xl bg-secondary/30 border border-border/50 hover:border-hostylia-forest/20 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <span className={cn(
                    "inline-flex px-2 py-0.5 rounded-md text-[10px] md:text-xs font-semibold mb-1",
                    "bg-hostylia-forest/10 text-hostylia-forest"
                  )}>
                    {approval.type}
                  </span>
                  <h4 className="font-semibold text-card-foreground text-xs md:text-sm truncate">{approval.studentName}</h4>
                  <p className="text-[10px] md:text-xs text-muted-foreground">{approval.room}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] md:text-xs text-muted-foreground ml-2">
                  <Clock className="h-3 w-3" />
                  {approval.time}
                </div>
              </div>
              
              <p className="text-[10px] md:text-sm text-muted-foreground mb-2 line-clamp-1">{approval.details}</p>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1 h-7 md:h-8 text-xs bg-[#29926A] hover:from-hostylia-forest-light hover:to-hostylia-forest text-white shadow-md"
                  onClick={() => handleApprove(approval.id)}
                  disabled={approveGatePass.isPending}
                >
                  {approveGatePass.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Approve
                    </>
                  )}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 h-7 md:h-8 text-xs border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                  onClick={() => handleReject(approval.id)}
                  disabled={rejectGatePass.isPending}
                >
                  {rejectGatePass.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <X className="h-3 w-3 mr-1" />
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