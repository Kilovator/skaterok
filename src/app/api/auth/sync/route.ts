import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { users } = await req.json();

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ success: false, error: "Brak danych użytkowników do zsynchronizowania." }, { status: 400 });
    }

    for (const u of users) {
      if (u.email && u.passwordHash) {
        const cleanEmail = u.email.toLowerCase().trim();
        const existing = await prisma.user.findUnique({
          where: { email: cleanEmail },
        });

        if (existing) {
          await prisma.user.update({
            where: { email: cleanEmail },
            data: { passwordHash: u.passwordHash },
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Prisma Sync Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Błąd synchronizacji konta." }, { status: 500 });
  }
}
