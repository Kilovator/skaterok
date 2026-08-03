import { NextResponse } from "next/server";
import { sql, initDbTables } from "@/lib/neonDb";

export async function POST(req: Request) {
  try {
    await initDbTables();
    const { action, userId, buildId, build } = await req.json();

    if (action === "add") {
      const id = "build_" + Math.random().toString(36).substring(2, 9);
      const createdAt = new Date().toISOString();
      const newBuild = {
        id,
        userId,
        name: build.name || `Custom Build #${Date.now().toString().slice(-4)}`,
        deck: build.deck,
        wheels: build.wheels,
        truck: build.truck,
        bolt: build.bolt,
        price: build.price || 7999,
        createdAt,
      };

      await sql`
        INSERT INTO saved_builds (id, user_id, name, deck, wheels, truck, bolt, price, created_at)
        VALUES (
          ${id},
          ${userId},
          ${newBuild.name},
          ${JSON.stringify(build.deck)},
          ${JSON.stringify(build.wheels)},
          ${JSON.stringify(build.truck)},
          ${JSON.stringify(build.bolt)},
          ${newBuild.price},
          ${createdAt}
        );
      `;

      return NextResponse.json({ success: true, build: newBuild });
    }

    if (action === "delete") {
      await sql`
        DELETE FROM saved_builds
        WHERE id = ${buildId} AND user_id = ${userId};
      `;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Neon DB Saved Builds Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
