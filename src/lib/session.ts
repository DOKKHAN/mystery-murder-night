import { prisma } from "./prisma";

const DEFAULT_SESSION_NAME = "Mi partida";
const DEFAULT_SESSION_SLUG = "partida-1";

/**
 * Devuelve la partida activa. Si todavía no existe ninguna (primer uso),
 * crea una por defecto para que el backoffice funcione sin pasos manuales.
 *
 * El esquema soporta múltiples GameSession para poder reusar la app en el
 * futuro con otra partida distinta, sin mezclar invitados/pistas.
 */
export async function getActiveGameSession() {
  let session = await prisma.gameSession.findFirst({ where: { isActive: true } });

  if (!session) {
    session = await prisma.gameSession.create({
      data: {
        name: DEFAULT_SESSION_NAME,
        slug: DEFAULT_SESSION_SLUG,
        isActive: true,
      },
    });
  }

  return session;
}
