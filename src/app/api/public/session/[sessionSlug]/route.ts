import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { sessionSlug: string } }
) {
  const session = await prisma.gameSession.findUnique({
    where: { slug: params.sessionSlug },
    select: {
      votingEnabled: true,
      revealEnabled: true,
      revealTitle: true,
      revealSubtitle: true,
      revealBody: true,
      revealTagline: true,
      revealImageUrl: true,
    },
  });

  if (!session) {
    return NextResponse.json({ error: "Partida no encontrada" }, { status: 404 });
  }

  return NextResponse.json(session);
}
