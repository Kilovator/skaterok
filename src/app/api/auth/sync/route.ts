import { NextResponse } from "next/server";
import { sql, initDbTables } from "@/lib/neonDb";

export async function POST(req: Request) {
  try {
    await initDbTables();
    const body = await req.json();
    const { users = [], savedBuilds = [], orders = [] } = body;

    // Sync Users
    for (const u of users) {
      if (!u.email) continue;
      await sql`
        INSERT INTO users (id, name, email, password_hash, avatar, created_at, last_nickname_change_date, nickname_history)
        VALUES (
          ${u.id},
          ${u.name},
          ${u.email.toLowerCase().trim()},
          ${u.passwordHash || "skate123"},
          ${u.avatar || null},
          ${u.createdAt || new Date().toISOString()},
          ${u.lastNicknameChangeDate || null},
          ${JSON.stringify(u.nicknameHistory || [])}
        )
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          avatar = COALESCE(EXCLUDED.avatar, users.avatar),
          last_nickname_change_date = COALESCE(EXCLUDED.last_nickname_change_date, users.last_nickname_change_date),
          nickname_history = EXCLUDED.nickname_history;
      `;
    }

    // Sync Saved Builds
    for (const b of savedBuilds) {
      if (!b.id || !b.userId) continue;
      await sql`
        INSERT INTO saved_builds (id, user_id, name, deck, wheels, truck, bolt, price, created_at)
        VALUES (
          ${b.id},
          ${b.userId},
          ${b.name},
          ${JSON.stringify(b.deck)},
          ${JSON.stringify(b.wheels)},
          ${JSON.stringify(b.truck)},
          ${JSON.stringify(b.bolt)},
          ${b.price},
          ${b.createdAt || new Date().toISOString()}
        )
        ON CONFLICT (id) DO NOTHING;
      `;
    }

    // Sync Orders
    for (const o of orders) {
      if (!o.id) continue;
      await sql`
        INSERT INTO orders (id, user_id, date, items, subtotal, shipping_fee, total, shipping_method, shipping_details, payment_method, payment_info, status)
        VALUES (
          ${o.id},
          ${o.userId},
          ${o.date || new Date().toISOString()},
          ${JSON.stringify(o.items)},
          ${o.subtotal},
          ${o.shippingFee},
          ${o.total},
          ${o.shippingMethod},
          ${JSON.stringify(o.shippingDetails)},
          ${o.paymentMethod},
          ${o.paymentInfo || null},
          ${o.status || "Processing"}
        )
        ON CONFLICT (id) DO NOTHING;
      `;
    }

    // Fetch all Neon DB users to return
    const dbUsers = await sql`SELECT * FROM users ORDER BY created_at DESC;`;

    return NextResponse.json({
      success: true,
      message: "Synced with Neon PostgreSQL!",
      count: dbUsers.length,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Neon DB Sync Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to sync with Neon DB" },
      { status: 500 }
    );
  }
}
