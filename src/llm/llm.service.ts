import { BadGatewayException, Inject, Injectable, Logger } from "@nestjs/common";
import { LLM_PROVIDER } from "./llm-provider.interface";
import type { LlmProvider } from "./llm-provider.interface";
import { AnalysisResult, analysisSchema } from "./schemas/analysis.schema";
import { ProjectInput, buildAnalysisPrompt } from "./prompts/analysis.prompt";
import type { RetrievedChunk } from "../retrieval/retrieval.service";

const MAX_ATTEMPTS = 2;

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  constructor(@Inject(LLM_PROVIDER) private readonly provider: LlmProvider) {}

  async analyzeProject(
    input: ProjectInput,
    chunks: RetrievedChunk[],
  ): Promise<{ analysis: AnalysisResult; rawText: string }> {
    const { system, user } = buildAnalysisPrompt(input, chunks);

    let lastProblem = "";

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      // Au 2e essai, on dit à l'IA ce qui n'allait pas dans sa réponse précédente.
      const prompt =
        attempt === 1
          ? user
          : `${user}\n\nYour previous answer was rejected: ${lastProblem}. Return a corrected JSON object only.`;

      const rawText = await this.provider.generateJson(system, prompt);

      try {
        const result = analysisSchema.safeParse(JSON.parse(rawText));

        // Plus besoin de nettoyer les kbChunkId à la main : le schéma zod
        // n'accepte qu'un id du catalogue (ou null), donc un id inventé
        // provoque un rejet et donc un 2e essai.
        if (result.success) {
          return { analysis: result.data, rawText };
        }

        lastProblem = result.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; ");
      } catch {
        lastProblem = "the answer was not valid JSON";
      }

      this.logger.warn(`Tentative ${attempt}/${MAX_ATTEMPTS} invalide : ${lastProblem}`);
    }

    throw new BadGatewayException(
      "L'IA n'a pas renvoyé une analyse valide. Réessaie dans un instant.",
    );
  }
}