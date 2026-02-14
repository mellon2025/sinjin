
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // === AUTH SETUP ===
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production" },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) return done(null, false);
        const isValid = await comparePasswords(password, user.password);
        if (!isValid) return done(null, false);
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // === SEED DATA ===
  // Seed the admin user if not exists
  const adminUsername = "Melon2026";
  const existingAdmin = await storage.getUserByUsername(adminUsername);
  if (!existingAdmin) {
    const hashedPassword = await hashPassword("Aaallliii555###");
    await storage.createUser({
      username: adminUsername,
      password: hashedPassword,
      role: "admin",
    });
    console.log("Admin user seeded.");
  }

  // === ROUTES ===

  // Auth Routes
  app.post(api.auth.login.path, (req, res, next) => {
    passport.authenticate("local", (err: any, user: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      req.login(user, (err) => {
        if (err) return next(err);
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.logout(() => {
      res.sendStatus(200);
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByUsername(input.username);
      if (existing) {
        return res.status(400).json({ message: "Username already taken" });
      }
      const hashedPassword = await hashPassword(input.password);
      const user = await storage.createUser({ ...input, password: hashedPassword });
      req.login(user, (err) => {
        if (err) throw err;
        res.status(201).json(user);
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Teams Routes
  app.get(api.teams.list.path, async (req, res) => {
    const teams = await storage.getTeams();
    res.json(teams);
  });

  app.post(api.teams.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.teams.create.input.parse(req.body);
      const team = await storage.createTeam(input);
      
      // Add creator to team as founder
      await storage.updateUserTeam((req.user as any).id, team.id, 'founder');
      
      res.status(201).json(team);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Server error" });
      }
    }
  });

  app.get(api.teams.get.path, async (req, res) => {
    const team = await storage.getTeam(Number(req.params.id));
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json(team);
  });

  app.put(api.teams.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Check permissions (admin or team founder) - simplified for MVP
    const team = await storage.updateTeam(Number(req.params.id), req.body);
    res.json(team);
  });

  app.delete(api.teams.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteTeam(Number(req.params.id));
    res.sendStatus(204);
  });

  app.post(api.teams.join.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const teamId = Number(req.params.id);
    const team = await storage.getTeam(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });
    
    // Logic for invite code if needed
    if (team.type === 'invite_only') {
      if (req.body.inviteCode !== team.inviteCode) {
        return res.status(400).json({ message: "Invalid invite code" });
      }
    }

    const updatedUser = await storage.updateUserTeam((req.user as any).id, teamId, 'member');
    res.json(updatedUser);
  });

  // Categories Routes
  app.get(api.categories.list.path, async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.post(api.categories.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const category = await storage.createCategory(req.body);
      res.status(201).json(category);
    } catch (err) {
      res.status(400).json({ message: "Error creating category" });
    }
  });

  app.delete(api.categories.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteCategory(Number(req.params.id));
    res.sendStatus(204);
  });

  // Questions Routes
  app.get(api.questions.list.path, async (req, res) => {
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    const questions = await storage.getQuestions(categoryId);
    res.json(questions);
  });

  app.post(api.questions.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const question = await storage.createQuestion(req.body);
      res.status(201).json(question);
    } catch (err) {
      res.status(400).json({ message: "Error creating question" });
    }
  });

  app.delete(api.questions.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteQuestion(Number(req.params.id));
    res.sendStatus(204);
  });

  // Settings Routes
  app.get(api.settings.get.path, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.put(api.settings.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const settings = await storage.updateSettings(req.body);
    res.json(settings);
  });

  return httpServer;
}
