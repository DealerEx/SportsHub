import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth } from "./auth";
import { seedDatabase } from "./seed";
import { insertChildSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  await seedDatabase();

  app.get("/api/sports", async (_req, res) => {
    const allSports = await storage.getSports();
    res.json(allSports);
  });

  app.get("/api/leagues", async (_req, res) => {
    const allLeagues = await storage.getLeagues();
    res.json(allLeagues);
  });

  app.get("/api/leagues/:id", async (req, res) => {
    const league = await storage.getLeague(req.params.id);
    if (!league) return res.status(404).json({ message: "League not found" });
    res.json(league);
  });

  app.get("/api/programs", async (req, res) => {
    const filters = {
      sportId: req.query.sportId as string | undefined,
      ageMin: req.query.ageMin ? parseInt(req.query.ageMin as string) : undefined,
      ageMax: req.query.ageMax ? parseInt(req.query.ageMax as string) : undefined,
      gender: req.query.gender as string | undefined,
      search: req.query.search as string | undefined,
      zipCode: req.query.zipCode as string | undefined,
    };
    const allPrograms = await storage.getPrograms(filters);
    res.json(allPrograms);
  });

  app.get("/api/programs/:id", async (req, res) => {
    const program = await storage.getProgram(req.params.id);
    if (!program) return res.status(404).json({ message: "Program not found" });
    res.json(program);
  });

  app.get("/api/children", requireAuth, async (req, res) => {
    const user = req.user as any;
    const userChildren = await storage.getChildren(user.id);
    res.json(userChildren);
  });

  app.post("/api/children", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const parsed = insertChildSchema.parse(req.body);
      const child = await storage.createChild(user.id, parsed);
      res.json(child);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/children/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const child = await storage.getChild(req.params.id);
      if (!child) return res.status(404).json({ message: "Child not found" });
      if (child.userId !== user.id) return res.status(403).json({ message: "Forbidden" });
      const updated = await storage.updateChild(req.params.id, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/children/:id", requireAuth, async (req, res) => {
    const user = req.user as any;
    const child = await storage.getChild(req.params.id);
    if (!child) return res.status(404).json({ message: "Child not found" });
    if (child.userId !== user.id) return res.status(403).json({ message: "Forbidden" });
    await storage.deleteChild(req.params.id);
    res.json({ message: "Deleted" });
  });

  app.get("/api/notifications", requireAuth, async (req, res) => {
    const user = req.user as any;
    const userNotifications = await storage.getNotifications(user.id);
    res.json(userNotifications);
  });

  app.get("/api/notifications/count", requireAuth, async (req, res) => {
    const user = req.user as any;
    const count = await storage.getUnreadNotificationCount(user.id);
    res.json({ count });
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    await storage.markNotificationRead(req.params.id);
    res.json({ message: "Marked as read" });
  });

  app.patch("/api/notifications/read-all", requireAuth, async (req, res) => {
    const user = req.user as any;
    await storage.markAllNotificationsRead(user.id);
    res.json({ message: "All marked as read" });
  });

  app.get("/api/matching-programs", requireAuth, async (req, res) => {
    const user = req.user as any;
    const matching = await storage.getMatchingPrograms(user.id);
    res.json(matching);
  });

  return httpServer;
}
