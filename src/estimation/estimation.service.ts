import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { AnalysisResult, EffortSourceId } from "../llm/schemas/analysis.schema";


// Une fonctionnalité SANS fiche associée (kbChunkId: null, ex: "recherche")
// utilise ces fourchettes génériques plutôt que de valoir 0 heure.
const FALLBACK_TIER_HOURS: Record<string, [number, number]> = {
  simple: [8, 16],
  medium: [16, 40],
  complex: [40, 80],
};

// Heures "utiles" par semaine et par personne — pas 40h : ça tient compte
// des réunions, imprévus, contexte-switching. Hypothèse volontairement
// prudente pour ne pas promettre un délai irréaliste.
const WEEKLY_CAPACITY_HOURS = 25;


const DEFAULT_HOURLY_RATE = 30;

export type FeasibilityVerdict = "realistic" | "tight" | "unrealistic";

export interface FeatureHourEstimate {
  featureName: string;
  complexityTier: string;
  kbChunkId: string | null;
  hoursMin: number;
  hoursMax: number;
  
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
  ): Promise<CalculationResult> {
    const featureBreakdown = await this.resolveFeatureHours(featureEstimates);

    const totalHoursMin = sum(featureBreakdown.map((f) => f.hoursMin));
    const totalHoursMax = sum(featureBreakdown.map((f) => f.hoursMax));

    const hourlyRate = await this.resolveHourlyRate(requiredRoles);
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

    // Une seule requête pour toutes les fiches utilisées, plutôt qu'une
    // requête par feature dans la boucle (évite le problème classique N+1).
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

 
  private async resolveHourlyRate(requiredRoles: string[]): Promise<number> {
    if (requiredRoles.length === 0) return DEFAULT_HOURLY_RATE;

    const rates = await this.prisma.rateCard.findMany({
      where: { role: { in: requiredRoles } },
      select: { hourlyRate: true },
    });

    if (rates.length === 0) return DEFAULT_HOURLY_RATE;

    return sum(rates.map((r) => r.hourlyRate)) / rates.length;
  }
}

// Une fiche donne UNE fourchette globale (ex: auth = 16-120h) qui couvre
// plusieurs niveaux de complexité décrits dans son texte. On n'a pas de
// chiffre exact par niveau en base (seulement dans le texte de la fiche),
// donc on divise la fourchette totale en 3 tiers égaux. C'est une
// approximation assumée, pas une science exacte — mais déterministe,
// reproductible, et bien plus défendable qu'un chiffre inventé par l'IA.
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

// Compare une valeur client (budget ou délai en semaines) à une fourchette
// calculée. >= max : à l'aise. Entre min et max : jouable mais juste.
// < min : hors de portée.
function compareToRange(clientValue: number, min: number, max: number): FeasibilityVerdict {
  if (clientValue >= max) return "realistic";
  if (clientValue >= min) return "tight";
  return "unrealistic";
}

// Le verdict final retient le PIRE des deux axes (budget, délai) : un projet
// avec un budget confortable mais un délai intenable reste globalement "tight"
// ou "unrealistic", pas "realistic".
function worstOf(a: FeasibilityVerdict, b: FeasibilityVerdict): FeasibilityVerdict {
  const severity: Record<FeasibilityVerdict, number> = { realistic: 0, tight: 1, unrealistic: 2 };
  return severity[a] >= severity[b] ? a : b;
}