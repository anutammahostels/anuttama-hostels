
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  Leaf,
  Drumstick,
  Pencil,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
type MealData = { items: string; type: string };
type DayMenu = {
  day: string;
  breakfast: MealData;
  lunch: MealData;
  dinner: MealData;
};

const defaultWeeklyMenu: DayMenu[] = [
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

const MessManagement = () => {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const { toast } = useToast();

  const [weeklyMenu, setWeeklyMenu] = useState<DayMenu[]>(defaultWeeklyMenu);
  const [editDialog, setEditDialog] = useState(false);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ breakfast: "", lunch: "", dinner: "" });

  const openEditDay = (day: string) => {
    const menu = weeklyMenu.find(m => m.day === day);
    if (menu) {
      setEditForm({
        breakfast: menu.breakfast.items,
        lunch: menu.lunch.items,
        dinner: menu.dinner.items,
      });
      setEditingDay(day);
      setEditDialog(true);
    }
  };

  const handleSaveMenu = () => {
    if (!editingDay) return;
    setWeeklyMenu(prev => prev.map(m =>
      m.day === editingDay
        ? {
            ...m,
            breakfast: { ...m.breakfast, items: editForm.breakfast },
            lunch: { ...m.lunch, items: editForm.lunch },
            dinner: { ...m.dinner, items: editForm.dinner },
          }
        : m
    ));
    setEditDialog(false);
    setEditingDay(null);
    toast({ title: "Menu updated", description: `${editingDay}'s menu has been updated.` });
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mess Management</h1>
            <p className="text-muted-foreground">
              View and update the weekly mess menu
            </p>
          </div>
        </div>

        {/* Today's Menu Highlight */}
        <Card className="border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
                Today's Menu - {today}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => openEditDay(today)}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit Today
              </Button>
            </div>
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
                    <TableHead className="w-[60px]"></TableHead>
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
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDay(menu.day)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Menu Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit {editingDay}'s Menu</DialogTitle>
            <DialogDescription>Update the meals for {editingDay}. Separate items with commas.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>🌅 Breakfast</Label>
              <Input
                value={editForm.breakfast}
                onChange={(e) => setEditForm(f => ({ ...f, breakfast: e.target.value }))}
                placeholder="e.g. Poha, Boiled Eggs, Bread & Butter, Milk"
              />
            </div>
            <div className="space-y-2">
              <Label>☀️ Lunch</Label>
              <Input
                value={editForm.lunch}
                onChange={(e) => setEditForm(f => ({ ...f, lunch: e.target.value }))}
                placeholder="e.g. Rice, Dal, Paneer, Roti, Salad"
              />
            </div>
            <div className="space-y-2">
              <Label>🌙 Dinner</Label>
              <Input
                value={editForm.dinner}
                onChange={(e) => setEditForm(f => ({ ...f, dinner: e.target.value }))}
                placeholder="e.g. Rice, Chicken Curry, Roti, Raita"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveMenu}>Save Menu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MessManagement;
