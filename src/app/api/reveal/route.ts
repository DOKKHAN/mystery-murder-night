import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveGameSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const session = await getActiveGameSession();
  const updated = await prisma.gameSession.update({
    where: { id: session.id },
    data: {
      revealTitle: body.revealTitle ?? null,
      revealSubtitle: body.revealSubtitle ?? null,
      revealBody: body.revealBody ?? null,
      revealTagline: body.revealTagline ?? null,
      revealImageUrl: body.revealImageUrl ?? null,
    },
  });

  return NextResponse.json(updated);
}
