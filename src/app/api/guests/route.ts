import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveGameSession } from "@/lib/session";
import { generateGuestSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getActiveGameSession();
  const guests = await prisma.guest.findMany({
    where: { gameSessionId: session.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(guests);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.name || !body?.secretInfo) {
    return NextResponse.json(
      { error: "Nombre e información secreta son obligatorios" },
      { status: 400 }
    );
  }

  const session = await getActiveGameSession();
  const guest = await prisma.guest.create({
    data: {
      gameSessionId: session.id,
      slug: generateGuestSlug(body.name),
      name: body.name,
      roleName: body.roleName || null,
      publicDescription: body.publicDescription || null,
      secretInfo: body.secretInfo,
    },
  });

  return NextResponse.json(guest, { status: 201 });
}
