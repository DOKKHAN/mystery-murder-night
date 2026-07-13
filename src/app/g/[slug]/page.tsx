import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GuestExperience } from "@/components/guest/GuestExperience";

export const dynamic = "force-dynamic";

export default async function GuestPage({
  params,
}: {
  params: { slug: string };
}) {
  const guest = await prisma.guest.findUnique({
    where: { slug: params.slug },
    include: { gameSession: true },
  });

  if (!guest) {
    notFound();
  }

  return (
    <GuestExperience
      guestName={guest.name}
      roleName={guest.roleName}
      publicDescription={guest.publicDescription}
      secretInfo={guest.secretInfo}
      sessionName={guest.gameSession.name}
      sessionSlug={guest.gameSession.slug}
    />
  );
}
