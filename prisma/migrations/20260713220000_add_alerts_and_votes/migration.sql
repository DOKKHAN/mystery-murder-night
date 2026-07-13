-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('HIDDEN', 'RELEASED');

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "gameSessionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "AlertStatus" NOT NULL DEFAULT 'HIDDEN',
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" TEXT NOT NULL,
    "gameSessionId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "suspectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alerts_gameSessionId_idx" ON "alerts"("gameSessionId");

-- CreateIndex
CREATE INDEX "votes_gameSessionId_idx" ON "votes"("gameSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "votes_gameSessionId_voterId_key" ON "votes"("gameSessionId", "voterId");

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_suspectId_fkey" FOREIGN KEY ("suspectId") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
