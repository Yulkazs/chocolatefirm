import "dotenv/config";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../app/generated/prisma/client';

const connectionString = process.env.DATABASE_URL!;

// Parse the connection string and modify it if needed
const modifiedConnectionString = connectionString.includes('sslmode=')
  ? connectionString.replace(/sslmode=\w+/, 'sslmode=verify-full')
  : connectionString + (connectionString.includes('?') ? '&' : '?') + 'sslmode=verify-full';

const pool = new Pool({
  connectionString: modifiedConnectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export { prisma };