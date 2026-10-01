import { Injectable, NotFoundException } from "@nestjs/common";
import { Priority } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { RetrievalService } from "../retrieval/retrieval.service";
import { LlmService } from "../llm/llm.service";
import { EstimationService } from "../estimation/estimation.service";
import { CreateProjectDto } from "./dto/create-project.dto";

const CHUNKS_TO_RETRIEVE = 8;

@Injectable()
export class AnalysisService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly retrieval: RetrievalService,
    private readonly llm: LlmService,
    private readonly estimation: EstimationService,
  ) {}

  /**
   * Le chef d'orchestre décrit tout au long de la conversation : il ne
   * contient AUCUNE logique de prompt ni de calcul — juste la séquence
   * retrieval → LLM → estimation → sauvegarde.
   */
  async createAndAnalyze(dto: CreateProjectDto) {
    const deadline = new Date(dto.deadline);
    const priority = dto.priority ?? Priority.BALANCED;

    // 1) Le snapshot brut de ce que le client a saisi — aucune IA ici.
    const project = await this.prisma.project.create({
      data: { description: dto.description, deadline, budget: dto.budget, priority, region: dto.region },
    });

    // 2) RAG : quelles fiches sont pertinentes pour ce projet ?
    const chunks = await this.retrieval.findRelevantChunks(dto.description, CHUNKS_TO_RETRIEVE);

    // 3) IA : interprétation, validée par zod (voir LlmService).
    const { analysis, rawText } = await this.llm.analyzeProject(
      { description: dto.description, deadline: dto.deadline, budget: dto.budget, priority },
      chunks,
    );

    // 4) Déterministe : heures, budget, délai, verdict — aucune IA ici.
    const calculation = await this.estimation.calculate(
      analysis.featureEstimates,
      analysis.requiredRoles,
      dto.budget,
      deadline,
      dto.region,
    );

    // 5) Persistance. Les appels réseau lents (retrieval, LLM) sont déjà
    // terminés à ce stade — la transaction ne couvre QUE les écritures en
    // base, pour ne jamais garder une transaction ouverte pendant un appel
    // externe.
    const saved = await this.prisma.$transaction(async (tx) => {
      const analysisRow = await tx.analysis.create({
        data: {
          projectId: project.id,
          projectType: analysis.projectType,
          functionalRequirements: analysis.functionalRequirements,
          technicalRequirements: analysis.technicalRequirements,
          recommendedStack: analysis.recommendedStack,
          requiredRoles: analysis.requiredRoles,
          risks: analysis.risks,
          missingInfo: analysis.missingInfo,
          rawLlmResponse: rawText,
        },
      });

      await tx.featureEstimate.createMany({
        data: calculation.featureBreakdown.map((f) => ({
          analysisId: analysisRow.id,
          featureName: f.featureName,
          complexityTier: f.complexityTier,
          kbChunkId: f.kbChunkId,
          hoursMin: f.hoursMin,
          hoursMax: f.hoursMax,
        })),
      });

      const calculationRow = await tx.calculationResult.create({
        data: {
          analysisId: analysisRow.id,
          totalHoursMin: calculation.totalHoursMin,
          totalHoursMax: calculation.totalHoursMax,
          budgetMin: calculation.budgetMin,
          budgetMax: calculation.budgetMax,
          timelineWeeksMin: calculation.timelineWeeksMin,
          timelineWeeksMax: calculation.timelineWeeksMax,
          feasibilityVerdict: calculation.feasibilityVerdict,
          budgetDelta: calculation.budgetDelta,
          timelineDeltaWeeks: calculation.timelineDeltaWeeks,
        },
      });

      return { analysisRow, calculationRow };
    });

    return this.getById(saved.analysisRow.id);
  }

  /**
   * Relit un résultat déjà sauvegardé — sert au lien partageable
   * (GET /api/analysis/:id) et est réutilisé juste au-dessus.
   */
  async getById(analysisId: string) {
    const analysis = await this.prisma.analysis.findUnique({
      where: { id: analysisId },
      include: {
        project: true,
        featureEstimates: { include: { kbChunk: { select: { title: true } } } },
        calculationResult: true,
      },
    });

    if (!analysis) {
      throw new NotFoundException(`Aucune analyse trouvée avec l'id ${analysisId}`);
    }

    return analysis;
  }
}