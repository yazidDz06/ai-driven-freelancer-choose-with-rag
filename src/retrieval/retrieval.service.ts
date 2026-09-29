import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { embedText, toPgVectorLiteral } from "../embeddings/embed-text";

export interface RetrievedChunk {
  id: string;
  title: string;
  category: string;
  content: string;
  hoursMin: number | null;
  hoursMax: number | null;
  similarity: number; // de 0 à 1 : plus c'est haut, plus la fiche est proche du sujet
}

@Injectable()
export class RetrievalService {
  constructor(private readonly prisma: PrismaService) {}

  async findRelevantChunks(query: string, topK = 8): Promise<RetrievedChunk[]> {
    // RETRIEVAL_QUERY : on transforme la description du client en "coordonnées de sens"
    const queryEmbedding = await embedText(query, "RETRIEVAL_QUERY");
    const vectorLiteral = toPgVectorLiteral(queryEmbedding);

    // $queryRaw car Prisma ne connaît pas l'opérateur <=> (mesure de proximité).
    // Les ${...} sont envoyés comme paramètres : pas de risque d'injection SQL.
    return this.prisma.$queryRaw<RetrievedChunk[]>`
      SELECT
        id,
        title,
        category,
        content,
        hours_min AS "hoursMin",
        hours_max AS "hoursMax",
        1 - (embedding <=> ${vectorLiteral}::vector) AS similarity
      FROM knowledge_chunks
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> ${vectorLiteral}::vector
      LIMIT ${topK}
    `;
  }
}