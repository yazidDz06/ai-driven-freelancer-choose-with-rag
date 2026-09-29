// C'est le SEUL endroit du projet qui parle à l'API d'embedding de Gemini.
import { GoogleGenAI } from "@google/genai";

// Le client est créé au PREMIER appel, pas au chargement du fichier. Dans
// NestJS, ConfigModule charge le .env après l'évaluation des imports : si on
// lisait process.env.GEMINI_API_KEY ici, la clé serait encore undefined.
let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}


export const EMBEDDING_DIMENSIONS = 768;

export type EmbeddingTaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

/**
 * Transforme un texte en vecteur d'embedding via Gemini.
 *
 * @param text - le texte à embedder (un chunk de connaissance, ou la
 *   description d'un projet client)
 * @param taskType - RETRIEVAL_DOCUMENT quand on indexe un chunk de la base
    de connaissances (utilisé par le script de seed), RETRIEVAL_QUERY quand
    on embed la description d'un client pour chercher des chunks pertinents
   (utilisé plus tard par RetrievalService). Le modèle optimise le vecteur
   différemment selon ce paramètre — ne pas les inverser.
 */
export async function embedText(
  text: string,
  taskType: EmbeddingTaskType,
): Promise<number[]> {
  const response = await getClient().models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
    config: {
      taskType,
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  });

  // embedContent() retourne TOUJOURS un tableau `embeddings` (pensé pour
  // pouvoir embedder plusieurs textes en un seul appel), même quand on ne
  // lui envoie qu'un seul texte comme ici — d'où le [0] pour prendre le
  // premier (et unique) résultat.
  const values = response.embeddings?.[0]?.values;

  if (!values) {
    throw new Error("Gemini n'a renvoyé aucun vecteur d'embedding pour ce texte.");
  }

  return values;
}

/**
 * pgvector attend un littéral texte du type "[0.123,-0.456,...]" pour pouvoir
  le caster en `::vector` dans une requête SQL brute. Prisma ne sait pas
  faire cette conversion tout seul (colonne Unsupported), donc on la fait
  nous-mêmes avant chaque requête $executeRaw / $queryRaw qui touche la
  colonne `embedding`.
 */
export function toPgVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}