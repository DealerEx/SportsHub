import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Users,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  ArrowLeft,
  Star,
  ChevronRight,
} from "lucide-react";
import { getSportIcon } from "@/lib/sport-icons";
import type { ProgramWithDetails } from "@shared/schema";
import { format, differenceInDays } from "date-fns";

export default function ProgramDetail() {
  const [, params] = useRoute("/program/:id");
  const programId = params?.id;

  const { data: program, isLoading } = useQuery<ProgramWithDetails>({
    queryKey: ["/api/programs", programId],
    enabled: !!programId,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-md" />
        <Skeleton className="h-48 rounded-md" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-2">Program not found</h2>
        <Link href="/browse">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to browse
          </Button>
        </Link>
      </div>
    );
  }

  const SportIcon = getSportIcon(program.sport.icon);
  const regOpen = new Date(program.registrationOpen);
  const regClose = new Date(program.registrationClose);
  const progStart = new Date(program.programStart);
  const progEnd = new Date(program.programEnd);
  const now = new Date();
  const isRegistrationOpen = now >= regOpen && now <= regClose;
  const daysUntilClose = differenceInDays(regClose, now);
  const isClosingSoon = daysUntilClose <= 7 && daysUntilClose >= 0;
  const spotsLow = program.spotsLeft !== null && program.spotsLeft <= 10;
  const ratingStars = program.league.rating ? (program.league.rating / 10).toFixed(1) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/browse">
          <Button variant="ghost" size="sm" data-testid="button-back-browse">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Browse
          </Button>
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span>{program.sport.name}</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{program.name}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="h-14 w-14 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
          <SportIcon className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="secondary">{program.sport.name}</Badge>
            <Badge variant="secondary">{program.season}</Badge>
            {program.gender !== "coed" && (
              <Badge variant="secondary">{program.gender === "male" ? "Boys" : "Girls"}</Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-1" data-testid="text-program-name">
            {program.name}
          </h1>
          <p className="text-muted-foreground">{program.league.name}</p>
        </div>
      </div>

      {isRegistrationOpen && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                  <h3 className="font-semibold text-primary">Registration Open</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isClosingSoon
                    ? `Closes in ${daysUntilClose} day${daysUntilClose !== 1 ? "s" : ""} - don't miss out!`
                    : `Open until ${format(regClose, "MMMM d, yyyy")}`}
                </p>
                {spotsLow && program.spotsLeft !== null && (
                  <p className="text-sm text-destructive font-medium mt-1">
                    Only {program.spotsLeft} spots remaining
                  </p>
                )}
              </div>
              {program.league.website && (
                <Button data-testid="button-register-external" asChild>
                  <a href={program.league.website} target="_blank" rel="noopener noreferrer">
                    Register Now
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <h2 className="font-semibold text-lg mb-2">About this program</h2>
            <p className="text-muted-foreground leading-relaxed">{program.description}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailItem icon={<Users className="h-4 w-4" />} label="Ages" value={`${program.ageMin} - ${program.ageMax} years old`} />
            <DetailItem icon={<DollarSign className="h-4 w-4" />} label="Cost" value={`$${program.cost}`} />
            <DetailItem icon={<MapPin className="h-4 w-4" />} label="Location" value={program.location} />
            <DetailItem icon={<Users className="h-4 w-4" />} label="Gender" value={program.gender === "coed" ? "Co-ed" : program.gender === "male" ? "Boys only" : "Girls only"} />
            {program.maxParticipants && (
              <DetailItem
                icon={<Users className="h-4 w-4" />}
                label="Capacity"
                value={`${program.spotsLeft ?? 0} of ${program.maxParticipants} spots available`}
              />
            )}
            <DetailItem icon={<Calendar className="h-4 w-4" />} label="Season" value={program.season} />
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3">Important Dates</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DateBlock
                label="Registration Opens"
                date={format(regOpen, "MMM d, yyyy")}
                isPast={now > regOpen}
              />
              <DateBlock
                label="Registration Closes"
                date={format(regClose, "MMM d, yyyy")}
                isUrgent={isClosingSoon}
                isPast={now > regClose}
              />
              <DateBlock
                label="Program Starts"
                date={format(progStart, "MMM d, yyyy")}
                isPast={now > progStart}
              />
              <DateBlock
                label="Program Ends"
                date={format(progEnd, "MMM d, yyyy")}
                isPast={now > progEnd}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="font-semibold text-lg">{program.league.name}</h2>
              <p className="text-sm text-muted-foreground">
                {program.league.city}, {program.league.state}
              </p>
              {ratingStars && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium">{ratingStars}</span>
                  <span className="text-sm text-muted-foreground">
                    ({program.league.reviewCount} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{program.league.description}</p>
          <div className="flex flex-wrap gap-3">
            {program.league.website && (
              <Button variant="secondary" size="sm" asChild data-testid="link-league-website">
                <a href={program.league.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4 mr-1.5" />
                  Website
                </a>
              </Button>
            )}
            {program.league.phone && (
              <Button variant="secondary" size="sm" asChild>
                <a href={`tel:${program.league.phone}`}>
                  <Phone className="h-4 w-4 mr-1.5" />
                  {program.league.phone}
                </a>
              </Button>
            )}
            {program.league.email && (
              <Button variant="secondary" size="sm" asChild>
                <a href={`mailto:${program.league.email}`}>
                  <Mail className="h-4 w-4 mr-1.5" />
                  Email
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function DateBlock({
  label,
  date,
  isUrgent,
  isPast,
}: {
  label: string;
  date: string;
  isUrgent?: boolean;
  isPast?: boolean;
}) {
  return (
    <div className={`p-3 rounded-md border ${isUrgent ? "border-destructive/30 bg-destructive/5" : isPast ? "border-border bg-muted/30" : "border-border bg-card"}`}>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className={`text-sm font-medium ${isUrgent ? "text-destructive" : isPast ? "text-muted-foreground" : ""}`}>
        {date}
      </p>
    </div>
  );
}
