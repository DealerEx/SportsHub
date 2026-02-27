import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  Calendar,
  Users,
  Bell,
  ArrowRight,
  MapPin,
  DollarSign,
  Clock,
  Star,
} from "lucide-react";
import { getSportIcon } from "@/lib/sport-icons";
import type { ProgramWithDetails, Child } from "@shared/schema";
import { getAgeFromBirthdate } from "@shared/schema";
import { format, differenceInDays } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: children = [], isLoading: childrenLoading } = useQuery<Child[]>({
    queryKey: ["/api/children"],
  });

  const { data: matchingPrograms = [], isLoading: matchingLoading } = useQuery<ProgramWithDetails[]>({
    queryKey: ["/api/matching-programs"],
  });

  const { data: notifCount } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/count"],
  });

  const upcomingRegistrations = matchingPrograms
    .filter(p => new Date(p.registrationClose) >= new Date())
    .sort((a, b) => new Date(a.registrationClose).getTime() - new Date(b.registrationClose).getTime());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-welcome">
          Welcome back, {user?.username}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your kids' sports
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="My Kids"
          value={childrenLoading ? "-" : children.length.toString()}
          icon={<Users className="h-5 w-5" />}
          description={children.length === 0 ? "Add your first child" : `${children.flatMap(c => c.interests).length} interests tracked`}
        />
        <StatCard
          title="Matching Programs"
          value={matchingLoading ? "-" : matchingPrograms.length.toString()}
          icon={<Star className="h-5 w-5" />}
          description="Based on your kids' interests"
        />
        <StatCard
          title="Open Registrations"
          value={matchingLoading ? "-" : upcomingRegistrations.length.toString()}
          icon={<Calendar className="h-5 w-5" />}
          description="Sign-ups available now"
        />
        <StatCard
          title="Notifications"
          value={notifCount?.count?.toString() ?? "0"}
          icon={<Bell className="h-5 w-5" />}
          description="Unread alerts"
        />
      </div>

      {children.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Get started by adding your kids</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Add your children's profiles with their ages and sporting interests to get personalized program recommendations.
            </p>
            <Link href="/kids">
              <Button data-testid="button-add-first-child">
                Add Your Kids
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-xl font-semibold">Your Kids</h2>
              <Link href="/kids">
                <Button variant="ghost" size="sm" data-testid="link-manage-kids">
                  Manage
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((child) => (
                <Card key={child.id} className="hover-elevate">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-semibold text-lg" data-testid={`text-child-name-${child.id}`}>{child.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Age {getAgeFromBirthdate(child.birthdate)} &middot; {child.gender.charAt(0).toUpperCase() + child.gender.slice(1)}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                        {child.name.charAt(0)}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {child.interests.map((interest) => (
                        <Badge key={interest} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {upcomingRegistrations.length > 0 && (
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <h2 className="text-xl font-semibold">Recommended Programs</h2>
                <Link href="/browse">
                  <Button variant="ghost" size="sm" data-testid="link-browse-all">
                    Browse all
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingRegistrations.slice(0, 6).map((program) => (
                  <ProgramCard key={program.id} program={program} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-1 mb-3">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <div className="text-muted-foreground">{icon}</div>
        </div>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

function ProgramCard({ program }: { program: ProgramWithDetails }) {
  const SportIcon = getSportIcon(program.sport.icon);
  const daysUntilClose = differenceInDays(new Date(program.registrationClose), new Date());
  const isClosingSoon = daysUntilClose <= 7 && daysUntilClose >= 0;
  const spotsLow = program.spotsLeft !== null && program.spotsLeft <= 10;

  return (
    <Link href={`/program/${program.id}`}>
      <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-program-${program.id}`}>
        <CardContent className="p-5 flex flex-col h-full">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <SportIcon className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="secondary" className="text-xs">{program.sport.name}</Badge>
            </div>
            {isClosingSoon && (
              <Badge variant="destructive" className="text-xs flex-shrink-0">
                <Clock className="h-3 w-3 mr-1" />
                {daysUntilClose}d left
              </Badge>
            )}
          </div>

          <h3 className="font-semibold mb-1">{program.name}</h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
            {program.description}
          </p>

          <div className="space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{program.league.name}</span>
            </div>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Ages {program.ageMin}-{program.ageMax}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="font-medium text-foreground">${program.cost}</span>
              </div>
            </div>
            {spotsLow && program.spotsLeft !== null && (
              <p className="text-destructive font-medium text-xs">
                Only {program.spotsLeft} spots left!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export { ProgramCard };
