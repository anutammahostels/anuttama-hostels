import { 
  Building2, Users, Bed, TrendingUp, Clock, Bell, QrCode, 
  Receipt, UtensilsCrossed, Wrench, CheckCircle2, AlertCircle,
  ChevronRight, MoreHorizontal, CalendarDays, UserCheck
} from "lucide-react";

export const DashboardMockup = () => {
  return (
    <div className="relative rounded-2xl lg:rounded-3xl border border-white/10 bg-[hsl(222,47%,8%)] p-1 lg:p-2 shadow-2xl overflow-hidden">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-3 bg-white/5 rounded-t-xl lg:rounded-t-2xl border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-red-400/50" />
          <div className="w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-yellow-400/50" />
          <div className="w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-green-400/50" />
        </div>
        <div className="flex-1 mx-2 lg:mx-4">
          <div className="h-5 lg:h-7 bg-white/5 rounded-lg max-w-[200px] lg:max-w-sm mx-auto flex items-center justify-center gap-2 px-3">
            <div className="w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-secondary/50" />
            <span className="text-[10px] lg:text-xs text-white/30 truncate">app.hostylia.com/dashboard</span>
          </div>
        </div>
      </div>
      
      {/* Dashboard content */}
      <div className="bg-[hsl(222,47%,6%)] rounded-b-xl lg:rounded-b-2xl p-2 lg:p-4">
        <div className="flex gap-2 lg:gap-4">
          {/* Sidebar - Hidden on mobile */}
          <div className="hidden lg:flex flex-col w-48 bg-[hsl(222,47%,8%)] rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-white font-semibold text-sm">Hostylia</span>
            </div>
            
            {[
              { icon: Building2, label: "Dashboard", active: true },
              { icon: Users, label: "Students" },
              { icon: Bed, label: "Rooms" },
              { icon: QrCode, label: "Gate Passes" },
              { icon: Receipt, label: "Billing" },
              { icon: UtensilsCrossed, label: "Mess" },
              { icon: Wrench, label: "Maintenance" },
            ].map((item, i) => (
              <div 
                key={item.label}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-1 cursor-pointer transition-colors ${
                  item.active 
                    ? "bg-gradient-to-r from-primary/20 to-secondary/20 text-white border border-primary/30" 
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <div>
                <h2 className="text-white font-semibold text-sm lg:text-lg">Good Morning, Admin! 👋</h2>
                <p className="text-white/40 text-[10px] lg:text-xs">Sunrise Hostel • 342 Students</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Bell className="h-4 w-4 lg:h-5 lg:w-5 text-white/50" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 lg:w-2.5 lg:h-2.5 bg-red-500 rounded-full border border-[hsl(222,47%,6%)]" />
                </div>
                <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-gradient-to-br from-primary to-secondary" />
              </div>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 mb-3 lg:mb-4">
              {[
                { label: "Total Students", value: "342", change: "+12", icon: Users, color: "from-primary to-blue-500" },
                { label: "Occupancy", value: "94%", change: "+3%", icon: TrendingUp, color: "from-secondary to-emerald-500" },
                { label: "Vacant Beds", value: "18", change: "", icon: Bed, color: "from-amber-500 to-orange-500", highlight: true },
                { label: "Pending Dues", value: "₹2.4L", change: "", icon: Receipt, color: "from-pink-500 to-rose-500" },
              ].map((stat) => (
                <div 
                  key={stat.label}
                  className={`p-2 lg:p-3 rounded-lg lg:rounded-xl bg-white/5 border transition-all ${
                    stat.highlight ? "border-amber-500/50 bg-amber-500/10" : "border-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between mb-1 lg:mb-2">
                    <div className={`p-1 lg:p-1.5 rounded-md lg:rounded-lg bg-gradient-to-br ${stat.color}`}>
                      <stat.icon className="h-2.5 w-2.5 lg:h-3.5 lg:w-3.5 text-white" />
                    </div>
                    {stat.change && (
                      <span className="text-[8px] lg:text-[10px] text-green-400 font-medium">{stat.change}</span>
                    )}
                    {stat.highlight && (
                      <span className="text-[8px] lg:text-[10px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">Available</span>
                    )}
                  </div>
                  <p className="text-white font-bold text-sm lg:text-xl">{stat.value}</p>
                  <p className="text-white/40 text-[8px] lg:text-[10px]">{stat.label}</p>
                </div>
              ))}
            </div>
            
            {/* Main Grid */}
            <div className="grid lg:grid-cols-3 gap-2 lg:gap-3">
              {/* Occupancy Chart */}
              <div className="lg:col-span-2 p-2 lg:p-4 rounded-lg lg:rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-between mb-2 lg:mb-3">
                  <h3 className="text-white font-medium text-xs lg:text-sm">Block-wise Occupancy</h3>
                  <MoreHorizontal className="h-3 w-3 lg:h-4 lg:w-4 text-white/30" />
                </div>
                <div className="flex items-end gap-1 lg:gap-2 h-16 lg:h-24">
                  {[
                    { block: "A", fill: 92 },
                    { block: "B", fill: 87 },
                    { block: "C", fill: 98 },
                    { block: "D", fill: 76 },
                    { block: "E", fill: 94 },
                  ].map((item) => (
                    <div key={item.block} className="flex-1 flex flex-col items-center">
                      <div className="w-full relative h-12 lg:h-20 bg-white/10 rounded-t-md overflow-hidden">
                        <div 
                          className={`absolute bottom-0 w-full rounded-t-md transition-all duration-500 ${
                            item.fill > 90 ? "bg-gradient-to-t from-secondary to-emerald-400" : 
                            item.fill > 80 ? "bg-gradient-to-t from-primary to-blue-400" :
                            "bg-gradient-to-t from-amber-500 to-orange-400"
                          }`}
                          style={{ height: `${item.fill}%` }}
                        />
                      </div>
                      <span className="text-[8px] lg:text-[10px] text-white/50 mt-1">{item.block}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="p-2 lg:p-4 rounded-lg lg:rounded-xl bg-white/5 border border-white/5">
                <h3 className="text-white font-medium text-xs lg:text-sm mb-2 lg:mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-1 lg:gap-2">
                  {[
                    { icon: UserCheck, label: "Mark Attendance", color: "bg-primary/20 text-primary" },
                    { icon: QrCode, label: "New Gate Pass", color: "bg-secondary/20 text-secondary" },
                    { icon: Wrench, label: "Log Issue", color: "bg-orange-500/20 text-orange-400" },
                    { icon: Receipt, label: "Send Invoice", color: "bg-pink-500/20 text-pink-400" },
                  ].map((action) => (
                    <button 
                      key={action.label}
                      className={`p-1.5 lg:p-2 rounded-md lg:rounded-lg ${action.color} flex flex-col items-center gap-1 hover:opacity-80 transition-opacity`}
                    >
                      <action.icon className="h-3 w-3 lg:h-4 lg:w-4" />
                      <span className="text-[7px] lg:text-[9px] font-medium text-center leading-tight">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Bottom Section */}
            <div className="grid lg:grid-cols-2 gap-2 lg:gap-3 mt-2 lg:mt-3">
              {/* Pending Approvals */}
              <div className="p-2 lg:p-4 rounded-lg lg:rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium text-xs lg:text-sm flex items-center gap-1.5">
                    <AlertCircle className="h-3 w-3 lg:h-4 lg:w-4 text-amber-400" />
                    Pending Approvals
                    <span className="px-1 lg:px-1.5 py-0.5 text-[8px] lg:text-[10px] rounded-full bg-amber-500/20 text-amber-400">5</span>
                  </h3>
                  <ChevronRight className="h-3 w-3 lg:h-4 lg:w-4 text-white/30" />
                </div>
                <div className="space-y-1 lg:space-y-2">
                  {[
                    { name: "Rahul Kumar", type: "Weekend Leave", time: "2 hrs ago" },
                    { name: "Priya Singh", type: "Day Outing", time: "3 hrs ago" },
                    { name: "Amit Sharma", type: "Home Visit", time: "5 hrs ago" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-1.5 lg:p-2 rounded-md lg:rounded-lg bg-white/5">
                      <div className="flex items-center gap-1.5 lg:gap-2 min-w-0">
                        <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-white text-[9px] lg:text-xs font-medium truncate">{item.name}</p>
                          <p className="text-white/40 text-[7px] lg:text-[10px] truncate">{item.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button className="p-1 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30">
                          <CheckCircle2 className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
                        </button>
                        <button className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30">
                          <AlertCircle className="h-2.5 w-2.5 lg:h-3 lg:w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Today's Schedule */}
              <div className="p-2 lg:p-4 rounded-lg lg:rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium text-xs lg:text-sm flex items-center gap-1.5">
                    <CalendarDays className="h-3 w-3 lg:h-4 lg:w-4 text-primary" />
                    Today's Activity
                  </h3>
                  <span className="text-[8px] lg:text-[10px] text-white/40">Jan 11, 2026</span>
                </div>
                <div className="space-y-1 lg:space-y-2">
                  {[
                    { time: "7:00 AM", event: "Breakfast", status: "done" },
                    { time: "9:00 AM", event: "Attendance Marked", status: "done" },
                    { time: "12:30 PM", event: "Lunch Service", status: "ongoing" },
                    { time: "6:00 PM", event: "Fee Reminder Due", status: "pending" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        item.status === "done" ? "bg-green-400" : 
                        item.status === "ongoing" ? "bg-yellow-400 animate-pulse" : "bg-white/30"
                      }`} />
                      <span className="text-[8px] lg:text-[10px] text-white/40 w-12 lg:w-14">{item.time}</span>
                      <span className={`text-[9px] lg:text-xs ${
                        item.status === "ongoing" ? "text-white font-medium" : "text-white/60"
                      }`}>{item.event}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-8 lg:h-16 bg-gradient-to-t from-[hsl(222,47%,8%)] to-transparent pointer-events-none" />
    </div>
  );
};