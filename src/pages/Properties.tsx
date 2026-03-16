import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Building2, Plus, Search, MapPin, Users, BedDouble, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const properties = [
  {
    id: 1,
    name: "Sunrise Hostel - Main Block",
    address: "123 University Road, Campus Area",
    blocks: 4,
    rooms: 120,
    beds: 480,
    occupancy: 92,
    status: "active",
  },
  {
    id: 2,
    name: "Sunrise Hostel - Annex",
    address: "125 University Road, Campus Area",
    blocks: 2,
    rooms: 60,
    beds: 240,
    occupancy: 85,
    status: "active",
  },
  {
    id: 3,
    name: "Downtown Student Living",
    address: "45 Central Avenue, Downtown",
    blocks: 3,
    rooms: 90,
    beds: 180,
    occupancy: 78,
    status: "active",
  },
  {
    id: 4,
    name: "Tech Park Residence",
    address: "789 Innovation Drive",
    blocks: 5,
    rooms: 150,
    beds: 300,
    occupancy: 45,
    status: "maintenance",
  },
];

const Properties = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Properties</h1>
            <p className="text-muted-foreground">
              Manage your hostel properties and blocks
            </p>
          </div>
          <Button className="gradient-primary text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Property Cards */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{property.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {property.address}
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Property</DropdownMenuItem>
                      <DropdownMenuItem>Manage Blocks</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Building2 className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <p className="text-lg font-semibold">{property.blocks}</p>
                    <p className="text-xs text-muted-foreground">Blocks</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <p className="text-lg font-semibold">{property.rooms}</p>
                    <p className="text-xs text-muted-foreground">Rooms</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <BedDouble className="h-4 w-4 mx-auto mb-1 text-primary" />
                    <p className="text-lg font-semibold">{property.beds}</p>
                    <p className="text-xs text-muted-foreground">Beds</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Occupancy</span>
                    <span className="text-sm font-semibold">{property.occupancy}%</span>
                  </div>
                  <Badge
                    variant={property.status === "active" ? "default" : "secondary"}
                    className={property.status === "active" ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : ""}
                  >
                    {property.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Property Hierarchy Info */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Property Hierarchy</CardTitle>
            <CardDescription>
              Understanding the property structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">Hostel</span>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-blue-500" />
                </div>
                <span className="text-sm font-medium">Block</span>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-purple-500" />
                </div>
                <span className="text-sm font-medium">Floor</span>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <BedDouble className="h-4 w-4 text-orange-500" />
                </div>
                <span className="text-sm font-medium">Room</span>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <BedDouble className="h-4 w-4 text-green-500" />
                </div>
                <span className="text-sm font-medium">Bed (Sellable Unit)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Properties;
