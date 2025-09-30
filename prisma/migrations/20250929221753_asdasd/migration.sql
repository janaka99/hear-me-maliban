-- CreateTable
CREATE TABLE "public"."WelcomeForm" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "url" TEXT,

    CONSTRAINT "WelcomeForm_pkey" PRIMARY KEY ("id")
);
