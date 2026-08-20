-- AlterTable
ALTER TABLE "guardian_tickets" ALTER COLUMN "confidence" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "missions" ALTER COLUMN "exp_reward" SET DEFAULT 0,
ALTER COLUMN "category" SET DEFAULT 'DAILY';

-- CreateTable
CREATE TABLE "guardian_messages" (
    "id" TEXT NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "sender_id" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guardian_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "guardian_messages_ticket_id_idx" ON "guardian_messages"("ticket_id");

-- AddForeignKey
ALTER TABLE "guardian_messages" ADD CONSTRAINT "guardian_messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "guardian_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
