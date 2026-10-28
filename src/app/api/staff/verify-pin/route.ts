import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STAFF_SECRET_TOKEN = process.env.STAFF_SECRET_TOKEN || "SKATE-STAFF-SECURE-998877";
const MAIN_ADMIN_EMAIL = "dimonkrasula5@gmail.com";

export async function POST(req: Request) {
  try {
    const { pin } = await req.json();
    const cleanPin = pin ? String(pin).trim() : "";

    if (!cleanPin) {
      return NextResponse.json(
        { success: false, error: "PIN jest wymagany." },
        { status: 400 }
      );
    }

    // Query all users with POS access or the main admin
    const users = await prisma.$queryRawUnsafe<any[]>(`
      SELECT id, name, email, role, avatar, pos_pin AS "posPin", pos_access AS "posAccess"
      FROM users;
    `);

    // 1. Check if matches any user's personal PIN who has posAccess
    let matchedUser = users.find(
      (u) => u.posAccess === true && u.posPin && String(u.posPin).trim() === cleanPin
    );

    // 2. Special fallback for Main Admin default master PIN or token
    if (!matchedUser && (cleanPin === "998877" || cleanPin === STAFF_SECRET_TOKEN)) {
      matchedUser = users.find((u) => u.email?.toLowerCase() === MAIN_ADMIN_EMAIL) || {
        id: "main_admin_sys",
        name: "Super adminchik",
        email: MAIN_ADMIN_EMAIL,
        role: "admin",
        avatar: null,
        posAccess: true,
      };
    }

    if (!matchedUser) {
      return NextResponse.json(
        { success: false, error: "Nieprawidłowy PIN personelu. Skontaktuj się z administratorem." },
        { status: 401 }
      );
    }

    const isMainAdmin =
      matchedUser.email?.toLowerCase() === MAIN_ADMIN_EMAIL || matchedUser.role === "admin";

    return NextResponse.json({
      success: true,
      token: STAFF_SECRET_TOKEN,
      user: {
        id: matchedUser.id,
        name: matchedUser.name || "Pracownik POS",
        email: matchedUser.email,
        avatar: matchedUser.avatar || null,
        role: isMainAdmin ? "admin" : (matchedUser.role || "cashier"),
        isMainAdmin,
      },
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Verify PIN error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
