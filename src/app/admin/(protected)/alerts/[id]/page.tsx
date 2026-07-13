import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AlertForm } from "@/components/admin/AlertForm";

export const dynamic = "force-dynamic";

export default async function EditAlertPage({
  params,
}: {
  params: { id: string };
}) {
  const alert = await prisma.alert.findUnique({ where: { id: params.id } });
  if (!alert) {
    notFound();
  }

  return (
    <div className="admin-page">
      <h1>Editar alerta</h1>
      <AlertForm
        alertId={alert.id}
        initialValues={{ title: alert.title, content: alert.content }}
      />
    </div>
  );
}
