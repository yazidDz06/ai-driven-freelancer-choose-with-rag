/*
  Warnings:

  - A unique constraint covering the columns `[role,region]` on the table `rate_cards` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `region` to the `rate_cards` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Region" AS ENUM ('NORTH_AMERICA', 'WESTERN_EUROPE', 'EASTERN_EUROPE', 'LATIN_AMERICA', 'AFRICA', 'ASIA');

-- DropIndex
DROP INDEX "rate_cards_role_key";

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "region" "Region" NOT NULL DEFAULT 'WESTERN_EUROPE';

-- AlterTable
ALTER TABLE "rate_cards" ADD COLUMN     "region" "Region" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "rate_cards_role_region_key" ON "rate_cards"("role", "region");
