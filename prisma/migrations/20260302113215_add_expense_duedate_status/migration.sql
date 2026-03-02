-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDENTE';

-- CreateIndex
CREATE INDEX "Expense_status_idx" ON "Expense"("status");
