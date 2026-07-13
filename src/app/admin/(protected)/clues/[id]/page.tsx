import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClueForm } from "@/components/admin/ClueForm";

export const dynamic = "force-dynamic";

export default async function EditCluePage({
  params,
}: {
  params: { id: string };
}) {
  const clue = await prisma.clue.findUnique({ where: { id: params.id } });
  if (!clue) {
    notFound();
  }

  return (
    <div className="admin-page">
      <h1>Editar pista</h1>
      <ClueForm
        clueId={clue.id}
        initialValues={{
          title: clue.title,
          content: clue.content,
          imageUrl: clue.imageUrl,
        }}
      />
    </div>
  );
}
