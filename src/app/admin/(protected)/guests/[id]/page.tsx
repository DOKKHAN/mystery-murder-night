import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GuestForm } from "@/components/admin/GuestForm";

export const dynamic = "force-dynamic";

export default async function EditGuestPage({
  params,
}: {
  params: { id: string };
}) {
  const guest = await prisma.guest.findUnique({ where: { id: params.id } });
  if (!guest) {
    notFound();
  }

  return (
    <div className="admin-page">
      <h1>Editar invitado</h1>
      <GuestForm
        guestId={guest.id}
        initialValues={{
          name: guest.name,
          roleName: guest.roleName,
          publicDescription: guest.publicDescription,
          secretInfo: guest.secretInfo,
        }}
      />
    </div>
  );
}
