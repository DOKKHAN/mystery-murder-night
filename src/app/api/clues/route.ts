import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveGameSession } from "@/lib/session";

export async function GET() {
  const session = await getActiveGameSession();
  const clues = await prisma.clue.findMany({
    where: { gameSessionId: session.id },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(clues);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.title || !body?.content) {
    return NextResponse.json(
      { error: "Título y contenido son obligatorios" },
      { status: 400 }
    );
  }

  const session = await getActiveGameSession();
  const last = await prisma.clue.findFirst({
    where: { gameSessionId: session.id },
    orderBy: { order: "desc" },
  });

  const clue = await prisma.clue.create({
    data: {
      gameSessionId: session.id,
      title: body.title,
      content: body.content,
      imageUrl: body.imageUrl || null,
      order: (last?.order ?? 0) + 1,
    },
  });

  return NextResponse.json(clue, { status: 201 });
}
