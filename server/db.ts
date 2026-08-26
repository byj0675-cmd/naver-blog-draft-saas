import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { BrandProfile, DraftHistory, InsertBrandProfile, InsertDraftHistory, InsertToneProfile, brandProfiles, draftHistories, toneProfiles, InsertUser, subscriptions, users } from "../drizzle/schema";
import { ENV } from './_core/env';

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

export async function getSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return rows[0] ?? null;
}
