import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ProgramCard } from "./dashboard";
import { getSportIcon } from "@/lib/sport-icons";
import type { ProgramWithDetails, Sport } from "@shared/schema";

export default function Browse() {
  const [search, setSearch] = useState("");
  const [sportId, setSportId] = useState<string>("");
  const [ageMin, setAgeMin] = useState<string>("");
  const [ageMax, setAgeMax] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const queryParams = new URLSearchParams();
  if (search) queryParams.set("search", search);
  if (sportId) queryParams.set("sportId", sportId);
  if (ageMin) queryParams.set("ageMin", ageMin);
  if (ageMax) queryParams.set("ageMax", ageMax);
  if (gender) queryParams.set("gender", gender);

  const { data: programs = [], isLoading } = useQuery<ProgramWithDetails[]>({
    queryKey: ["/api/programs", `?${queryParams.toString()}`],
  });

  const { data: sports = [] } = useQuery<Sport[]>({
    queryKey: ["/api/sports"],
  });

  const hasFilters = sportId || ageMin || ageMax || gender || search;

  const clearFilters = () => {
    setSearch("");
    setSportId("");
    setAgeMin("");
    setAgeMax("");
    setGender("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Browse Programs</h1>
        <p className="text-muted-foreground mt-1">
          Find the perfect sport or activity for your child
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              data-testid="input-search-programs"
              placeholder="Search programs, sports, or leagues..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="secondary"
            size="default"
            onClick={() => setShowFilters(!showFilters)}
            data-testid="button-toggle-filters"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {hasFilters && (
              <Badge variant="default" className="ml-2 text-xs">
                Active
              </Badge>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-card rounded-md border border-card-border">
            <div className="space-y-2">
              <Label>Sport</Label>
              <Select value={sportId} onValueChange={setSportId}>
                <SelectTrigger data-testid="select-sport-filter">
                  <SelectValue placeholder="All sports" />
                </SelectTrigger>
                <SelectContent>
                  {sports.map((sport) => {
                    const Icon = getSportIcon(sport.icon);
                    return (
                      <SelectItem key={sport.id} value={sport.id}>
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {sport.name}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Minimum Age</Label>
              <Select value={ageMin} onValueChange={setAgeMin}>
                <SelectTrigger data-testid="select-age-min">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 15 }, (_, i) => i + 3).map((age) => (
                    <SelectItem key={age} value={age.toString()}>
                      {age} years
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Maximum Age</Label>
              <Select value={ageMax} onValueChange={setAgeMax}>
                <SelectTrigger data-testid="select-age-max">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 15 }, (_, i) => i + 3).map((age) => (
                    <SelectItem key={age} value={age.toString()}>
                      {age} years
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger data-testid="select-gender-filter">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="coed">Co-ed</SelectItem>
                  <SelectItem value="male">Boys</SelectItem>
                  <SelectItem value="female">Girls</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasFilters && (
              <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                  <X className="h-4 w-4 mr-1" />
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        )}

        {!showFilters && sports.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {sports.slice(0, 8).map((sport) => {
              const Icon = getSportIcon(sport.icon);
              const isActive = sportId === sport.id;
              return (
                <Button
                  key={sport.id}
                  variant={isActive ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setSportId(isActive ? "" : sport.id)}
                  data-testid={`button-sport-filter-${sport.id}`}
                >
                  <Icon className="h-4 w-4 mr-1.5" />
                  {sport.name}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-md" />
          ))}
        </div>
      ) : programs.length === 0 ? (
        <div className="text-center py-16">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">No programs found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search term
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground" data-testid="text-program-count">
              {programs.length} program{programs.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
