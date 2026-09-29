-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOWEST_COST', 'FASTEST_DELIVERY', 'BEST_QUALITY', 'BALANCED');

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'BALANCED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_chunks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "project_types" TEXT[],
    "tags" TEXT[],
    "content" TEXT NOT NULL,
    "hours_min" INTEGER,
    "hours_max" INTEGER,
    "embedding" vector(768),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analyses" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "project_type" TEXT NOT NULL,
    "functional_requirements" JSONB NOT NULL,
    "technical_requirements" JSONB NOT NULL,
    "recommended_stack" JSONB NOT NULL,
    "required_roles" JSONB NOT NULL,
    "risks" JSONB NOT NULL,
    "missing_info" JSONB NOT NULL,
    "raw_llm_response" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_estimates" (
    "id" TEXT NOT NULL,
    "analysis_id" TEXT NOT NULL,
    "feature_name" TEXT NOT NULL,
    "complexity_tier" TEXT NOT NULL,
    "kb_chunk_id" TEXT,
    "hours_min" INTEGER NOT NULL,
    "hours_max" INTEGER NOT NULL,

    CONSTRAINT "feature_estimates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calculation_results" (
    "id" TEXT NOT NULL,
    "analysis_id" TEXT NOT NULL,
    "total_hours_min" INTEGER NOT NULL,
    "total_hours_max" INTEGER NOT NULL,
    "budget_min" DOUBLE PRECISION NOT NULL,
    "budget_max" DOUBLE PRECISION NOT NULL,
    "timeline_weeks_min" DOUBLE PRECISION NOT NULL,
    "timeline_weeks_max" DOUBLE PRECISION NOT NULL,
    "feasibility_verdict" TEXT NOT NULL,
    "budget_delta" DOUBLE PRECISION NOT NULL,
    "timeline_delta_weeks" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calculation_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_cards" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "hourly_rate" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "rate_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "calculation_results_analysis_id_key" ON "calculation_results"("analysis_id");

-- CreateIndex
CREATE UNIQUE INDEX "rate_cards_role_key" ON "rate_cards"("role");

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_estimates" ADD CONSTRAINT "feature_estimates_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "analyses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_estimates" ADD CONSTRAINT "feature_estimates_kb_chunk_id_fkey" FOREIGN KEY ("kb_chunk_id") REFERENCES "knowledge_chunks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculation_results" ADD CONSTRAINT "calculation_results_analysis_id_fkey" FOREIGN KEY ("analysis_id") REFERENCES "analyses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
