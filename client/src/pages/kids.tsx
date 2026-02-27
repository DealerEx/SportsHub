import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  X,
} from "lucide-react";
import type { Child, Sport } from "@shared/schema";
import { getAgeFromBirthdate } from "@shared/schema";

const AVAILABLE_SPORTS = [
  "Soccer", "Basketball", "Baseball", "Football", "Volleyball",
  "Track & Field", "Swimming", "Gymnastics", "Tennis", "Wrestling",
  "Cheerleading", "Dance", "Martial Arts", "Ice Hockey", "Softball",
  "Cross Country Running", "Lacrosse", "Golf", "Skateboarding",
  "Cycling / BMX", "Skiing / Snowboarding", "Rugby", "Field Hockey",
  "Surfing", "Rock Climbing / Bouldering", "Cheer & Tumbling / Acrobatics",
  "Equestrian / Horseback Riding", "Bowling", "Ultimate Frisbee", "Table Tennis",
];

export default function Kids() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);

  const { data: children = [], isLoading } = useQuery<Child[]>({
    queryKey: ["/api/children"],
  });

  const [formName, setFormName] = useState("");
  const [formBirthdate, setFormBirthdate] = useState("");
  const [formGender, setFormGender] = useState("");
  const [formInterests, setFormInterests] = useState<string[]>([]);

  const resetForm = () => {
    setFormName("");
    setFormBirthdate("");
    setFormGender("");
    setFormInterests([]);
    setEditingChild(null);
  };

  const openEdit = (child: Child) => {
    setEditingChild(child);
    setFormName(child.name);
    setFormBirthdate(child.birthdate);
    setFormGender(child.gender);
    setFormInterests([...child.interests]);
    setDialogOpen(true);
  };

  const openAdd = () => {
    resetForm();
    setDialogOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; birthdate: string; gender: string; interests: string[] }) => {
      await apiRequest("POST", "/api/children", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      queryClient.invalidateQueries({ queryKey: ["/api/matching-programs"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Child added successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to add child", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PATCH", `/api/children/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      queryClient.invalidateQueries({ queryKey: ["/api/matching-programs"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Child updated successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to update", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/children/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/children"] });
      queryClient.invalidateQueries({ queryKey: ["/api/matching-programs"] });
      toast({ title: "Child removed" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to remove", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formName,
      birthdate: formBirthdate,
      gender: formGender,
      interests: formInterests,
    };

    if (editingChild) {
      updateMutation.mutate({ id: editingChild.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const toggleInterest = (sport: string) => {
    setFormInterests((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Kids</h1>
          <p className="text-muted-foreground mt-1">
            Manage your children's profiles and interests
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={openAdd} data-testid="button-add-child">
              <Plus className="h-4 w-4 mr-2" />
              Add Child
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingChild ? "Edit Child" : "Add a Child"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="child-name">Name</Label>
                <Input
                  id="child-name"
                  data-testid="input-child-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Emma"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="child-birthdate">Birthdate</Label>
                <Input
                  id="child-birthdate"
                  data-testid="input-child-birthdate"
                  type="date"
                  value={formBirthdate}
                  onChange={(e) => setFormBirthdate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  min="2005-01-01"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={formGender} onValueChange={setFormGender} required>
                  <SelectTrigger data-testid="select-child-gender">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sporting Interests</Label>
                <p className="text-xs text-muted-foreground">
                  Select sports your child is interested in
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {AVAILABLE_SPORTS.map((sport) => {
                    const isSelected = formInterests.includes(sport);
                    return (
                      <Badge
                        key={sport}
                        variant={isSelected ? "default" : "secondary"}
                        className="cursor-pointer select-none"
                        onClick={() => toggleInterest(sport)}
                        data-testid={`badge-interest-${sport.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {sport}
                        {isSelected && <X className="h-3 w-3 ml-1" />}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                data-testid="button-submit-child"
                disabled={createMutation.isPending || updateMutation.isPending || !formName || !formBirthdate || !formGender || formInterests.length === 0}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : editingChild
                  ? "Save Changes"
                  : "Add Child"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-md" />
          ))}
        </div>
      ) : children.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No children added yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Add your children's profiles so we can match them with the best sports programs in your area.
            </p>
            <Button onClick={openAdd} data-testid="button-add-first-child-empty">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Child
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {children.map((child) => (
            <Card key={child.id} data-testid={`card-child-${child.id}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
                      {child.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" data-testid={`text-kid-name-${child.id}`}>{child.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Age {getAgeFromBirthdate(child.birthdate)} &middot; {child.gender.charAt(0).toUpperCase() + child.gender.slice(1)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider">
                    Interests
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {child.interests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEdit(child)}
                    data-testid={`button-edit-child-${child.id}`}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => deleteMutation.mutate(child.id)}
                    data-testid={`button-delete-child-${child.id}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
