import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/social_scheduler";

// Serverless Neon pool or fallback connection
const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });
