import { PrismaClient } from "@prisma/client";
import config from ".";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        // log: ["query", "info", "warn", "error"],
        datasourceUrl: config.databaseURL,
    });

if (config.nodeEnv !== "production") globalForPrisma.prisma = prisma;

export default prisma;
