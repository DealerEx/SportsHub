import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  zipCode: text("zip_code").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  zipCode: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const children = pgTable("children", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  birthdate: date("birthdate").notNull(),
  gender: text("gender").notNull(),
  interests: text("interests").array().notNull(),
});

export const insertChildSchema = createInsertSchema(children).pick({
  name: true,
  birthdate: true,
  gender: true,
  interests: true,
});

export function getAgeFromBirthdate(birthdate: string): number {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export type InsertChild = z.infer<typeof insertChildSchema>;
export type Child = typeof children.$inferSelect;

export const sports = pgTable("sports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  icon: text("icon").notNull(),
  category: text("category").notNull(),
});

export const insertSportSchema = createInsertSchema(sports).pick({
  name: true,
  icon: true,
  category: true,
});

export type InsertSport = z.infer<typeof insertSportSchema>;
export type Sport = typeof sports.$inferSelect;

export const leagues = pgTable("leagues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  website: text("website"),
  phone: text("phone"),
  email: text("email"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  logoUrl: text("logo_url"),
  rating: integer("rating").default(0),
  reviewCount: integer("review_count").default(0),
});

export const insertLeagueSchema = createInsertSchema(leagues).pick({
  name: true,
  description: true,
  website: true,
  phone: true,
  email: true,
  city: true,
  state: true,
  zipCode: true,
  logoUrl: true,
});

export type InsertLeague = z.infer<typeof insertLeagueSchema>;
export type League = typeof leagues.$inferSelect;

export const programs = pgTable("programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leagueId: varchar("league_id").notNull(),
  sportId: varchar("sport_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  ageMin: integer("age_min").notNull(),
  ageMax: integer("age_max").notNull(),
  gender: text("gender").notNull(),
  season: text("season").notNull(),
  registrationOpen: date("registration_open").notNull(),
  registrationClose: date("registration_close").notNull(),
  programStart: date("program_start").notNull(),
  programEnd: date("program_end").notNull(),
  cost: integer("cost").notNull(),
  maxParticipants: integer("max_participants"),
  spotsLeft: integer("spots_left"),
  location: text("location").notNull(),
});

export const insertProgramSchema = createInsertSchema(programs).pick({
  leagueId: true,
  sportId: true,
  name: true,
  description: true,
  ageMin: true,
  ageMax: true,
  gender: true,
  season: true,
  registrationOpen: true,
  registrationClose: true,
  programStart: true,
  programEnd: true,
  cost: true,
  maxParticipants: true,
  spotsLeft: true,
  location: true,
});

export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type Program = typeof programs.$inferSelect;

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  programId: varchar("program_id"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  title: true,
  message: true,
  programId: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type ProgramWithDetails = Program & {
  league: League;
  sport: Sport;
};
