
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  UtensilsCrossed,
  Plus,
  Calendar,
  Users,
  TrendingDown,
  IndianRupee,
  Leaf,
  Drumstick,
  Clock,
} from "lucide-react";

const weeklyMenu = [
  {
    day: "Monday",
    breakfast: { items: "Poha, Boiled Eggs, Bread & Butter, Milk", type: "veg" },
    lunch: { items: "Rice, Dal, Paneer Butter Masala, Roti, Salad", type: "veg" },
    dinner: { items: "Rice, Chicken Curry, Roti, Raita", type: "non-veg" },
  },
  {
    day: "Tuesday",
    breakfast: { items: "Idli, Sambar, Coconut Chutney, Tea", type: "veg" },
    lunch: { items: "Rice, Rajma, Aloo Gobi, Roti, Salad", type: "veg" },
    dinner: { items: "Rice, Fish Curry, Roti, Dal", type: "non-veg" },
  },
  {
    day: "Wednesday",
    breakfast: { items: "Paratha, Curd, Pickle, Milk", type: "veg" },
    lunch: { items: "Rice, Chole, Mix Veg, Roti, Salad", type: "veg" },
    dinner: { items: "Rice, Egg Curry, Roti, Dal", type: "non-veg" },
  },
  {
    day: "Thursday",
    breakfast: { items: "Upma, Boiled Eggs, Toast, Tea", type: "veg" },
    lunch: { items: "Rice, Dal Tadka, Bhindi Fry, Roti, Salad", type: "veg" },
    dinner: { items: "Biryani (Veg/Non-Veg), Raita, Salad", type: "non-veg" },
  },
  {
    day: "Friday",
    breakfast: { items: "Dosa, Sambar, Chutney, Coffee", type: "veg" },
    lunch: { items: "Rice, Sambar, Cabbage Poriyal, Roti", type: "veg" },
    dinner: { items: "Rice, Mutton Curry, Roti, Dal", type: "non-veg" },
  },
  {
    day: "Saturday",
    breakfast: { items: "Chole Bhature, Lassi", type: "veg" },
    lunch: { items: "Rice, Kadhi Pakora, Aloo Matar, Roti", type: "veg" },
    dinner: { items: "Pulao, Chicken Korma, Naan, Raita", type: "non-veg" },
  },
  {
    day: "Sunday",
    breakfast: { items: "Special Brunch - Pancakes, Fruits, Juice", type: "veg" },
    lunch: { items: "Rice, Dal Makhani, Shahi Paneer, Naan, Gulab Jamun", type: "veg" },
    dinner: { items: "Rice, Butter Chicken, Naan, Dal, Ice Cream", type: "non-veg" },
  },
];

const rebateRequests = [
  { id: 1, student: "Rahul Sharma", dates: "Jan 15-17", meals: 6, amount: 300, status: "approved" },
  { id: 2, student: "Priya Patel", dates: "Jan 18-20", meals: 9, amount: 450, status: "pending" },
  { id: 3, student: "Amit Kumar", dates: "Jan 16", meals: 3, amount: 150, status: "approved" },
  { id: 4, student: "Sneha Reddy", dates: "Jan 19-21", meals: 9, amount: 450, status: "pending" },
];

const stats = [
  { label: "Today's Expected", value: "1,180", icon: Users, color: "text-primary" },
  { label: "Marked Absent", value: "67", icon: TrendingDown, color: "text-orange-500" },
  { label: "Monthly Rebates", value: "₹24,500", icon: IndianRupee, color: "text-green-500" },
  { label: "Pending Requests", value: "12", icon: Clock, color: "text-yellow-500" },
];

const MessManagement = () => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mess Management</h1>
            <p className="text-muted-foreground">
              Weekly menu, attendance and rebate management
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Mark Absence
            </Button>
            <Button className="gradient-primary text-white">
              <Plus className="h-4 w-4 mr-2" />
              Update Menu
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="menu">
          <TabsList>
            <TabsTrigger value="menu">Weekly Menu</TabsTrigger>
            <TabsTrigger value="rebates">Rebate Requests</TabsTrigger>
            <TabsTrigger value="attendance">Meal Attendance</TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="mt-6">
            {/* Today's Menu Highlight */}
            <Card className="border-border/50 mb-6 bg-gradient-to-r from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  Today's Menu - {today}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {weeklyMenu.filter(m => m.day === today).map((menu) => (
                  <div key={menu.day} className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <p className="font-medium text-orange-600 mb-2">🌅 Breakfast</p>
                      <p className="text-sm">{menu.breakfast.items}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <p className="font-medium text-yellow-600 mb-2">☀️ Lunch</p>
                      <p className="text-sm">{menu.lunch.items}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <p className="font-medium text-purple-600 mb-2">🌙 Dinner</p>
                      <p className="text-sm">{menu.dinner.items}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Full Week Menu */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Weekly Menu</CardTitle>
                <CardDescription>View and manage the mess menu for the entire week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Day</TableHead>
                        <TableHead>Breakfast (7:30 - 9:00)</TableHead>
                        <TableHead>Lunch (12:30 - 14:00)</TableHead>
                        <TableHead>Dinner (19:30 - 21:00)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {weeklyMenu.map((menu) => (
                        <TableRow key={menu.day} className={menu.day === today ? "bg-primary/5" : ""}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {menu.day}
                              {menu.day === today && (
                                <Badge className="bg-primary/20 text-primary">Today</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-start gap-2">
                              <Leaf className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{menu.breakfast.items}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-start gap-2">
                              <Leaf className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{menu.lunch.items}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-start gap-2">
                              <Drumstick className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{menu.dinner.items}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rebates" className="mt-6">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Rebate Requests</CardTitle>
                    <CardDescription>
                      Students who marked absence 24+ hours in advance qualify for meal rebates
                    </CardDescription>
                  </div>
                  <Badge variant="outline">₹50/meal rebate</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Absence Dates</TableHead>
                      <TableHead>Meals</TableHead>
                      <TableHead>Rebate Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rebateRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.student}</TableCell>
                        <TableCell>{request.dates}</TableCell>
                        <TableCell>{request.meals} meals</TableCell>
                        <TableCell className="text-green-600 font-medium">₹{request.amount}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              request.status === "approved"
                                ? "bg-green-500/10 text-green-600"
                                : "bg-yellow-500/10 text-yellow-600"
                            }
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="mt-6">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground py-8">
                  Meal attendance tracking and reports will be shown here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MessManagement;
