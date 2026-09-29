import type { RetrievedChunk } from "../../retrieval/retrieval.service";
import {
  COMPLEXITY_TIERS,
  DEVELOPER_ROLES,
  EFFORT_CATALOG,
} from "../schemas/analysis.schema";

// Ce que le client a saisi dans le formulaire.
export interface ProjectInput {
  description: string;
  deadline: string; // ex: "2026-12-31"
  budget: number;
  priority: string; // ex: "BALANCED"
}

const SYSTEM_PROMPT = `You are a senior software project analyst. You analyze a client's project description and produce a structured technical analysis.

STRICT RULES:
- Base your analysis on the provided KNOWLEDGE SECTIONS. Do not contradict them.
- NEVER output hour estimates, prices, budgets or deadlines. Those are computed by another system. You only classify complexity.
- LANGUAGE: first detect the language of the PROJECT DESCRIPTION and write it in "outputLanguage" (e.g. "English"). Then write EVERY text value of the answer in that language. The knowledge sections may be written in another language: never let them change your output language.
- List in featureEstimates EVERY feature that requires development work (authentication, payments, chat, notifications, file upload, admin, search, reviews...), including implicit ones. Every requirement listed in functionalRequirements or technicalRequirements must have a matching entry.
- For each feature, set kbChunkId to the id of the EFFORT CATALOG entry that covers that feature, even if its full section is not shown in the KNOWLEDGE SECTIONS. Use null only if no catalog entry fits (for example search, reviews, booking flow).
- Choose complexityTier by matching the project to the levels described in the knowledge sections. When you hesitate between two tiers, choose the higher one: underestimating a project is worse than overestimating it.
- Requirements hidden behind a simple description count: list what the project implicitly needs, and put unclear points in missingInfo.
- Answer with a single JSON object and nothing else (no markdown, no comments).`;

export function buildAnalysisPrompt(
  input: ProjectInput,
  chunks: RetrievedChunk[],
): { system: string; user: string } {
  const knowledge = chunks
    .map((c) => `[id: ${c.id}] ${c.title}\n${c.content}`)
    .join("\n\n---\n\n");

  const catalog = Object.entries(EFFORT_CATALOG)
    .map(([id, covers]) => `- ${id}: ${covers}`)
    .join("\n");

  const user = `PROJECT DESCRIPTION:
${input.description}

CLIENT CONSTRAINTS (for context only, do not compute anything with them):
- Deadline: ${input.deadline}
- Budget: ${input.budget}
- Priority: ${input.priority}

EFFORT CATALOG (valid values for kbChunkId):
${catalog}

KNOWLEDGE SECTIONS:
${knowledge}

Return a JSON object with exactly this shape (write outputLanguage first):
{
  "outputLanguage": string,
  "projectType": string,
  "functionalRequirements": string[],
  "technicalRequirements": string[],
  "recommendedStack": { "frontend": string[], "backend": string[], "infra": string[], "rationale": string },
  "requiredRoles": array of values among: ${DEVELOPER_ROLES.join(", ")},
  "featureEstimates": [ { "featureName": string, "complexityTier": one of ${COMPLEXITY_TIERS.join(" | ")}, "kbChunkId": an id from the EFFORT CATALOG, or null } ],
  "risks": string[],
  "missingInfo": string[]
}

Reminder: write all text values in the language of the PROJECT DESCRIPTION above.`;

  return { system: SYSTEM_PROMPT, user };
}