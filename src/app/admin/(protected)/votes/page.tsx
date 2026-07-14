import { prisma } from "@/lib/prisma";
import { getActiveGameSession } from "@/lib/session";
import { VoteList } from "@/components/admin/VoteList";
import { RevealPanel } from "@/components/admin/RevealPanel";

export const dynamic = "force-dynamic";

export default async function VotesPage() {
  const session = await getActiveGameSession();
  const votes = await prisma.vote.findMany({
    where: { gameSessionId: session.id },
    orderBy: { createdAt: "desc" },
    include: {
      voter: { select: { id: true, name: true } },
      suspect: { select: { id: true, name: true } },
    },
  });

  return (
    <div className="admin-page">
      <h1>Votación</h1>
      <p className="muted" style={{ marginBottom: 16 }}>
        Partida activa: {session.name}
      </p>

      <VoteList
        initialVotes={votes.map((v) => ({
          id: v.id,
          createdAt: v.createdAt.toISOString(),
          voter: v.voter,
          suspect: v.suspect,
        }))}
        initialVotingEnabled={session.votingEnabled}
      />

      <h2 className="section-title" style={{ marginTop: 32, fontSize: 20 }}>
        Revelación final
      </h2>
      <RevealPanel
        initialRevealEnabled={session.revealEnabled}
        initialValues={{
          revealTitle: session.revealTitle ?? "",
          revealSubtitle: session.revealSubtitle ?? "",
          revealBody: session.revealBody ?? "",
          revealTagline: session.revealTagline ?? "",
          revealImageUrl: session.revealImageUrl ?? "",
        }}
      />
    </div>
  );
}
