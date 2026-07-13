import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: { sessionSlug: string } }
) {
  const session = await prisma.gameSession.findUnique({
    where: { slug: params.sessionSlug },
  });

  if (!session) {
    return NextResponse.json({ error: "Partida no encontrada" }, { status: 404 });
  }

  const alerts = await prisma.alert.findMany({
    where: { gameSessionId: session.id, status: "RELEASED" },
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      content: true,
      order: true,
      releasedAt: true,
    },
  });

  return NextResponse.json({ alerts });
}
