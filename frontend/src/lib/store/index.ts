import type { DataStore } from "./types";
import { InMemoryStore } from "./memory";
import { SqliteStore, hasSqliteDatabase, SQLITE_DB_PATH } from "./sqlite";
import { isMockMode, config } from "@/lib/config";
import { logger } from "@/lib/logger";

let instance: DataStore | null = null;

/** Path to the bundled FoodGuard SQLite database, when configured. */
function sqlitePath(): string {
  return SQLITE_DB_PATH || "";
}

/**
 * Returns the active data store.
 *  - PRODUCTION (DATABASE_URL set): PostgreSQL via Prisma
 *  - SQLite (FOODGUARD_DB_PATH set, file exists): bundled FoodGuard SQLite DB
 *    (~29.5k Indian retail products) with in-memory fallback for the rest
 *  - MOCK MODE (neither): seeded in-memory store
 */
export function getStore(): DataStore {
  if (instance) return instance;
  const path = sqlitePath();
  if (isMockMode() && path && hasSqliteDatabase(path)) {
    logger.info("sqlite_store_active", { path });
    instance = new SqliteStore(path);
  } else if (isMockMode()) {
    logger.info("mock_mode_in_memory_store", { reason: "DATABASE_URL and FOODGUARD_DB_PATH not set" });
    instance = new InMemoryStore();
  } else {
    // Lazy-load PrismaStore to avoid schema validation when using SQLite/mock mode
    
    const mod = require("./prisma") as { PrismaStore: new () => DataStore };
    instance = new mod.PrismaStore();
  }
  return instance;
}

export async function ensureDemoUsers(): Promise<void> {
  if (!isMockMode() && config.seed.enabled) {
    try {
      // Lazy-load Prisma client
      
      const { prisma } = require("./prisma");
      const existing = await prisma.user.count();
      if (existing === 0) {
        const { hashPassword } = await import("@/lib/auth");
        const admin = await prisma.user.create({
          data: {
            email: config.seed.adminEmail,
            name: "FoodGaurd Admin",
            passwordHash: await hashPassword(config.seed.adminPassword),
            role: "ADMIN",
          },
        });
        await prisma.user.create({
          data: {
            email: config.seed.userEmail,
            name: "Demo User",
            passwordHash: await hashPassword(config.seed.userPassword),
            role: "USER",
          },
        });
        logger.info("demo_users_created", { adminId: admin.id });
      }
    } catch (error) {
      logger.warn("demo_users_creation_skipped", { error: String(error) });
    }
  }
}
