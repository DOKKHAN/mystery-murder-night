# Flujo de trabajo: fix local → push → deploy en Coolify

Este documento existe porque el log de deploy de Coolify **no muestra la
salida real de `npm run build`** (BuildKit la colapsa) y porque cambiar
variables de entorno o el esquema de la base requiere pasos manuales en
Coolify que el código por sí solo no cubre. Seguir este orden evita quemar
ciclos de deploy (2-3 min cada uno) en errores que se detectan en segundos
en local.

## Regla de oro

**Nunca pushear sin haber buildeado local primero.** Coolify no es
un entorno de debugging — es el último paso, no el primero.

## El loop, paso a paso

### 1. Hacer el fix
Se hace acá, en el chat, sobre los archivos del proyecto.

### 2. Verificar el build ANTES de pushear (obligatorio)

Reproduce exactamente lo que hace Coolify, con salida completa sin recortar:

```powershell
docker compose build app --no-cache --progress=plain
```

Si falla, el error real de TypeScript/Next.js aparece ahí mismo, en
segundos. Se corrige y se repite este paso hasta que compile. **No se
pasa al paso 3 hasta que esto termine sin errores.**

Atajo más rápido si ya tenés Node instalado (salta la capa de Docker,
sirve para iterar rápido en errores de TypeScript, pero no reemplaza el
paso 2 antes de pushear la versión final):

```powershell
npm run build
```

### 3. Probar el stack completo local

```powershell
docker compose up
```

Entrá a `localhost:3000` y `localhost:3000/admin/login`. Esto agarra
errores de runtime (variables de entorno faltantes, conexión a la base,
etc.) que un build exitoso no garantiza que no existan.

### 4. Commit y push

En PowerShell clásico (`&&` no funciona ahí, un comando por línea):

```powershell
git add -A
git commit -m "mensaje"
git push
```

### 5. Confirmar que Coolify tomó el commit correcto

Comparar el hash que aparece en el log de deploy
(`Importing DOKKHAN/mystery-murder-night:main (commit sha ...)`) contra:

```powershell
git log --oneline -1
```

Si no coinciden, Coolify todavía no vio el push (esperar o forzar redeploy).

### 6. Leer el log de deploy por fase, no solo el error final

- Falla durante **"Pulling & building required images"** → error de
  compilación. Si pasaste el paso 2, esto no debería volver a pasar. Si
  pasa igual, sospechar de una diferencia entre tu entorno local y el de
  Coolify (variables de entorno de build, versión de Docker, etc.)
- Falla en **"Starting new application"** / "Container ... is unhealthy"
  → problema de arranque (variables de entorno mal cargadas en Coolify,
  volumen corrupto de un intento anterior, conexión a la base). Ir a los
  logs del contenedor específico (`db` o `app`) en la pestaña Logs de
  Coolify, no al log de deploy.
- Todo dice "Started" pero la app no responde bien → revisar logs del
  contenedor `app` puntualmente (no `db`), probablemente un error en
  runtime (Prisma, variable faltante, etc.)

### 7. Cuando cambian variables de entorno

Actualizar `.env.example` en el repo **y** los mismos valores a mano en
Coolify → Environment Variables. Coolify no lee `.env.example` del repo,
solo lo usa como referencia de qué variables existen.

### 8. Cuando cambia el esquema de Prisma (nueva migración)

Después de un deploy exitoso, probar la funcionalidad nueva en el
backoffice. Si tira error 500, revisar logs del contenedor `app` — ahí
aparece el error de Prisma si la migración no se aplicó bien.

## Cosas que ya mordimos una vez (no repetir)

- **`&&` no funciona en Windows PowerShell clásico.** Un comando por
  línea, o usar PowerShell 7 (`pwsh`).
- **`${VAR:?mensaje}` en Coolify no es un mensaje de error** — Coolify lo
  interpreta como valor por defecto precargado en la UI. Usar `${VAR:?}`
  sin mensaje, o un default corto y válido si hace falta uno.
- **Postgres en Alpine necesita OpenSSL instalado a mano** en el
  Dockerfile (`apk add --no-cache openssl`), si no el motor de Prisma no
  arranca.
- **Un intento fallido de arranque de Postgres puede dejar el volumen
  corrupto.** Si el fallo fue por credenciales o init, borrar el volumen
  `db_data` en Coolify antes de reintentar. Si el fallo fue de compilación
  (paso 2), el volumen ni se toca — no hace falta tocarlo.
