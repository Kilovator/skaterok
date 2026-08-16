import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const NICKNAME_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const { userId, newNickname } = await req.json();

    if (!userId || !newNickname || !newNickname.trim()) {
      return NextResponse.json({ success: false, error: "Brak ID użytkownika lub nowego nicku." }, { status: 400 });
    }

    const cleanNick = newNickname.trim();

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ success: false, error: "Nie znaleziono użytkownika." }, { status: 404 });
    }

    // Check 30-day cooldown
    if (currentUser.lastNicknameChangeDate) {
      const elapsed = Date.now() - new Date(currentUser.lastNicknameChangeDate).getTime();
      if (elapsed < NICKNAME_COOLDOWN_MS) {
        const daysRemaining = Math.ceil((NICKNAME_COOLDOWN_MS - elapsed) / (24 * 60 * 60 * 1000));
        return NextResponse.json({
          success: false,
          error: `Nick można zmieniać raz na 30 dni. Spróbuj za ${daysRemaining} dni.`,
          daysRemaining,
        }, { status: 400 });
      }
    }

    // Record old nickname into history array
    const oldHistory = Array.isArray(currentUser.nicknameHistory) ? (currentUser.nicknameHistory as Array<{ nickname: string; changedAt: string }>) : [];
    const updatedHistory = [
      ...oldHistory,
      { nickname: currentUser.name, changedAt: new Date().toISOString() },
    ];

    const now = new Date();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: cleanNick,
        lastNicknameChangeDate: now,
        nicknameHistory: updatedHistory,
      },
    });

    const formattedUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
      passwordHash: updatedUser.passwordHash,
      createdAt: updatedUser.createdAt.toISOString(),
      lastNicknameChangeDate: updatedUser.lastNicknameChangeDate ? updatedUser.lastNicknameChangeDate.toISOString() : null,
      nicknameHistory: updatedHistory,
    };

    return NextResponse.json({ success: true, user: formattedUser });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Prisma Update Nickname Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Błąd podczas zmiany nicku." }, { status: 500 });
  }
}
