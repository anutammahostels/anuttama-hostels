import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", occupancy: 85 },
  { month: "Feb", occupancy: 88 },
  { month: "Mar", occupancy: 92 },
  { month: "Apr", occupancy: 90 },
  { month: "May", occupancy: 87 },
  { month: "Jun", occupancy: 75 },
  { month: "Jul", occupancy: 70 },
  { month: "Aug", occupancy: 82 },
  { month: "Sep", occupancy: 95 },
  { month: "Oct", occupancy: 94 },
  { month: "Nov", occupancy: 93 },
  { month: "Dec", occupancy: 91 },
];

export const OccupancyChart = () => {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-card-foreground">Occupancy Trend</h3>
          <p className="text-sm text-muted-foreground">Monthly occupancy rate over the year</p>
        </div>
        <div className="flex gap-2">
          {["1M", "3M", "1Y"].map((period, i) => (
            <button
              key={period}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                i === 2
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }}
              domain={[60, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222, 47%, 11%)",
                border: "none",
                borderRadius: "8px",
                color: "white",
              }}
              formatter={(value: number) => [`${value}%`, "Occupancy"]}
            />
            <Area
              type="monotone"
              dataKey="occupancy"
              stroke="hsl(221, 83%, 53%)"
              strokeWidth={2}
              fill="url(#occupancyGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
