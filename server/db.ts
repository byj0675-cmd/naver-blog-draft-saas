import { and, desc, eq, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { BrandProfile, DraftHistory, InsertBrandProfile, InsertDraftHistory, InsertToneProfile, brandProfiles, draftHistories, toneProfiles, InsertUser, subscriptions, users, usageCounters, paymentRequests, InsertPaymentRequest } from "../drizzle/schema";
import { ENV } from './_core/env';
import { getSubscriptionEndDate } from "../shared/billingPeriod";
import { canApproveSubscription } from "../shared/paymentWorkflow";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function listBrandProfiles(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(brandProfiles).where(eq(brandProfiles.userId, userId));
}

export async function createBrandProfile(input: InsertBrandProfile) {
  const db = await getDb();
  if (!db) return null;
  const subscription = await getSubscription(input.userId);
  const existingBrands = await db.select({ id: brandProfiles.id }).from(brandProfiles).where(eq(brandProfiles.userId, input.userId));
  const brandSlots = subscription?.brandSlots ?? 1;
  if (existingBrands.length >= brandSlots) throw new Error(`현재 플랜은 브랜드 ${brandSlots}개까지 등록할 수 있습니다.`);
  await db.insert(brandProfiles).values(input);
  const rows = await db.select().from(brandProfiles).where(eq(brandProfiles.userId, input.userId));
  return rows.at(-1) ?? null;
}

export async function saveDraftHistory(input: InsertDraftHistory) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(draftHistories).values(input);
  const rows = await db.select().from(draftHistories).where(eq(draftHistories.userId, input.userId));
  return rows.at(-1) ?? null;
}

export async function saveToneProfile(input: InsertToneProfile) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(toneProfiles).values(input);
  const rows = await db.select().from(toneProfiles).where(eq(toneProfiles.brandId, input.brandId));
  return rows.at(-1) ?? null;
}

export async function getToneProfile(brandId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(toneProfiles).where(eq(toneProfiles.brandId, brandId)).limit(1);
  return rows[0] ?? null;
}

export async function listDraftHistories(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(draftHistories).where(eq(draftHistories.userId, userId));
}

export async function reserveMonthlyGeneration(userId: number, brandId: number, limit = 12) {
  const db = await getDb();
  if (!db) return { allowed: true, used: 0, periodKey: currentPeriodKey() };
  const periodKey = currentPeriodKey();
  await db.insert(usageCounters).values({ userId, brandId, periodKey, generationCount: 0 }).onDuplicateKeyUpdate({ set: { generationCount: sql`generationCount` } });
  const result = await db.update(usageCounters).set({ generationCount: sql`generationCount + 1` }).where(and(eq(usageCounters.userId, userId), eq(usageCounters.brandId, brandId), eq(usageCounters.periodKey, periodKey), lt(usageCounters.generationCount, limit)));
  const rows = await db.select().from(usageCounters).where(and(eq(usageCounters.userId, userId), eq(usageCounters.brandId, brandId), eq(usageCounters.periodKey, periodKey))).limit(1);
  const used = rows[0]?.generationCount ?? 0;
  return { allowed: result[0]?.affectedRows === 1, used, periodKey };
}

export async function releaseMonthlyGeneration(userId: number, brandId: number, periodKey: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(usageCounters).set({ generationCount: sql`GREATEST(generationCount - 1, 0)` }).where(and(eq(usageCounters.userId, userId), eq(usageCounters.brandId, brandId), eq(usageCounters.periodKey, periodKey), gtZero()));
}

function gtZero() { return sql`generationCount > 0`; }
export function currentPeriodKey() { return new Date().toISOString().slice(0, 7); }

export async function getMonthlyUsage(userId: number, brandId: number, limit = 12) {
  const db = await getDb();
  const periodKey = currentPeriodKey();
  if (!db) return { periodKey, used: 0, limit, remaining: limit };
  const rows = await db.select({ used: usageCounters.generationCount }).from(usageCounters).where(and(eq(usageCounters.userId, userId), eq(usageCounters.brandId, brandId), eq(usageCounters.periodKey, periodKey))).limit(1);
  const used = rows[0]?.used ?? 0;
  return { periodKey, used, limit, remaining: Math.max(0, limit - used) };
}

