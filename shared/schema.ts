
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

// Users table - handles authentication and profile
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("user").notNull(), // 'admin', 'user'
  teamId: integer("team_id"), // Nullable, user might not be in a team yet
  teamRole: text("team_role"), // 'founder', 'supervisor', 'member'
  createdAt: timestamp("created_at").defaultNow(),
});

// Teams table
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull().default("#000000"),
  logoUrl: text("logo_url"), // URL to uploaded image
  type: text("type").notNull().default("open"), // 'open', 'invite_only'
  inviteCode: text("invite_code"),
  points: integer("points").default(0).notNull(),
  rank: integer("rank").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Categories for questions
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Questions table
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  categoryId: integer("category_id").notNull(), // Foreign key to categories
  points: integer("points").notNull().default(10),
  createdAt: timestamp("created_at").defaultNow(),
});

// Competition State / Settings (Singleton-like row or global settings)
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  timerDuration: integer("timer_duration").default(120), // in seconds
  currentRoundTeam1Id: integer("current_round_team1_id"),
  currentRoundTeam2Id: integer("current_round_team2_id"),
  timerActive: boolean("timer_active").default(false),
  timerStartTime: timestamp("timer_start_time"), // To calculate remaining time
  currentPhase: text("current_phase").default("idle"), // 'idle', 'team1_turn', 'team2_turn'
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ one }) => ({
  team: one(teams, {
    fields: [users.teamId],
    references: [teams.id],
  }),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  members: many(users),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  category: one(categories, {
    fields: [questions.categoryId],
    references: [categories.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  questions: many(questions),
}));

// === BASE SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertTeamSchema = createInsertSchema(teams).omit({ id: true, points: true, rank: true, createdAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true, createdAt: true });
export const insertQuestionSchema = createInsertSchema(questions).omit({ id: true, createdAt: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===

export type User = typeof users.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Settings = typeof settings.$inferSelect;

// Request types
export type CreateUserRequest = z.infer<typeof insertUserSchema>;
export type CreateTeamRequest = z.infer<typeof insertTeamSchema>;
export type UpdateTeamRequest = Partial<z.infer<typeof insertTeamSchema>> & { points?: number };
export type CreateCategoryRequest = z.infer<typeof insertCategorySchema>;
export type CreateQuestionRequest = z.infer<typeof insertQuestionSchema>;
export type UpdateSettingsRequest = Partial<z.infer<typeof insertSettingsSchema>> & { command?: 'start' | 'stop' | 'reset' };

// Auth types
export type LoginRequest = { username: string; password: string };

// Response types
export type UserResponse = User & { team?: Team }; // User with embedded team info
export type TeamResponse = Team & { memberCount?: number };

