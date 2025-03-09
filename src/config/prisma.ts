import { PrismaClient } from "@prisma/client";
import config from ".";

// Extend global type to avoid TypeScript errors
declare global {
    var prisma: PrismaClient | undefined;
}

// Use existing global Prisma instance if available
export const prisma =
    global.prisma ??
    new PrismaClient({
        datasources: {
            db: {
                url: config.databaseURL, // ✅ Correct way to define DB URL
            },
        },
        // log: ["query", "info", "warn", "error"],
    });

// Assign Prisma client globally only in development (prevents multiple instances in hot reloads)
if (config.nodeEnv !== "production") global.prisma = prisma;

export default prisma;
