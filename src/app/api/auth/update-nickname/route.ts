import { NextResponse } from "next/server";
import { sql, initDbTables } from "@/lib/neonDb";

const NICKNAME_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  try {
    await initDbTables();
    const { userId, newNickname } = await req.json();

    const cleanNick = newNickname?.trim();
    if (!cleanNick || cleanNick.length < 2) {
      return NextResponse.json({ success: false, error: "Nick musi mieć co najmniej 2 znaki." }, { status: 400 });
    }

    const rows = await sql`SELECT * FROM users WHERE id = ${userId};`;
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
    }

    const user = rows[0];

    if (cleanNick.toLowerCase() === user.name.toLowerCase()) {
      return NextResponse.json({ success: false, error: "Nowy nick musi różnić się od obecnego." }, { status: 400 });
    }

    if (user.last_nickname_change_date) {
      const lastChange = new Date(user.last_nickname_change_date).getTime();
      const elapsed = Date.now() - lastChange;
      if (elapsed < NICKNAME_COOLDOWN_MS) {
        const daysRemaining = Math.ceil((NICKNAME_COOLDOWN_MS - elapsed) / (24 * 60 * 60 * 1000));
        return NextResponse.json({
          success: false,
          error: `Nick można zmieniać raz na 30 dni. Możesz zmienić za ${daysRemaining} dni.`,
          daysRemaining,
        }, { status: 400 });
      }
    }

    const history = user.nickname_history || [];
    const updatedHistory = [
      ...history,
      {
        nickname: user.name,
        changedAt: new Date().toISOString(),
      },
    ];

    const now = new Date().toISOString();

    await sql`
      UPDATE users
      SET name = ${cleanNick},
          last_nickname_change_date = ${now},
          nickname_history = ${JSON.stringify(updatedHistory)}
      WHERE id = ${userId};
    `;

    const updatedUser = {
      id: user.id,
      name: cleanNick,
      email: user.email,
      avatar: user.avatar,
      passwordHash: user.password_hash,
      createdAt: user.created_at,
      lastNicknameChangeDate: now,
      nicknameHistory: updatedHistory,
    };

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Neon DB Update Nickname Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
