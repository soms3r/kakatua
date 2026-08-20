// Prisma Client Singleton for Server Actions (app/actions/db.ts)
//
// IMPORTANT: We MUST cache the PrismaClient on `global` in ALL environments
// (including production). Without this, every Vercel serverless cold-start
// creates a new PrismaClient, which opens fresh DB connections and quickly
// exhausts the connection pool — causing ERR_CONNECTION_TIMED_OUT.
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

globalForPrisma.prisma = prisma;
