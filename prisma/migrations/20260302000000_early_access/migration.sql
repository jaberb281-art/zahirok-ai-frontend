-- CreateTable
CREATE TABLE "early_access_submissions" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "creator_types" TEXT[],
    "languages" TEXT[],
    "interests" TEXT[],
    "current_workflow" TEXT NOT NULL,
    "runs_music_channel" TEXT NOT NULL,
    "channel_url" TEXT,
    "social_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "early_access_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "early_access_submissions_email_key" ON "early_access_submissions"("email");
