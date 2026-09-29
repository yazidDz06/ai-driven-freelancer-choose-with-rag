import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { embedText, toPgVectorLiteral } from "../../src/embeddings/embed-text";

const prisma = new PrismaClient();
const CHUNKS_DIR = path.join(__dirname, "chunks");

async function main() {
  const files = fs.readdirSync(CHUNKS_DIR).filter((f) => f.endsWith(".md"));
  console.log(`${files.length} fichier(s) de chunk trouvé(s) dans ${CHUNKS_DIR}`);

  for (const file of files) {
    const raw = fs.readFileSync(path.join(CHUNKS_DIR, file), "utf-8");

    // gray-matter sépare le frontmatter YAML (data) du texte qui suit (content).
    const { data, content } = matter(raw);
    const chunkText = content.trim();

    console.log(`→ Embedding: ${data.title}`);

    // RETRIEVAL_DOCUMENT car on indexe un chunk de la base de connaissances
    // (à ne pas confondre avec RETRIEVAL_QUERY, utilisé côté RetrievalService
    // pour embedder la description du client au moment de la recherche).
    const embedding = await embedText(chunkText, "RETRIEVAL_DOCUMENT");

    // Étape 1 : toutes les colonnes "normales" via l'API Prisma classique.
    
    const chunk = await prisma.knowledgeChunk.upsert({
      where: { id: data.id },
      create: {
        id: data.id,
        title: data.title,
        category: data.category,
        projectTypes: data.project_types ?? [],
        tags: data.tags ?? [],
        content: chunkText,
        hoursMin: data.hours_min ?? null,
        hoursMax: data.hours_max ?? null,
      },
      update: {
        title: data.title,
        category: data.category,
        projectTypes: data.project_types ?? [],
        tags: data.tags ?? [],
        content: chunkText,
        hoursMin: data.hours_min ?? null,
        hoursMax: data.hours_max ?? null,
      },
    });

    // Étape 2 : la SEULE colonne que Prisma ne sait pas écrire nativement
    // (type Unsupported("vector(768)")) — une requête brute, isolée à cette
   
    const vectorLiteral = toPgVectorLiteral(embedding);
    await prisma.$executeRaw`
      UPDATE knowledge_chunks
      SET embedding = ${vectorLiteral}::vector
      WHERE id = ${chunk.id}
    `;
  }

  console.log("Seed terminé — base de connaissances indexée.");
}

main()
  .catch((error) => {
    console.error("Erreur pendant le seed :", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });