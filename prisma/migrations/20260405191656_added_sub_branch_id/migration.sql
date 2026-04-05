/*
  Warnings:

  - You are about to drop the column `subBranchId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_subBranchId_fkey";

-- DropIndex
DROP INDEX "User_subBranchId_idx";

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "subBranchId" INTEGER;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "subBranchId";

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_subBranchId_fkey" FOREIGN KEY ("subBranchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
