import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Building2, Plus, Search, MapPin, Users, BedDouble, MoreVertical, Loader2, Eye, Pencil, Trash2, Layers } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProperties, type Property } from "@/hooks/useProperties";
import { useRooms } from "@/hooks/useRooms";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

type DialogMode = "add" | "edit" | "view" | "blocks" | null;

const Properties = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { properties, isLoading, createProperty, updateProperty, deleteProperty } = useProperties();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    total_capacity: 0,
    status: "active",
  });

  // Fetch student count per property (active students only)
  const studentsQuery = useQuery({
    queryKey: ['property-students-count', properties.map(p => p.id)],
    queryFn: async () => {
      if (properties.length === 0) return {};
      const { data, error } = await supabase
        .from('students')
        .select('property_id, status');
      if (error) throw error;
      const counts: Record<string, number> = {};
      data?.forEach(s => {
        if (!s.property_id) return;
        if (s.status && s.status !== 'active') return;
        counts[s.property_id] = (counts[s.property_id] || 0) + 1;
      });
      return counts;
    },
    enabled: properties.length > 0,
  });

  const studentsCounts = studentsQuery.data || {};

  // Blocks management state
  const [blocksForProperty, setBlocksForProperty] = useState<any[]>([]);
  const [blocksLoading, setBlocksLoading] = useState(false);
  const [newBlockName, setNewBlockName] = useState("");
  const [newBlockFloors, setNewBlockFloors] = useState("1");

  const filteredProperties = properties.filter(p =>
    searchQuery === "" ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ name: "", address: "", city: "", state: "", pincode: "", total_capacity: 0, status: "active" });
  };

  const openAddDialog = () => {
    resetForm();
    setSelectedProperty(null);
    setDialogMode("add");
  };

  const openEditDialog = (property: Property) => {
    setSelectedProperty(property);
    setFormData({
      name: property.name,
      address: property.address || "",
      city: property.city || "",
      state: property.state || "",
      pincode: property.pincode || "",
      total_capacity: property.total_capacity || 0,
      status: property.status || "active",
    });
    setDialogMode("edit");
  };

  const openViewDialog = (property: Property) => {
    setSelectedProperty(property);
    setDialogMode("view");
  };

  const openBlocksDialog = async (property: Property) => {
    setSelectedProperty(property);
    setDialogMode("blocks");
    setBlocksLoading(true);
    try {
      const { data, error } = await supabase
        .from('blocks')
        .select('*')
        .eq('property_id', property.id)
        .order('name');
      if (error) throw error;
      setBlocksForProperty(data || []);
    } catch {
      toast({ title: "Error", description: "Failed to load blocks", variant: "destructive" });
    } finally {
      setBlocksLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Property name is required", variant: "destructive" });
      return;
    }
    if (dialogMode === "add") {
      await createProperty.mutateAsync({
        name: formData.name,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        pincode: formData.pincode || null,
        total_capacity: formData.total_capacity,
        status: formData.status,
      });
    } else if (dialogMode === "edit" && selectedProperty) {
      await updateProperty.mutateAsync({
        id: selectedProperty.id,
        name: formData.name,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        pincode: formData.pincode || null,
        total_capacity: formData.total_capacity,
        status: formData.status,
      });
    }
    setDialogMode(null);
  };

  const handleDelete = async () => {
    if (!propertyToDelete) return;
    await deleteProperty.mutateAsync(propertyToDelete.id);
    setDeleteDialogOpen(false);
    setPropertyToDelete(null);
  };

  const handleAddBlock = async () => {
    if (!newBlockName.trim() || !selectedProperty) return;
    try {
      const { data, error } = await supabase
        .from('blocks')
        .insert({
          name: newBlockName,
          property_id: selectedProperty.id,
          floor_count: parseInt(newBlockFloors) || 1,
        })
        .select()
        .single();
      if (error) throw error;

      // Create floors for the block
      const floorCount = parseInt(newBlockFloors) || 1;
      for (let i = 1; i <= floorCount; i++) {
        await supabase.from('floors').insert({
          block_id: data.id,
          floor_number: i,
          name: `Floor ${i}`,
        });
      }

      setBlocksForProperty(prev => [...prev, data]);
      setNewBlockName("");
      setNewBlockFloors("1");
      toast({ title: "Block Created", description: `Block "${data.name}" with ${floorCount} floor(s) added.` });
    } catch {
      toast({ title: "Error", description: "Failed to create block", variant: "destructive" });
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    try {
      const { error } = await supabase.from('blocks').delete().eq('id', blockId);
      if (error) throw error;
      setBlocksForProperty(prev => prev.filter(b => b.id !== blockId));
      toast({ title: "Block Deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete block. It may have rooms assigned.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Properties</h1>
            <p className="text-muted-foreground">Manage your hostel properties and blocks</p>
          </div>
          <Button className="gradient-primary text-white" onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Property Cards */}
        {filteredProperties.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Properties Found</h3>
              <p className="text-muted-foreground mb-4">
                {properties.length === 0 ? "Add your first property to get started" : "Try adjusting your search"}
              </p>
              {properties.length === 0 && (
                <Button className="gradient-primary text-white" onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredProperties.map((property) => (
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
                          {[property.address, property.city, property.state].filter(Boolean).join(", ") || "No address"}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover">
                        <DropdownMenuItem onClick={() => openViewDialog(property)}>
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(property)}>
                          <Pencil className="h-4 w-4 mr-2" /> Edit Property
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openBlocksDialog(property)}>
                          <Layers className="h-4 w-4 mr-2" /> Manage Blocks
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => { setPropertyToDelete(property); setDeleteDialogOpen(true); }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <Building2 className="h-4 w-4 mx-auto mb-1 text-primary" />
                      <p className="text-lg font-semibold">{blocksCounts[property.id] || 0}</p>
                      <p className="text-xs text-muted-foreground">Blocks</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
                      <p className="text-lg font-semibold">{roomsCounts[property.id] || 0}</p>
                      <p className="text-xs text-muted-foreground">Rooms</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <BedDouble className="h-4 w-4 mx-auto mb-1 text-primary" />
                      <p className="text-lg font-semibold">{property.total_capacity || 0}</p>
                      <p className="text-xs text-muted-foreground">Capacity</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Occupied</span>
                      <span className="text-sm font-semibold">
                        {property.total_capacity ? Math.round(((property.occupied_beds || 0) / property.total_capacity) * 100) : 0}%
                      </span>
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
        )}

      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogMode === "add" || dialogMode === "edit"} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent className="bg-background sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialogMode === "add" ? "Add New Property" : "Edit Property"}</DialogTitle>
            <DialogDescription>
              {dialogMode === "add" ? "Enter the details for your new hostel property." : "Update the property details."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name">Property Name *</Label>
              <Input id="name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Sunrise Hostel" />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={formData.address} onChange={e => setFormData(f => ({ ...f, address: e.target.value }))} placeholder="Street address" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" value={formData.city} onChange={e => setFormData(f => ({ ...f, city: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input id="state" value={formData.state} onChange={e => setFormData(f => ({ ...f, state: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" value={formData.pincode} onChange={e => setFormData(f => ({ ...f, pincode: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="capacity">Total Capacity</Label>
                <Input id="capacity" type="number" value={formData.total_capacity} onChange={e => setFormData(f => ({ ...f, total_capacity: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData(f => ({ ...f, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogMode(null)}>Cancel</Button>
            <Button
              className="gradient-primary text-white"
              onClick={handleSubmit}
              disabled={createProperty.isPending || updateProperty.isPending}
            >
              {(createProperty.isPending || updateProperty.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {dialogMode === "add" ? "Create Property" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={dialogMode === "view"} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent className="bg-background sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Property Details</DialogTitle>
          </DialogHeader>
          {selectedProperty && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-lg gradient-primary flex items-center justify-center">
                  <Building2 className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedProperty.name}</h3>
                  <Badge variant={selectedProperty.status === "active" ? "default" : "secondary"} className={selectedProperty.status === "active" ? "bg-green-500/10 text-green-600" : ""}>
                    {selectedProperty.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Address</p>
                  <p className="font-medium">{selectedProperty.address || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">City</p>
                  <p className="font-medium">{selectedProperty.city || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">State</p>
                  <p className="font-medium">{selectedProperty.state || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pincode</p>
                  <p className="font-medium">{selectedProperty.pincode || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Capacity</p>
                  <p className="font-medium">{selectedProperty.total_capacity || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Occupied Beds</p>
                  <p className="font-medium">{selectedProperty.occupied_beds || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Blocks</p>
                  <p className="font-medium">{blocksCounts[selectedProperty.id] || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rooms</p>
                  <p className="font-medium">{roomsCounts[selectedProperty.id] || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(selectedProperty.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogMode(null)}>Close</Button>
            <Button className="gradient-primary text-white" onClick={() => selectedProperty && openEditDialog(selectedProperty)}>
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Blocks Dialog */}
      <Dialog open={dialogMode === "blocks"} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent className="bg-background sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Blocks — {selectedProperty?.name}</DialogTitle>
            <DialogDescription>Add or remove blocks for this property.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Add Block */}
            <div className="flex gap-2">
              <Input
                placeholder="Block name (e.g. Block A)"
                value={newBlockName}
                onChange={e => setNewBlockName(e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Floors"
                value={newBlockFloors}
                onChange={e => setNewBlockFloors(e.target.value)}
                className="w-20"
                min={1}
              />
              <Button onClick={handleAddBlock} disabled={!newBlockName.trim()} className="gradient-primary text-white">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Block List */}
            {blocksLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : blocksForProperty.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">No blocks yet. Add one above.</p>
            ) : (
              <div className="space-y-2">
                {blocksForProperty.map(block => (
                  <div key={block.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
                    <div>
                      <p className="font-medium">{block.name}</p>
                      <p className="text-xs text-muted-foreground">{block.floor_count || 1} floor(s)</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteBlock(block.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogMode(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{propertyToDelete?.name}"? This will also remove all associated blocks, rooms, and beds. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteProperty.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Properties;
