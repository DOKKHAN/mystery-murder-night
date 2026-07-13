# Murder Mystery Night

App para operar una partida de murder mystery night: backoffice para
quien organiza y front público para los invitados desde el celular.

## Requisitos

- Docker Desktop instalado y corriendo.

## Levantar el proyecto

1. Copiá `.env.example` a `.env` y completá los valores (usuario/contraseña
   de Postgres, usuario/contraseña del admin, y un `SESSION_SECRET` largo
   y aleatorio).

   ```bash
   cp .env.example .env
   ```

2. Levantá todo con un solo comando:

   ```bash
   docker-compose up
   ```

   Esto construye la imagen de la app, levanta Postgres, corre las
   migraciones de Prisma automáticamente al arrancar el contenedor y deja
   el servidor escuchando. No hace falta correr `npm install` ni
   migraciones a mano.

3. Abrí:
   - Front público: http://localhost:3000
   - Backoffice: http://localhost:3000/admin/login (usuario/contraseña
     definidos en `.env`)

Para parar todo: `Ctrl+C` y después `docker-compose down` (agregá `-v` si
además querés borrar los datos de Postgres).

## Uso básico

1. Entrá al backoffice y creá invitados en **Invitados**. Cada invitado
   recibe un link personal (`/g/[slug]`) que podés copiar desde la lista
   y mandar por WhatsApp.
2. Cargá las pistas en **Pistas** (quedan ocultas por defecto, con orden
   sugerido de liberación).
3. Durante la partida, liberá las pistas una por una con el botón
   "Liberar". Los invitados las ven aparecer solas en su celular (el
   front hace polling cada 5 segundos), sin recargar la página.

## Estructura

```
src/app/g/[slug]        # vista pública del invitado
src/app/admin           # backoffice (login, pistas, invitados)
src/app/api             # endpoints (auth, guests, clues, pistas públicas)
src/components          # componentes de front público y backoffice
src/lib                 # prisma, auth de sesión, helpers
prisma/schema.prisma    # modelo de datos (GameSession, Guest, Clue)
design-reference/       # mockup original ("House of Pochi") usado como
                         # referencia visual del front público
```

## Desarrollo local sin Docker (opcional)

```bash
npm install
npx prisma migrate dev
npm run dev
```

Necesitás una instancia de Postgres accesible y `DATABASE_URL` apuntando
a ella (por ejemplo, levantando solo ese servicio con
`docker-compose up db`).

## Reusar la app para otra partida

El modelo de datos soporta múltiples partidas (`GameSession`) para no
mezclar invitados ni pistas entre eventos, pero el backoffice actual
siempre opera sobre la partida activa (se crea una automáticamente la
primera vez que hace falta). Para arrancar una partida nueva desde cero,
lo más simple hoy es limpiar `guests` y `clues` de la partida activa, o
crear una fila nueva en `game_sessions` marcada como `is_active = true`
(y desactivar la anterior) directamente en la base. Si en el futuro hace
falta manejar varias partidas en paralelo desde el backoffice, se puede
agregar un selector de partida sin tocar el esquema.
