import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password, avatar } = await req.json();

    const cleanEmail = email?.toLowerCase().trim();
    if (!name || !cleanEmail || !password) {
      return NextResponse.json({ success: false, error: "Uzupełnij wszystkie wymagane pola." }, { status: 400 });
    }

    // Check if user already exists in Neon Postgres
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json({ success: false, error: "Konto z tym adresem e-mail już istnieje." }, { status: 400 });
    }

    // Determine role (dimonkrasula5@gmail.com or admin emails are admin)
    const isAdmin = cleanEmail === "dimonkrasula5@gmail.com" || cleanEmail.includes("admin");
    const role = isAdmin ? "admin" : "user";

    // Create new user in Neon database via Prisma
    const createdUser = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        passwordHash: password,
        avatar: avatar || null,
        role,
        nicknameHistory: [],
      },
    });

    const formattedUser = {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      avatar: createdUser.avatar,
      role: createdUser.role,
      passwordHash: createdUser.passwordHash,
      createdAt: createdUser.createdAt.toISOString(),
      lastNicknameChangeDate: createdUser.lastNicknameChangeDate ? createdUser.lastNicknameChangeDate.toISOString() : null,
      nicknameHistory: (createdUser.nicknameHistory as unknown[]) || [],
    };

    return NextResponse.json({ success: true, user: formattedUser });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Prisma Register Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Błąd podczas rejestracji." }, { status: 500 });
  }
}
