-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "isMain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentBranchId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "subBranchId" INTEGER;

-- CreateIndex
CREATE INDEX "Branch_parentBranchId_idx" ON "Branch"("parentBranchId");

-- CreateIndex
CREATE INDEX "User_subBranchId_idx" ON "User"("subBranchId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_subBranchId_fkey" FOREIGN KEY ("subBranchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_parentBranchId_fkey" FOREIGN KEY ("parentBranchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
