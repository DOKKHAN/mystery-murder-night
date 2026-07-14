-- AlterTable
ALTER TABLE "game_sessions"
  ADD COLUMN "revealEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "revealTitle" TEXT,
  ADD COLUMN "revealSubtitle" TEXT,
  ADD COLUMN "revealBody" TEXT,
  ADD COLUMN "revealTagline" TEXT,
  ADD COLUMN "revealImageUrl" TEXT;
