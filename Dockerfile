FROM node:20-alpine
WORKDIR /app

# Alpine no trae OpenSSL por defecto; el motor de Prisma lo necesita en
# runtime para detectar la versión de libssl correcta.
RUN apk add --no-cache openssl

# Instalamos dependencias primero (mejor cache de capas).
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm install

# Copiamos el resto del código y compilamos.
COPY . .
RUN npm run build

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

# Al arrancar el contenedor: aplicar migraciones pendientes y levantar el server.
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
