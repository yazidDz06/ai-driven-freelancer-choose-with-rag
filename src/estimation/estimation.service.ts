import { Injectable } from "@nestjs/common";
import type { Region } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { AnalysisResult, EffortSourceId } from "../llm/schemas/analysis.schema";


const FALLBACK_TIER_HOURS: Record<string, [number, number]> = {
  simple: [8, 16],
  medium: [16, 40],
  complex: [40, 80],
};


const WEEKLY_CAPACITY_HOURS = 25;


const DEFAULT_HOURLY_RATE = 30;

export type FeasibilityVerdict = "realistic" | "tight" | "unrealistic";

export interface FeatureHourEstimate {
  featureName: string;
  complexityTier: string;
  kbChunkId: string | null;
  hoursMin: number;
  hoursMax: number;
  // Permet au frontend d'afficher "estimation basée sur notre base de
  // connaissances" vs "estimation générique" — transparence pour l'utilisateur.
  source: "knowledge-base" | "fallback";
}

export interface CalculationResult {
  featureBreakdown: FeatureHourEstimate[];
  totalHoursMin: number;
  totalHoursMax: number;
  budgetMin: number;
  budgetMax: number;
  timelineWeeksMin: number;
  timelineWeeksMax: number;
  feasibilityVerdict: FeasibilityVerdict;
  budgetDelta: number; // positif = marge, négatif = manque
  timelineDeltaWeeks: number; // positif = marge, négatif = manque
}

@Injectable()
export class EstimationService {
  constructor(private readonly prisma: PrismaService) {}

  async calculate(
    featureEstimates: AnalysisResult["featureEstimates"],
    requiredRoles: string[],
    clientBudget: number,
    clientDeadline: Date,
    region: Region,
  ): Promise<CalculationResult> {
    const featureBreakdown = await this.resolveFeatureHours(featureEstimates);

    const totalHoursMin = sum(featureBreakdown.map((f) => f.hoursMin));
    const totalHoursMax = sum(featureBreakdown.map((f) => f.hoursMax));

    const hourlyRate = await this.resolveHourlyRate(requiredRoles, region);
    const budgetMin = totalHoursMin * hourlyRate;
    const budgetMax = totalHoursMax * hourlyRate;

    // Une personne par rôle demandé, au minimum 1 pour ne jamais diviser par 0.
    const teamSize = Math.max(requiredRoles.length, 1);
    const timelineWeeksMin = totalHoursMin / (teamSize * WEEKLY_CAPACITY_HOURS);
    const timelineWeeksMax = totalHoursMax / (teamSize * WEEKLY_CAPACITY_HOURS);

    const deadlineWeeks = weeksBetween(new Date(), clientDeadline);

    const budgetVerdict = compareToRange(clientBudget, budgetMin, budgetMax);
    const timelineVerdict = compareToRange(deadlineWeeks, timelineWeeksMin, timelineWeeksMax);
    const feasibilityVerdict = worstOf(budgetVerdict, timelineVerdict);

    return {
      featureBreakdown,
      totalHoursMin,
      totalHoursMax,
      budgetMin: round(budgetMin),
      budgetMax: round(budgetMax),
      timelineWeeksMin: round(timelineWeeksMin),
      timelineWeeksMax: round(timelineWeeksMax),
      feasibilityVerdict,
      budgetDelta: round(clientBudget - (budgetMin + budgetMax) / 2),
      timelineDeltaWeeks: round(deadlineWeeks - (timelineWeeksMin + timelineWeeksMax) / 2),
    };
  }


  private async resolveFeatureHours(
    featureEstimates: AnalysisResult["featureEstimates"],
  ): Promise<FeatureHourEstimate[]> {
    const chunkIds = featureEstimates
      .map((f) => f.kbChunkId)
      .filter((id): id is EffortSourceId => id !== null);

  
    const chunks = await this.prisma.knowledgeChunk.findMany({
      where: { id: { in: chunkIds } },
      select: { id: true, hoursMin: true, hoursMax: true },
    });
    const chunkById = new Map(chunks.map((c) => [c.id, c]));

    return featureEstimates.map((feature) => {
      const chunk = feature.kbChunkId ? chunkById.get(feature.kbChunkId) : undefined;

      if (chunk?.hoursMin != null && chunk?.hoursMax != null) {
        const [hoursMin, hoursMax] = splitRangeByTier(
          chunk.hoursMin,
          chunk.hoursMax,
          feature.complexityTier,
        );
        return {
          featureName: feature.featureName,
          complexityTier: feature.complexityTier,
          kbChunkId: feature.kbChunkId,
          hoursMin,
          hoursMax,
          source: "knowledge-base" as const,
        };
      }

      const [hoursMin, hoursMax] = FALLBACK_TIER_HOURS[feature.complexityTier];
      return {
        featureName: feature.featureName,
        complexityTier: feature.complexityTier,
        kbChunkId: null,
        hoursMin,
        hoursMax,
        source: "fallback" as const,
      };
    });
  }

  
  private async resolveHourlyRate(requiredRoles: string[], region: Region): Promise<number> {
    if (requiredRoles.length === 0) return DEFAULT_HOURLY_RATE;

   
    const rates = await this.prisma.rateCard.findMany({
      where: { role: { in: requiredRoles }, region },
      select: { hourlyRate: true },
    });

    if (rates.length === 0) return DEFAULT_HOURLY_RATE;

    return sum(rates.map((r) => r.hourlyRate)) / rates.length;
  }
}


function splitRangeByTier(min: number, max: number, tier: string): [number, number] {
  const third = (max - min) / 3;
  switch (tier) {
    case "simple":
      return [min, round(min + third)];
    case "medium":
      return [round(min + third), round(min + 2 * third)];
    case "complex":
      return [round(min + 2 * third), max];
    default:
      return [min, max];
  }
}

function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function weeksBetween(from: Date, to: Date): number {
  const msPerWeek = 1000 * 60 * 60 * 24 * 7;
  return (to.getTime() - from.getTime()) / msPerWeek;
}


function compareToRange(clientValue: number, min: number, max: number): FeasibilityVerdict {
  if (clientValue >= max) return "realistic";
  if (clientValue >= min) return "tight";
  return "unrealistic";
}


function worstOf(a: FeasibilityVerdict, b: FeasibilityVerdict): FeasibilityVerdict {
  const severity: Record<FeasibilityVerdict, number> = { realistic: 0, tight: 1, unrealistic: 2 };
  return severity[a] >= severity[b] ? a : b;
}