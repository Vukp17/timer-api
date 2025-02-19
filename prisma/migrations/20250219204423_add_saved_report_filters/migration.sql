-- CreateTable
CREATE TABLE "SavedReportFilter" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "fromDate" TEXT,
    "toDate" TEXT,
    "projectIds" INTEGER[],
    "tagIds" INTEGER[],
    "clientIds" INTEGER[],
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedReportFilter_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SavedReportFilter" ADD CONSTRAINT "SavedReportFilter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