export async function reserveDraftRegeneration(userId: number, draftId: number, limit = 3) {
  const db = await getDb();
  if (!db) return { allowed: true, used: 0 };
  const result = await db.update(draftHistories).set({ regenerationCount: sql`regenerationCount + 1` }).where(and(eq(draftHistories.id, draftId), eq(draftHistories.userId, userId), lt(draftHistories.regenerationCount, limit)));
  const rows = await db.select({ count: draftHistories.regenerationCount }).from(draftHistories).where(and(eq(draftHistories.id, draftId), eq(draftHistories.userId, userId))).limit(1);
  return { allowed: result[0]?.affectedRows === 1, used: rows[0]?.count ?? 0 };
}

export async function releaseDraftRegeneration(userId: number, draftId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(draftHistories).set({ regenerationCount: sql`GREATEST(regenerationCount - 1, 0)` }).where(and(eq(draftHistories.id, draftId), eq(draftHistories.userId, userId), sql`regenerationCount > 0`));
}

export async function createPaymentRequest(input: InsertPaymentRequest) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(paymentRequests).values(input);
  const rows = await db.select().from(paymentRequests).where(eq(paymentRequests.userId, input.userId)).orderBy(desc(paymentRequests.id)).limit(1);
  return rows[0] ?? null;
}

export async function listPaymentRequests() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paymentRequests).orderBy(desc(paymentRequests.requestedAt));
}

export async function markPaymentPaid(id: number) {
  const db = await getDb();
  if (!db) return null;
  await db.update(paymentRequests).set({ paymentStatus: "paid", paidAt: new Date() }).where(eq(paymentRequests.id, id));
  const rows = await db.select().from(paymentRequests).where(eq(paymentRequests.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function reviewPaymentRequest(id: number, adminId: number, status: "approved" | "rejected", note?: string) {
  const db = await getDb();
  if (!db) return null;
  const currentRows = await db.select().from(paymentRequests).where(eq(paymentRequests.id, id)).limit(1);
  const current = currentRows[0] ?? null;
  if (!current) return null;
  if (status === "approved" && !canApproveSubscription(current.paymentStatus)) throw new Error("수납 확인 후 승인할 수 있습니다.");
  await db.update(paymentRequests).set({ status, note: note ?? null, reviewedBy: adminId, reviewedAt: new Date() }).where(eq(paymentRequests.id, id));
  const rows = await db.select().from(paymentRequests).where(eq(paymentRequests.id, id)).limit(1);
  const request = rows[0] ?? null;
  if (request?.status === "approved") {
    const planKey = request.plan.toLowerCase();
    const creditsTotal = planKey === "studio" ? 300 : planKey === "starter" ? 30 : 100;
    const brandSlots = planKey === "studio" ? 5 : planKey === "starter" ? 1 : 2;
    const billingCycle = request.billingCycle ?? "monthly";
    const validUntil = getSubscriptionEndDate(new Date(), billingCycle);
    const existing = await db.select().from(subscriptions).where(eq(subscriptions.userId, request.userId)).limit(1);
    if (existing[0]) await db.update(subscriptions).set({ plan: request.plan, creditsTotal, creditsUsed: 0, brandSlots, billingCycle, validUntil, status: "active", paymentProvider: "manual" }).where(eq(subscriptions.id, existing[0].id));
    else await db.insert(subscriptions).values({ userId: request.userId, plan: request.plan, creditsTotal, creditsUsed: 0, brandSlots, billingCycle, validUntil, status: "active", paymentProvider: "manual" });
  }
  return request;
}

export async function getSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  const subscription = rows[0] ?? null;
  if (!subscription) return null;
  return { ...subscription, isExpired: Boolean(subscription.validUntil && subscription.validUntil.getTime() < Date.now()) };
}
