import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveGameSession } from "@/lib/session";

/**
 * Reset total: borra todos los votos de la partida activa.
 * No toca invitados ni pistas.
 */
export async function POST() {
  const session = await getActiveGameSession();
  const result = await prisma.vote.deleteMany({
    where: { gameSessionId: session.id },
  });
  return NextResponse.json({ ok: true, deleted: result.count });
}
