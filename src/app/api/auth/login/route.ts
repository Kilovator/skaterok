import { NextResponse } from "next/server";
import { sql, initDbTables } from "@/lib/neonDb";

export async function POST(req: Request) {
  try {
    await initDbTables();
    const { email, password } = await req.json();

    const cleanEmail = email?.toLowerCase().trim();
    if (!cleanEmail || !password) {
      return NextResponse.json({ success: false, error: "Wprowadź e-mail i hasło." }, { status: 400 });
    }

    const rows = await sql`
      SELECT * FROM users WHERE email = ${cleanEmail};
    `;

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: "Nieprawidłowy e-mail lub hasło." }, { status: 401 });
    }

    const user = rows[0];
    if (user.password_hash !== password) {
      return NextResponse.json({ success: false, error: "Nieprawidłowy e-mail lub hasło." }, { status: 401 });
    }

    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      passwordHash: user.password_hash,
      createdAt: user.created_at,
      lastNicknameChangeDate: user.last_nickname_change_date,
      nicknameHistory: user.nickname_history || [],
    };

    return NextResponse.json({ success: true, user: formattedUser });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Neon DB Login Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
