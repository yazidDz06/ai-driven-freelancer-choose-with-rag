---
id: tech-stack-guidelines
title: "Guidelines de choix de stack technique par type de projet"
category: tech-selection
project_types: [web-app, saas, mobile-app, marketplace, e-commerce, api-only]
tags: [stack, frontend, backend, guidelines]
hours_min: null
hours_max: null
---

Le choix de stack doit avant tout suivre le type de projet, pas les préférences technologiques du moment.

**Site vitrine / contenu** : générateur de site statique ou Next.js en mode statique, pas besoin de backend dédié dans la majorité des cas. Priorité à la simplicité et au temps de chargement.

**Application web / SaaS classique** : frontend React ou Next.js, backend Node.js (NestJS/Express) ou équivalent dans un autre langage selon l'équipe, base de données relationnelle (PostgreSQL) sauf besoin spécifique de flexibilité de schéma. C'est le cas le plus courant, où un stack "ennuyeux mais éprouvé" est presque toujours préférable à une stack expérimentale.

**Application mobile** : React Native ou Flutter si un seul code partagé iOS/Android est souhaité (cas le plus fréquent pour un MVP) ; natif (Swift/Kotlin) seulement si des performances ou fonctionnalités spécifiques à la plateforme sont critiques.

**API-only / backend pour intégrations tierces** : un framework backend classique exposant une API REST ou GraphQL, sans frontend dédié. Priorité à la documentation de l'API (OpenAPI/Swagger) et à la stabilité des contrats d'interface.

**Marketplace / e-commerce** : les mêmes bases qu'une SaaS classique, avec une attention particulière portée aux intégrations de paiement (voir le chunk paiements) et à la recherche/filtrage de catalogue, qui bénéficie souvent d'un moteur de recherche dédié (Algolia, Meilisearch) au-delà d'un certain volume de produits.

Le critère décisif n'est presque jamais "quelle technologie est la plus moderne", mais "quelle technologie l'équipe/le développeur maîtrise déjà" — un stack familier livré à temps vaut mieux qu'un stack idéal mal maîtrisé et livré en retard.