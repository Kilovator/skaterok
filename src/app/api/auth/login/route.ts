import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const cleanEmail = email?.toLowerCase().trim();
    if (!cleanEmail || !password) {
      return NextResponse.json({ success: false, error: "Wprowadź e-mail i hasło." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user || user.passwordHash !== password) {
      return NextResponse.json({ success: false, error: "Nieprawidłowy e-mail lub hasło." }, { status: 401 });
    }

    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role || (cleanEmail === "dimonkrasula5@gmail.com" ? "admin" : "user"),
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
      lastNicknameChangeDate: user.lastNicknameChangeDate,
      nicknameHistory: user.nicknameHistory || [],
    };

    return NextResponse.json({ success: true, user: formattedUser });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Prisma Login Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
