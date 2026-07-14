import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveGameSession } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Prende/apaga que los invitados vean el cuadro de votación. */
export async function POST() {
  const session = await getActiveGameSession();
  const updated = await prisma.gameSession.update({
    where: { id: session.id },
    data: { votingEnabled: !session.votingEnabled },
  });
  return NextResponse.json({ votingEnabled: updated.votingEnabled });
}
