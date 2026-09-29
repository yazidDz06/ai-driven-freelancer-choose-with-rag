import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";
import { LlmProvider } from "../llm-provider.interface";

@Injectable()
export class GeminiProvider implements LlmProvider {
  private readonly ai: GoogleGenAI;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    // Ici on est dans un service NestJS : ConfigService est prêt, on lit donc
    // la clé proprement (contrairement à embed-text.ts, hors de Nest).
    this.ai = new GoogleGenAI({ apiKey: this.config.get<string>("GEMINI_API_KEY") });
    
    this.model = this.config.get<string>("GEMINI_GENERATION_MODEL") ?? "gemini-3.1-flash-lite";
  }

  async generateJson(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        // Demande à Gemini de répondre en JSON (réduit les réponses avec du
        // texte autour). Ça ne remplace PAS la validation zod : on ne fait
        // jamais confiance aveuglément à une IA.
        responseMimeType: "application/json",
        // Basse température = réponses plus stables d'un appel à l'autre,
        // ce qu'on veut pour une estimation.
        temperature: 0.2,
      },
    });

    return response.text ?? "";
  }
}