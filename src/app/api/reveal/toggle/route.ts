import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveGameSession } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Prende/apaga el botón de revelación final para los invitados. */
export async function POST() {
  const session = await getActiveGameSession();
  const updated = await prisma.gameSession.update({
    where: { id: session.id },
    data: { revealEnabled: !session.revealEnabled },
  });
  return NextResponse.json({ revealEnabled: updated.revealEnabled });
}
