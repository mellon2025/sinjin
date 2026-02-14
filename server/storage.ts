
import { db } from "./db";
import {
  users, teams, categories, questions, settings,
  type User, type Team, type Category, type Question, type Settings,
  type CreateUserRequest, type CreateTeamRequest, type UpdateTeamRequest,
  type CreateCategoryRequest, type CreateQuestionRequest, type UpdateSettingsRequest
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: CreateUserRequest): Promise<User>;
  updateUserTeam(userId: number, teamId: number | null, role?: string): Promise<User>;

  // Teams
  getTeams(): Promise<(Team & { memberCount: number })[]>;
  getTeam(id: number): Promise<Team | undefined>;
  createTeam(team: CreateTeamRequest): Promise<Team>;
  updateTeam(id: number, updates: UpdateTeamRequest): Promise<Team>;
  deleteTeam(id: number): Promise<void>;
  getTeamMembers(teamId: number): Promise<User[]>;

  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: CreateCategoryRequest): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // Questions
  getQuestions(categoryId?: number): Promise<Question[]>;
  createQuestion(question: CreateQuestionRequest): Promise<Question>;
  deleteQuestion(id: number): Promise<void>;

  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(updates: UpdateSettingsRequest): Promise<Settings>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: CreateUserRequest): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUserTeam(userId: number, teamId: number | null, role: string = 'member'): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({ teamId, teamRole: role })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  // Teams
  async getTeams(): Promise<(Team & { memberCount: number })[]> {
    // For simplicity in this MVP, we might fetch all and count, or use a raw query/join
    // Drizzle relation count is cleaner but requires setup. Let's do a map for now or a join.
    // Actually, let's just fetch teams and simple count for now.
    const allTeams = await db.select().from(teams).orderBy(desc(teams.points));
    
    // This is N+1 but acceptable for MVP with small number of teams. 
    // Optimization: Use a proper group by count query.
    const teamsWithCounts = await Promise.all(allTeams.map(async (team) => {
      const members = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.teamId, team.id));
      return { ...team, memberCount: Number(members[0].count) };
    }));

    return teamsWithCounts;
  }

  async getTeam(id: number): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  async createTeam(team: CreateTeamRequest): Promise<Team> {
    const [newTeam] = await db.insert(teams).values(team).returning();
    return newTeam;
  }

  async updateTeam(id: number, updates: UpdateTeamRequest): Promise<Team> {
    const [updatedTeam] = await db.update(teams).set(updates).where(eq(teams.id, id)).returning();
    return updatedTeam;
  }

  async deleteTeam(id: number): Promise<void> {
    await db.delete(teams).where(eq(teams.id, id));
    // Also unset users
    await db.update(users).set({ teamId: null, teamRole: null }).where(eq(users.teamId, id));
  }

  async getTeamMembers(teamId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.teamId, teamId));
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(category: CreateCategoryRequest): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Questions
  async getQuestions(categoryId?: number): Promise<Question[]> {
    if (categoryId) {
      return await db.select().from(questions).where(eq(questions.categoryId, categoryId));
    }
    return await db.select().from(questions);
  }

  async createQuestion(question: CreateQuestionRequest): Promise<Question> {
    const [newQuestion] = await db.insert(questions).values(question).returning();
    return newQuestion;
  }

  async deleteQuestion(id: number): Promise<void> {
    await db.delete(questions).where(eq(questions.id, id));
  }

  // Settings
  async getSettings(): Promise<Settings> {
    const [existing] = await db.select().from(settings);
    if (!existing) {
      const [newSettings] = await db.insert(settings).values({}).returning();
      return newSettings;
    }
    return existing;
  }

  async updateSettings(updates: UpdateSettingsRequest): Promise<Settings> {
    // Handle timer logic based on 'command'
    let timerUpdates: Partial<Settings> = { ...updates };
    delete (timerUpdates as any).command;

    if (updates.command === 'start') {
      timerUpdates.timerActive = true;
      timerUpdates.timerStartTime = new Date();
    } else if (updates.command === 'stop') {
      timerUpdates.timerActive = false;
      // You might want to calculate remaining time here if you want to resume
    } else if (updates.command === 'reset') {
      timerUpdates.timerActive = false;
      timerUpdates.timerStartTime = null;
    }

    // Ensure only one row exists (ID 1 usually)
    const existing = await this.getSettings();
    const [updated] = await db.update(settings).set(timerUpdates).where(eq(settings.id, existing.id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
