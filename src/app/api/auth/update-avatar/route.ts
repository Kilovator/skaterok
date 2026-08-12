import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, avatarUrl } = await req.json();

    if (!userId || !avatarUrl) {
      return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
    }

    const u = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });

    const updatedUser = {
      id: u.id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      passwordHash: u.passwordHash,
      createdAt: u.createdAt,
      lastNicknameChangeDate: u.lastNicknameChangeDate,
      nicknameHistory: u.nicknameHistory || [],
    };

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Prisma Update Avatar Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
