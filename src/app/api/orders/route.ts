import { NextResponse } from "next/server";
import { sql, initDbTables } from "@/lib/neonDb";

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
