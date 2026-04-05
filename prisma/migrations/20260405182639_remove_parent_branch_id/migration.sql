/*
  Warnings:

  - You are about to drop the column `parentBranchId` on the `Branch` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Branch" DROP CONSTRAINT "Branch_parentBranchId_fkey";

-- DropIndex
DROP INDEX "Branch_parentBranchId_idx";

-- AlterTable
ALTER TABLE "Branch" DROP COLUMN "parentBranchId";
