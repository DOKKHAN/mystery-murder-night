import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const guestSlug = body?.guestSlug;
  const suspectId = body?.suspectId;

  if (!guestSlug || !suspectId) {
    return NextResponse.json(
      { error: "Falta el invitado o el sospechoso" },
      { status: 400 }
    );
  }

  const voter = await prisma.guest.findUnique({ where: { slug: guestSlug } });
  if (!voter) {
    return NextResponse.json({ error: "Invitado no encontrado" }, { status: 404 });
  }

  const suspect = await prisma.guest.findUnique({ where: { id: suspectId } });
  if (!suspect || suspect.gameSessionId !== voter.gameSessionId) {
    return NextResponse.json({ error: "Sospechoso inválido" }, { status: 400 });
  }

  const existing = await prisma.vote.findUnique({
    where: {
      gameSessionId_voterId: {
        gameSessionId: voter.gameSessionId,
        voterId: voter.id,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Ya enviaste tu sospecha" },
      { status: 409 }
    );
  }

  const vote = await prisma.vote.create({
    data: {
      gameSessionId: voter.gameSessionId,
      voterId: voter.id,
      suspectId: suspect.id,
    },
    include: {
      suspect: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(vote, { status: 201 });
}
