import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_uLWdlAYezV57@ep-still-cell-ayh64c0u-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require";

export const sql = neon(databaseUrl);

export async function initDbTables() {
  try {
    // 1. Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        avatar TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        last_nickname_change_date TIMESTAMPTZ,
        nickname_history JSONB DEFAULT '[]'::jsonb
      );
    `;

    // 2. Saved builds table
    await sql`
      CREATE TABLE IF NOT EXISTS saved_builds (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        deck JSONB NOT NULL,
        wheels JSONB NOT NULL,
        truck JSONB NOT NULL,
        bolt JSONB NOT NULL,
        price INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // 3. Orders table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        date TIMESTAMPTZ DEFAULT NOW(),
        items JSONB NOT NULL,
        subtotal INTEGER NOT NULL,
        shipping_fee INTEGER NOT NULL,
        total INTEGER NOT NULL,
        shipping_method VARCHAR(50) NOT NULL,
        shipping_details JSONB NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_info TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'Processing'
      );
    `;
  } catch (err) {
    console.error("Error initializing Neon database tables:", err);
  }
}
