import { NextResponse } from "next/server";
import { sql, initDbTables } from "@/lib/neonDb";

export async function POST(req: Request) {
  try {
    await initDbTables();
    const { userId, avatarUrl } = await req.json();

    if (!userId || !avatarUrl) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    await sql`
      UPDATE users
      SET avatar = ${avatarUrl}
      WHERE id = ${userId};
    `;

    const rows = await sql`SELECT * FROM users WHERE id = ${userId};`;
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const u = rows[0];
    const updatedUser = {
      id: u.id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      passwordHash: u.password_hash,
      createdAt: u.created_at,
      lastNicknameChangeDate: u.last_nickname_change_date,
      nicknameHistory: u.nickname_history || [],
    };

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Neon DB Update Avatar Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
