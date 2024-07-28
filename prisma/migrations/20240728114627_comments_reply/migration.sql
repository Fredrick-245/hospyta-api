-- CreateTable
CREATE TABLE "commentReply" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "commentId" INTEGER NOT NULL,

    CONSTRAINT "commentReply_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "commentReply" ADD CONSTRAINT "commentReply_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
