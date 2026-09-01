-- CreateEnum
CREATE TYPE "GenerationJobStatus" AS ENUM ('queued', 'generating', 'succeeded', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "SongStatus" AS ENUM ('completed', 'failed', 'archived');

-- CreateEnum
CREATE TYPE "SongVisibility" AS ENUM ('private', 'public');

-- CreateTable
CREATE TABLE "generation_jobs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "device_id" TEXT,
    "status" "GenerationJobStatus" NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_task_id" TEXT,
    "error_code" TEXT,
    "error_message" TEXT,
    "prompt" TEXT NOT NULL,
    "lyrics" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '',
    "instrumental" BOOLEAN NOT NULL DEFAULT false,
    "requested_duration_sec" INTEGER,
    "provider_duration_sec" DECIMAL(10,2),
    "credits_charged" INTEGER,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generation_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "songs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "device_id" TEXT,
    "generation_job_id" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "prompt" TEXT NOT NULL,
    "lyrics" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '',
    "language" TEXT,
    "instrumental" BOOLEAN NOT NULL DEFAULT false,
    "bpm" INTEGER,
    "music_key" TEXT,
    "requested_duration_sec" INTEGER,
    "duration_sec" DECIMAL(10,2),
    "status" "SongStatus" NOT NULL DEFAULT 'completed',
    "visibility" "SongVisibility" NOT NULL DEFAULT 'private',
    "audio_storage_key" TEXT NOT NULL,
    "audio_mime_type" TEXT NOT NULL,
    "audio_byte_size" BIGINT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_task_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "songs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "generation_jobs_provider_task_id_key" ON "generation_jobs"("provider_task_id");

-- CreateIndex
CREATE INDEX "generation_jobs_user_id_created_at_idx" ON "generation_jobs"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "generation_jobs_device_id_created_at_idx" ON "generation_jobs"("device_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "generation_jobs_status_idx" ON "generation_jobs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "songs_generation_job_id_key" ON "songs"("generation_job_id");

-- CreateIndex
CREATE INDEX "songs_user_id_created_at_idx" ON "songs"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "songs_device_id_created_at_idx" ON "songs"("device_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "songs_status_idx" ON "songs"("status");

-- CreateIndex
CREATE INDEX "songs_provider_task_id_idx" ON "songs"("provider_task_id");

-- AddForeignKey
ALTER TABLE "songs" ADD CONSTRAINT "songs_generation_job_id_fkey" FOREIGN KEY ("generation_job_id") REFERENCES "generation_jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
