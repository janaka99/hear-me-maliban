// src/lib/db.ts
import pkg from "pg";
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // your Neon URL
  ssl: {
    rejectUnauthorized: false, // required for Neon
  },
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
