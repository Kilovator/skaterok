import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STAFF_SECRET_TOKEN = process.env.STAFF_SECRET_TOKEN || "SKATE-STAFF-SECURE-998877";

export async function GET(req: Request) {
  try {
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
      const orders = await prisma.order.findMany({
        orderBy: { date: "desc" },
      });
      return NextResponse.json({ success: true, orders });
    }

    // Fetch orders for a specific user (regular store user)
    if (userId) {
      const orders = await prisma.order.findMany({
        where: { userId },
        orderBy: { date: "desc" },
      });
      return NextResponse.json({ success: true, orders });
    }

    return NextResponse.json({ success: false, error: "Brak parametru wyszukiwania." }, { status: 400 });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Prisma Fetch Orders Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, orderData } = await req.json();

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const id = `ORD-${randomNum}`;

    const created = await prisma.order.create({
      data: {
        id,
        userId: userId || "guest_order",
        items: orderData.items,
        subtotal: orderData.subtotal,
        shippingFee: orderData.shippingFee,
        total: orderData.total,
        shippingMethod: orderData.shippingMethod,
        shippingDetails: orderData.shippingDetails,
        paymentMethod: orderData.paymentMethod,
        paymentInfo: orderData.paymentInfo || null,
        status: "Processing",
      },
    });

    return NextResponse.json({ success: true, order: created });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Prisma Create Order Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
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

    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json({ success: true, orderId, status });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Prisma Update Order Status Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
