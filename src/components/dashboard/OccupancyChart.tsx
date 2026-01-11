import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";

const periods = ["1M", "3M", "1Y"] as const;

export const OccupancyChart = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<typeof periods[number]>("1Y");
  const { occupancyChartData, isLoading } = useDashboard();

  // Filter data based on period
  const getFilteredData = () => {
    switch (selectedPeriod) {
      case "1M":
        return occupancyChartData.slice(-1);
      case "3M":
        return occupancyChartData.slice(-3);
      default:
        return occupancyChartData;
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <Skeleton className="h-6 w-40 mb-1" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="font-bold text-lg text-card-foreground">Occupancy Trend</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Monthly occupancy rate overview</p>
        </div>
        <div className="flex gap-1 p-1 bg-secondary/50 rounded-xl">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                selectedPeriod === period
                  ? "bg-gradient-to-r from-hostylia-navy to-hostylia-forest text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={getFilteredData()}>
            <defs>
              <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(152 45% 28%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(152 45% 28%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontWeight: 500 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12, fontWeight: 500 }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(210 55% 12%)",
                border: "1px solid hsl(152 45% 28%)",
                borderRadius: "12px",
                color: "white",
                boxShadow: "0 10px 40px -10px hsl(152 45% 28% / 0.3)",
              }}
              formatter={(value: number) => [`${value}%`, "Occupancy"]}
              labelStyle={{ color: "hsl(215 20% 65%)", fontWeight: 500 }}
            />
            <Area
              type="monotone"
              dataKey="occupancy"
              stroke="hsl(152 45% 35%)"
              strokeWidth={3}
              fill="url(#occupancyGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};