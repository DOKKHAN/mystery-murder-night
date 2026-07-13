import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveGameSession } from "@/lib/session";

export async function GET() {
  const session = await getActiveGameSession();
  const votes = await prisma.vote.findMany({
    where: { gameSessionId: session.id },
    orderBy: { createdAt: "desc" },
    include: {
      voter: { select: { id: true, name: true } },
      suspect: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(
    votes.map((v) => ({
      id: v.id,
      createdAt: v.createdAt,
      voter: v.voter,
      suspect: v.suspect,
    }))
  );
}
