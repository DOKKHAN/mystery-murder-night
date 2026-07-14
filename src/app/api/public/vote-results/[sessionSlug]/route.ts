import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

  const votes = await prisma.vote.findMany({
    where: { gameSessionId: session.id },
    include: { suspect: { select: { id: true, name: true } } },
  });

  const counts = new Map<string, { id: string; name: string; count: number }>();
  for (const vote of votes) {
    const existing = counts.get(vote.suspect.id);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(vote.suspect.id, {
        id: vote.suspect.id,
        name: vote.suspect.name,
        count: 1,
      });
    }
  }

  const results = Array.from(counts.values()).sort((a, b) => b.count - a.count);

  return NextResponse.json({ total: votes.length, results });
}
