CREATE TYPE "ProviderKind" AS ENUM ('CASH', 'TOTALPASS', 'WELLHUB');

CREATE TYPE "PlanType" AS ENUM ('DAILY', 'MONTHLY', 'ANNUAL');

CREATE TYPE "QualityLevel" AS ENUM ('BASIC', 'ADVANCED', 'PRO');

CREATE TABLE "Plan" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PlanType" NOT NULL,
    "qualityLevel" "QualityLevel" NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "providerKind" "ProviderKind" NOT NULL DEFAULT 'CASH',
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Plan_active_slot_key"
  ON "Plan"("qualityLevel", "providerKind", "type")
  WHERE "enabled" = true;
