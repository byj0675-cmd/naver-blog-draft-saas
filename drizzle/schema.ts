import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, uniqueIndex } from "drizzle-orm/mysql-core";

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
  /** Structured business brief used to keep generated drafts factually grounded. */
  briefJson: text("briefJson"),
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
  regenerationCount: int("regenerationCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const usageCounters = mysqlTable("usageCounters", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  brandId: int("brandId").default(0).notNull(),
  periodKey: varchar("periodKey", { length: 7 }).notNull(),
  generationCount: int("generationCount").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ userBrandPeriodUnique: uniqueIndex("userBrandPeriodUnique").on(table.userId, table.brandId, table.periodKey) }));

export const paymentRequests = mysqlTable("paymentRequests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  plan: varchar("plan", { length: 40 }).notNull(),
  amount: int("amount").notNull(),
  payerName: varchar("payerName", { length: 80 }).notNull(),
  businessName: varchar("businessName", { length: 160 }),
  phone: varchar("phone", { length: 40 }),
  billingCycle: mysqlEnum("billingCycle", ["monthly", "yearly"]).default("monthly").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["not_sent", "sent", "paid"]).default("not_sent").notNull(),
  paidAt: timestamp("paidAt"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  note: text("note"),
  reviewedBy: int("reviewedBy"),
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
});

export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  plan: varchar("plan", { length: 40 }).notNull(),
  creditsTotal: int("creditsTotal").notNull(),
  creditsUsed: int("creditsUsed").default(0).notNull(),
  brandSlots: int("brandSlots").default(1).notNull(),
  billingCycle: mysqlEnum("billingCycle", ["monthly", "yearly"]).default("monthly").notNull(),
  validUntil: timestamp("validUntil"),
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
export type UsageCounter = typeof usageCounters.$inferSelect;
export type PaymentRequest = typeof paymentRequests.$inferSelect;
export type InsertPaymentRequest = typeof paymentRequests.$inferInsert;