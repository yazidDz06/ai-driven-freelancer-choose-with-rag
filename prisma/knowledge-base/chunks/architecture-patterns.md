---
id: architecture-patterns
title: "Patterns d'architecture — quand utiliser quoi"
category: architecture
project_types: [web-app, saas, mobile-app, marketplace, api-only]
tags: [architecture, monolith, microservices, modular]
hours_min: null
hours_max: null
---

**Monolithe simple** : toute l'application dans un seul processus/déploiement, une seule base de données. Adapté à un MVP, un portfolio, ou toute équipe de moins de 5 développeurs. Le temps de développement le plus court, le plus facile à raisonner et à déboguer.

**Monolithe modulaire** : toujours un seul déploiement, mais le code est organisé en modules aux frontières claires (comme les modules NestJS), chacun avec sa propre responsabilité. Permet de garder la simplicité opérationnelle d'un monolithe tout en préparant une éventuelle extraction future en services séparés, sans payer le coût de complexité des microservices dès maintenant.

**Microservices** : plusieurs services déployés indépendamment, communiquant par réseau (HTTP, message queue). Se justifie seulement quand différentes parties du système ont des besoins de scalabilité ou de cycle de déploiement radicalement différents, et généralement seulement à partir d'équipes de plusieurs dizaines de développeurs. Introduit une complexité opérationnelle importante (observabilité distribuée, gestion des pannes réseau, cohérence des données entre services) qui n'apporte aucune valeur pour un MVP ou un portfolio.

La règle générale : commencer par un monolithe modulaire est presque toujours le bon choix par défaut, y compris pour des projets qui grandiront potentiellement beaucoup — l'extraction en services séparés reste possible plus tard si un besoin réel émerge, alors que l'inverse (fusionner des microservices mal découpés) est beaucoup plus coûteux.