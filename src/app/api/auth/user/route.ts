import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ success: false, error: "Missing email parameter" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    const u = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        savedBuilds: {
          orderBy: { createdAt: "desc" },
        },
        orders: {
          orderBy: { date: "desc" },
        },
      },
    });

    if (!u) {
      return NextResponse.json({ success: false, error: "User not found in Neon DB" }, { status: 404 });
    }

    const user = {
      id: u.id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      passwordHash: u.passwordHash,
      createdAt: u.createdAt,
      lastNicknameChangeDate: u.lastNicknameChangeDate,
      nicknameHistory: u.nicknameHistory || [],
    };

    return NextResponse.json({
      success: true,
      user,
      savedBuilds: u.savedBuilds,
      orders: u.orders,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Prisma Get User Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
