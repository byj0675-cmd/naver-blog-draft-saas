import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const brandProfiles = mysqlTable("brandProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  industry: varchar("industry", { length: 120 }),
  services: text("services"),
  audience: text("audience"),
  strengths: text("strengths"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const toneProfiles = mysqlTable("toneProfiles", {
  id: int("id").autoincrement().primaryKey(),
  brandId: int("brandId").notNull(),
  sampleCount: int("sampleCount").default(0).notNull(),
  profileJson: text("profileJson").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const draftHistories = mysqlTable("draftHistories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  brandId: int("brandId").notNull(),
  title: text("title").notNull(),
  intro: text("intro").notNull(),
  body: text("body").notNull(),
  ending: text("ending").notNull(),
  hashtags: text("hashtags").notNull(),
  keywords: text("keywords").notNull(),
  seoScore: int("seoScore").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  plan: varchar("plan", { length: 40 }).notNull(),
  creditsTotal: int("creditsTotal").notNull(),
  creditsUsed: int("creditsUsed").default(0).notNull(),
  status: mysqlEnum("status", ["active", "pending", "failed"]).default("active").notNull(),
  paymentProvider: varchar("paymentProvider", { length: 40 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InsertBrandProfile = typeof brandProfiles.$inferInsert;
export type InsertDraftHistory = typeof draftHistories.$inferInsert;
export type InsertToneProfile = typeof toneProfiles.$inferInsert;
export type BrandProfile = typeof brandProfiles.$inferSelect;
export type ToneProfile = typeof toneProfiles.$inferSelect;
export type DraftHistory = typeof draftHistories.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;