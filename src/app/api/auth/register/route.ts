import { NextResponse } from "next/server";
import { sql, initDbTables } from "@/lib/neonDb";

export async function POST(req: Request) {
  try {
    await initDbTables();
    const { name, email, password, avatar } = await req.json();

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    if (!cleanEmail || !password || !cleanName) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const existing = await sql`SELECT id FROM users WHERE email = ${cleanEmail};`;
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: "User with this email already exists" }, { status: 400 });
    }

    const id = "usr_" + Math.random().toString(36).substring(2, 9);
    const createdAt = new Date().toISOString();

    await sql`
      INSERT INTO users (id, name, email, password_hash, avatar, created_at, nickname_history)
      VALUES (${id}, ${cleanName}, ${cleanEmail}, ${password}, ${avatar || null}, ${createdAt}, '[]'::jsonb);
    `;

    const newUser = {
      id,
      name: cleanName,
      email: cleanEmail,
      avatar,
      passwordHash: password,
      createdAt,
      nicknameHistory: [],
    };

    return NextResponse.json({ success: true, user: newUser });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Neon DB Register Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
