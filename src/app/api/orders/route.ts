import { NextResponse } from "next/server";
import { sql, initDbTables } from "@/lib/neonDb";

const STAFF_SECRET_TOKEN = process.env.STAFF_SECRET_TOKEN || "SKATE-STAFF-SECURE-998877";

export async function GET(req: Request) {
  try {
    await initDbTables();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const all = searchParams.get("all");

    // Secure check: requesting all orders requires valid staff token
    if (all === "true") {
      const authHeader = req.headers.get("x-staff-token") || searchParams.get("staffToken");
      if (authHeader !== STAFF_SECRET_TOKEN) {
        return NextResponse.json(
          { success: false, error: "Brak uprawnień. Wymagany klucz dostępu personelu." },
          { status: 401 }
        );
      }

      // Fetch all orders for authenticated staff dashboard
      const rows = await sql`
        SELECT 
          id,
          user_id AS "userId",
          date,
          items,
          subtotal,
          shipping_fee AS "shippingFee",
          total,
          shipping_method AS "shippingMethod",
          shipping_details AS "shippingDetails",
          payment_method AS "paymentMethod",
          payment_info AS "paymentInfo",
          status
        FROM orders
        ORDER BY date DESC;
      `;
      return NextResponse.json({ success: true, orders: rows });
    }

    // Fetch orders for a specific user (regular store user)
    if (userId) {
      const rows = await sql`
        SELECT 
          id,
          user_id AS "userId",
          date,
          items,
          subtotal,
          shipping_fee AS "shippingFee",
          total,
          shipping_method AS "shippingMethod",
          shipping_details AS "shippingDetails",
          payment_method AS "paymentMethod",
          payment_info AS "paymentInfo",
          status
        FROM orders
        WHERE user_id = ${userId}
        ORDER BY date DESC;
      `;
      return NextResponse.json({ success: true, orders: rows });
    }

    return NextResponse.json({ success: false, error: "Brak parametru wyszukiwania." }, { status: 400 });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Neon DB Fetch Orders Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await initDbTables();
    const { userId, orderData } = await req.json();

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const id = `ORD-${randomNum}`;
    const date = new Date().toISOString();

    const newOrder = {
      ...orderData,
      id,
      userId: userId || "guest_order",
      date,
      status: "Processing",
    };

    await sql`
      INSERT INTO orders (id, user_id, date, items, subtotal, shipping_fee, total, shipping_method, shipping_details, payment_method, payment_info, status)
      VALUES (
        ${id},
        ${newOrder.userId},
        ${date},
        ${JSON.stringify(newOrder.items)},
        ${newOrder.subtotal},
        ${newOrder.shippingFee},
        ${newOrder.total},
        ${newOrder.shippingMethod},
        ${JSON.stringify(newOrder.shippingDetails)},
        ${newOrder.paymentMethod},
        ${newOrder.paymentInfo || null},
        'Processing'
      );
    `;

    return NextResponse.json({ success: true, order: newOrder });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Neon DB Create Order Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await initDbTables();
    const authHeader = req.headers.get("x-staff-token");

    if (authHeader !== STAFF_SECRET_TOKEN) {
      return NextResponse.json(
        { success: false, error: "Brak uprawnień. Aktualizacja statusu wymaga klucza personelu." },
        { status: 401 }
      );
    }

    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ success: false, error: "Brak orderId lub status" }, { status: 400 });
    }

    await sql`
      UPDATE orders
      SET status = ${status}
      WHERE id = ${orderId};
    `;

    return NextResponse.json({ success: true, orderId, status });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Neon DB Update Order Status Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
