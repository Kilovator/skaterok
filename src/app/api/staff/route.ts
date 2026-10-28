import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STAFF_SECRET_TOKEN = process.env.STAFF_SECRET_TOKEN || "SKATE-STAFF-SECURE-998877";
const MAIN_ADMIN_EMAIL = "dimonkrasula5@gmail.com";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("x-staff-token");
    if (authHeader !== STAFF_SECRET_TOKEN) {
      return NextResponse.json(
        { success: false, error: "Brak uprawnień. Wymagany klucz personelu." },
        { status: 401 }
      );
    }

    const users = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        id, 
        name, 
        email, 
        role, 
        avatar, 
        pos_pin AS "posPin", 
        pos_access AS "posAccess", 
        created_at AS "createdAt"
      FROM users
      ORDER BY created_at ASC;
    `);

    const formattedUsers = users.map((u) => {
      const isMainAdmin = u.email?.toLowerCase() === MAIN_ADMIN_EMAIL || u.role === "admin";
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar || null,
        role: isMainAdmin ? "admin" : (u.role || "user"),
        posAccess: isMainAdmin ? true : Boolean(u.posAccess),
        posPin: u.posPin || (isMainAdmin ? "998877" : null),
        createdAt: u.createdAt,
        isMainAdmin,
      };
    });

    return NextResponse.json({ success: true, users: formattedUsers });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("GET /api/staff Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const authHeader = req.headers.get("x-staff-token");
    if (authHeader !== STAFF_SECRET_TOKEN) {
      return NextResponse.json(
        { success: false, error: "Brak uprawnień administratora." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { userId, posAccess, posPin, role } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Brak parametru userId." },
        { status: 400 }
      );
    }

    // Check if target user exists
    const existing = await prisma.$queryRawUnsafe<any[]>(`
      SELECT id, email, role, pos_pin, pos_access FROM users WHERE id = $1;
    `, userId);

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Użytkownik nie istnieje w bazie." },
        { status: 404 }
      );
    }

    const targetUser = existing[0];
    const isTargetMainAdmin = targetUser.email?.toLowerCase() === MAIN_ADMIN_EMAIL;

    // Build update values
    const newPosAccess = isTargetMainAdmin ? true : Boolean(posAccess);
    const newPosPin = posPin !== undefined ? String(posPin).trim() : targetUser.pos_pin;
    const newRole = isTargetMainAdmin ? "admin" : (role || targetUser.role || "cashier");

    await prisma.$executeRawUnsafe(`
      UPDATE users
      SET 
        pos_access = $1,
        pos_pin = $2,
        role = $3
      WHERE id = $4;
    `, newPosAccess, newPosPin, newRole, userId);

    // Fetch refreshed user list
    const users = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        id, 
        name, 
        email, 
        role, 
        avatar, 
        pos_pin AS "posPin", 
        pos_access AS "posAccess", 
        created_at AS "createdAt"
      FROM users
      ORDER BY created_at ASC;
    `);

    const formattedUsers = users.map((u) => {
      const isMainAdmin = u.email?.toLowerCase() === MAIN_ADMIN_EMAIL || u.role === "admin";
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar || null,
        role: isMainAdmin ? "admin" : (u.role || "user"),
        posAccess: isMainAdmin ? true : Boolean(u.posAccess),
        posPin: u.posPin || (isMainAdmin ? "998877" : null),
        createdAt: u.createdAt,
        isMainAdmin,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Uprawnienia personelu zaktualizowane.",
      users: formattedUsers,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("PATCH /api/staff Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
