import { NextResponse } from "next/server";
import { sql, initDbTables } from "@/lib/neonDb";

export async function GET(req: Request) {
  try {
    await initDbTables();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ success: false, error: "Missing email parameter" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const userRows = await sql`SELECT * FROM users WHERE email = ${cleanEmail};`;

    if (userRows.length === 0) {
      return NextResponse.json({ success: false, error: "User not found in Neon DB" }, { status: 404 });
    }

    const u = userRows[0];
    const user = {
      id: u.id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      passwordHash: u.password_hash,
      createdAt: u.created_at,
      lastNicknameChangeDate: u.last_nickname_change_date,
      nicknameHistory: u.nickname_history || [],
    };

    const buildsRows = await sql`SELECT * FROM saved_builds WHERE user_id = ${u.id} ORDER BY created_at DESC;`;
    const savedBuilds = buildsRows.map((b) => ({
      id: b.id,
      userId: b.user_id,
      name: b.name,
      deck: b.deck,
      wheels: b.wheels,
      truck: b.truck,
      bolt: b.bolt,
      price: b.price,
      createdAt: b.created_at,
    }));

    const ordersRows = await sql`SELECT * FROM orders WHERE user_id = ${u.id} ORDER BY date DESC;`;
    const orders = ordersRows.map((o) => ({
      id: o.id,
      userId: o.user_id,
      date: o.date,
      items: o.items,
      subtotal: o.subtotal,
      shippingFee: o.shipping_fee,
      total: o.total,
      shippingMethod: o.shipping_method,
      shippingDetails: o.shipping_details,
      paymentMethod: o.payment_method,
      paymentInfo: o.payment_info,
      status: o.status,
    }));

    return NextResponse.json({
      success: true,
      user,
      savedBuilds,
      orders,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Neon DB Get User Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
