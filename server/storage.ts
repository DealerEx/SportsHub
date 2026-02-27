import {
  type User, type InsertUser,
  type Child, type InsertChild,
  type Sport, type InsertSport,
  type League, type InsertLeague,
  type Program, type InsertProgram,
  type Notification, type InsertNotification,
  type ProgramWithDetails,
  users, children, sports, leagues, programs, notifications,
  getAgeFromBirthdate,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, ilike, inArray, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getChildren(userId: string): Promise<Child[]>;
  getChild(id: string): Promise<Child | undefined>;
  createChild(userId: string, child: InsertChild): Promise<Child>;
  updateChild(id: string, child: Partial<InsertChild>): Promise<Child>;
  deleteChild(id: string): Promise<void>;

  getSports(): Promise<Sport[]>;
  getSport(id: string): Promise<Sport | undefined>;
  createSport(sport: InsertSport): Promise<Sport>;

  getLeagues(): Promise<League[]>;
  getLeague(id: string): Promise<League | undefined>;
  createLeague(league: InsertLeague): Promise<League>;

  getPrograms(filters?: {
    sportId?: string;
    ageMin?: number;
    ageMax?: number;
    gender?: string;
    search?: string;
    zipCode?: string;
  }): Promise<ProgramWithDetails[]>;
  getProgram(id: string): Promise<ProgramWithDetails | undefined>;
  createProgram(program: InsertProgram): Promise<Program>;

  getNotifications(userId: string): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<void>;
  markAllNotificationsRead(userId: string): Promise<void>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUnreadNotificationCount(userId: string): Promise<number>;

  getMatchingPrograms(userId: string): Promise<ProgramWithDetails[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getChildren(userId: string): Promise<Child[]> {
    return db.select().from(children).where(eq(children.userId, userId));
  }

  async getChild(id: string): Promise<Child | undefined> {
    const [child] = await db.select().from(children).where(eq(children.id, id));
    return child;
  }

  async createChild(userId: string, child: InsertChild): Promise<Child> {
    const [newChild] = await db.insert(children).values({ ...child, userId }).returning();
    return newChild;
  }

  async updateChild(id: string, child: Partial<InsertChild>): Promise<Child> {
    const [updated] = await db.update(children).set(child).where(eq(children.id, id)).returning();
    return updated;
  }

  async deleteChild(id: string): Promise<void> {
    await db.delete(children).where(eq(children.id, id));
  }

  async getSports(): Promise<Sport[]> {
    return db.select().from(sports);
  }

  async getSport(id: string): Promise<Sport | undefined> {
    const [sport] = await db.select().from(sports).where(eq(sports.id, id));
    return sport;
  }

  async createSport(sport: InsertSport): Promise<Sport> {
    const [newSport] = await db.insert(sports).values(sport).returning();
    return newSport;
  }

  async getLeagues(): Promise<League[]> {
    return db.select().from(leagues);
  }

  async getLeague(id: string): Promise<League | undefined> {
    const [league] = await db.select().from(leagues).where(eq(leagues.id, id));
    return league;
  }

  async createLeague(league: InsertLeague): Promise<League> {
    const [newLeague] = await db.insert(leagues).values(league).returning();
    return newLeague;
  }

  async getPrograms(filters?: {
    sportId?: string;
    ageMin?: number;
    ageMax?: number;
    gender?: string;
    search?: string;
    zipCode?: string;
  }): Promise<ProgramWithDetails[]> {
    let conditions: any[] = [];

    if (filters?.sportId) {
      conditions.push(eq(programs.sportId, filters.sportId));
    }
    if (filters?.ageMin !== undefined) {
      conditions.push(gte(programs.ageMax, filters.ageMin));
    }
    if (filters?.ageMax !== undefined) {
      conditions.push(lte(programs.ageMin, filters.ageMax));
    }
    if (filters?.gender && filters.gender !== "all") {
      conditions.push(
        sql`(${programs.gender} = ${filters.gender} OR ${programs.gender} = 'coed')`
      );
    }
    if (filters?.search) {
      conditions.push(
        sql`(${programs.name} ILIKE ${'%' + filters.search + '%'} OR ${programs.description} ILIKE ${'%' + filters.search + '%'})`
      );
    }

    const query = db
      .select()
      .from(programs)
      .innerJoin(leagues, eq(programs.leagueId, leagues.id))
      .innerJoin(sports, eq(programs.sportId, sports.id));

    const rows = conditions.length > 0
      ? await query.where(and(...conditions))
      : await query;

    return rows.map(row => ({
      ...row.programs,
      league: row.leagues,
      sport: row.sports,
    }));
  }

  async getProgram(id: string): Promise<ProgramWithDetails | undefined> {
    const [row] = await db
      .select()
      .from(programs)
      .innerJoin(leagues, eq(programs.leagueId, leagues.id))
      .innerJoin(sports, eq(programs.sportId, sports.id))
      .where(eq(programs.id, id));

    if (!row) return undefined;

    return {
      ...row.programs,
      league: row.leagues,
      sport: row.sports,
    };
  }

  async createProgram(program: InsertProgram): Promise<Program> {
    const [newProgram] = await db.insert(programs).values(program).returning();
    return newProgram;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(sql`${notifications.createdAt} DESC`);
  }

  async markNotificationRead(id: string): Promise<void> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.userId, userId));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
    return result?.count ?? 0;
  }

  async getMatchingPrograms(userId: string): Promise<ProgramWithDetails[]> {
    const userChildren = await this.getChildren(userId);
    if (userChildren.length === 0) return [];

    const allInterests = [...new Set(userChildren.flatMap(c => c.interests))];
    if (allInterests.length === 0) return [];

    const matchingSports = await db
      .select()
      .from(sports)
      .where(
        sql`LOWER(${sports.name}) IN (${sql.join(allInterests.map(i => sql`LOWER(${i})`), sql`, `)})`
      );

    if (matchingSports.length === 0) return [];

    const sportIds = matchingSports.map(s => s.id);

    const rows = await db
      .select()
      .from(programs)
      .innerJoin(leagues, eq(programs.leagueId, leagues.id))
      .innerJoin(sports, eq(programs.sportId, sports.id))
      .where(inArray(programs.sportId, sportIds));

    const result = rows.map(row => ({
      ...row.programs,
      league: row.leagues,
      sport: row.sports,
    }));

    return result.filter(program => {
      return userChildren.some(child => {
        const childInterests = child.interests.map(i => i.toLowerCase());
        const sportMatch = childInterests.includes(program.sport.name.toLowerCase());
        const childAge = getAgeFromBirthdate(child.birthdate);
        const ageMatch = childAge >= program.ageMin && childAge <= program.ageMax;
        const genderMatch = program.gender === "coed" || program.gender === child.gender.toLowerCase();
        return sportMatch && ageMatch && genderMatch;
      });
    });
  }
}

export const storage = new DatabaseStorage();
