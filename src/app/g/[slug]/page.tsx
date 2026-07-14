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

  const [suspects, myVote] = await Promise.all([
    prisma.guest.findMany({
      where: { gameSessionId: guest.gameSessionId, id: { not: guest.id } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.vote.findUnique({
      where: {
        gameSessionId_voterId: {
          gameSessionId: guest.gameSessionId,
          voterId: guest.id,
        },
      },
      include: { suspect: { select: { id: true, name: true } } },
    }),
  ]);

  return (
    <GuestExperience
      guestSlug={guest.slug}
      guestName={guest.name}
      roleName={guest.roleName}
      publicDescription={guest.publicDescription}
      secretInfo={guest.secretInfo}
      sessionName={guest.gameSession.name}
      sessionSlug={guest.gameSession.slug}
      initialVotingEnabled={guest.gameSession.votingEnabled}
      suspects={suspects}
      initialVote={
        myVote ? { id: myVote.suspect.id, name: myVote.suspect.name } : null
      }
      initialRevealEnabled={guest.gameSession.revealEnabled}
      initialRevealContent={{
        title: guest.gameSession.revealTitle,
        subtitle: guest.gameSession.revealSubtitle,
        body: guest.gameSession.revealBody,
        tagline: guest.gameSession.revealTagline,
        imageUrl: guest.gameSession.revealImageUrl,
      }}
    />
  );
}
