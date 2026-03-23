import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, {
  prepare: false,
  idle_timeout: 20,
  max_lifetime: 60 * 5,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
