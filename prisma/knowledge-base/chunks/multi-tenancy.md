---
id: multi-tenancy-complexity
title: "Multi-tenancy — niveaux de complexité"
category: architecture
project_types: [saas]
tags: [multi-tenancy, saas, isolation, security]
hours_min: 16
hours_max: 90
---

Le multi-tenancy concerne les produits SaaS où plusieurs entreprises/clients partagent la même application, mais doivent voir uniquement leurs propres données.

**Single-tenant (0h de complexité additionnelle)** : chaque client a sa propre instance ou base de données séparée. Simple à raisonner mais coûteux à opérer à grande échelle (pas un problème pour un MVP avec peu de clients).

**Multi-tenant à schéma partagé (16-40h)** : une seule base de données, une colonne `tenant_id` sur toutes les tables concernées, et un filtre systématique par `tenant_id` sur chaque requête. Le risque principal est l'oubli d'un filtre quelque part, qui exposerait les données d'un client à un autre — nécessite une discipline stricte (souvent via un middleware ou une politique Row Level Security Postgres).

**Multi-tenant à schéma isolé par client (50-90h)** : chaque client a son propre schéma Postgres ou sa propre base, avec une couche de routage qui choisit la bonne connexion. Meilleure isolation, mais complexité opérationnelle bien plus élevée (migrations à appliquer sur N bases, etc.).

Pour un MVP ou un portfolio, le schéma partagé avec `tenant_id` est presque toujours le bon choix — l'isolation par schéma ne se justifie qu'à partir d'exigences de sécurité/conformité fortes (santé, finance) ou d'un vrai volume de clients.