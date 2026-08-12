import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { action, userId, buildId, build } = await req.json();

    if (action === "add") {
      const name = build.name || `Custom Build #${Date.now().toString().slice(-4)}`;
      const price = build.price || 7999;

      const created = await prisma.savedBuild.create({
        data: {
          userId,
          name,
          deck: build.deck,
          wheels: build.wheels,
          truck: build.truck,
          bolt: build.bolt,
          price,
        },
      });

      return NextResponse.json({ success: true, build: created });
    }

    if (action === "delete") {
      await prisma.savedBuild.deleteMany({
        where: {
          id: buildId,
          userId: userId,
        },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Prisma Saved Builds Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
