-- CreateEnum
CREATE TYPE "SchoolSection" AS ENUM ('PRIMARY', 'JSS', 'SSS');

-- DropIndex
DROP INDEX "Grade_level_key";

-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "arm" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Grade" ADD COLUMN     "section" "SchoolSection" NOT NULL;

-- CreateTable
CREATE TABLE "Owner" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT NOT NULL,
    "img" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Accountant" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT NOT NULL,
    "img" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Accountant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Owner_username_key" ON "Owner"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Owner_email_key" ON "Owner"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Owner_phone_key" ON "Owner"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Accountant_username_key" ON "Accountant"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Accountant_email_key" ON "Accountant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Accountant_phone_key" ON "Accountant"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_section_level_key" ON "Grade"("section", "level");

