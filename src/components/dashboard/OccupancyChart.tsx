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
      <div className="rounded-xl md:rounded-2xl border border-border/50 bg-card p-3 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 md:mb-6 gap-3">
          <div>
            <Skeleton className="h-5 w-32 md:h-6 md:w-40 mb-1" />
            <Skeleton className="h-3 w-40 md:h-4 md:w-56" />
          </div>
          <Skeleton className="h-8 w-28 md:h-10 md:w-36 rounded-lg md:rounded-xl" />
        </div>
        <Skeleton className="h-48 md:h-72 w-full rounded-lg md:rounded-xl" />
      </div>
    );
  }

  return (
    <div className="rounded-xl md:rounded-2xl border border-border/50 bg-card p-3 md:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 md:mb-6 gap-3">
        <div>
          <h3 className="font-bold text-sm md:text-lg text-card-foreground">Occupancy Trend</h3>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Monthly overview</p>
        </div>
        <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg md:rounded-xl self-start sm:self-auto">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={cn(
                "px-2.5 md:px-4 py-1.5 md:py-2 rounded-md md:rounded-lg text-xs md:text-sm font-semibold transition-all duration-200",
                selectedPeriod === period
                  ? "bg-[#29926A] text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="h-48 md:h-72">
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
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              width={35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(210 55% 12%)",
                border: "1px solid hsl(152 45% 28%)",
                borderRadius: "8px",
                color: "white",
                fontSize: "12px",
                boxShadow: "0 10px 40px -10px hsl(152 45% 28% / 0.3)",
              }}
              formatter={(value: number) => [`${value}%`, "Occupancy"]}
              labelStyle={{ color: "hsl(215 20% 65%)", fontWeight: 500 }}
            />
            <Area
              type="monotone"
              dataKey="occupancy"
              stroke="hsl(152 45% 35%)"
              strokeWidth={2}
              fill="url(#occupancyGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};