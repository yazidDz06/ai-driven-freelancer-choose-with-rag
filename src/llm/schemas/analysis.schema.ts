import { z } from "zod";

// Liste FERMÉE des rôles que l'IA peut proposer (le calcul du budget les
// cherchera ensuite dans la table RateCard : les noms doivent être exacts).
export const DEVELOPER_ROLES = [
  "frontend-developer",
  "backend-developer",
  "fullstack-developer",
  "mobile-developer",
  "ui-ux-designer",
  "devops-engineer",
  "qa-engineer",
  "project-manager",
] as const;

export const COMPLEXITY_TIERS = ["simple", "medium", "complex"] as const;


export const EFFORT_CATALOG = {
  "auth-complexity": "authentication, user accounts, roles and permissions",
  "payments-complexity": "payments, subscriptions, marketplace payouts",
  "realtime-complexity": "live updates, chat, collaboration",
  "file-upload-complexity": "file upload and storage, media handling",
  "notifications-complexity": "email, in-app and push notifications",
  "admin-dashboard-complexity": "admin panel, back-office, analytics dashboard",
  "multi-tenancy-complexity": "multi-tenant SaaS with several client organizations",
  "security-baseline": "baseline security and compliance work",
  "deployment-infra": "deployment and infrastructure setup",
} as const;

export type EffortSourceId = keyof typeof EFFORT_CATALOG;

const EFFORT_SOURCE_IDS = Object.keys(EFFORT_CATALOG) as [
  EffortSourceId,
  ...EffortSourceId[],
];


export const analysisSchema = z.object({
  
  
  outputLanguage: z.string(),
  projectType: z.string(),
  functionalRequirements: z.array(z.string()),
  technicalRequirements: z.array(z.string()),
  recommendedStack: z.object({
    frontend: z.array(z.string()),
    backend: z.array(z.string()),
    infra: z.array(z.string()),
    rationale: z.string(),
  }),
  requiredRoles: z.array(z.enum(DEVELOPER_ROLES)),
  featureEstimates: z.array(
    z.object({
      featureName: z.string(),
      complexityTier: z.enum(COMPLEXITY_TIERS),
      // Une entrée du catalogue, ou null si aucune fiche ne correspond
      
      kbChunkId: z.enum(EFFORT_SOURCE_IDS).nullable(),
    }),
  ),
  risks: z.array(z.string()),
  missingInfo: z.array(z.string()),
});

export type AnalysisResult = z.infer<typeof analysisSchema>;