---
id: security-baseline
title: "Sécurité — exigences de base pour tout projet"
category: security
project_types: [web-app, saas, mobile-app, marketplace, e-commerce]
tags: [security, owasp, gdpr, baseline]
hours_min: 8
hours_max: 40
---

Un socle de sécurité minimal s'applique à quasiment tout projet, indépendamment de son type, et doit être budgété même quand le client ne le mentionne pas explicitement.

**Baseline attendue (8-16h)** : hashage des mots de passe (jamais en clair), HTTPS partout, validation des entrées côté serveur (pas seulement côté client), protection contre les injections SQL (assurée nativement par un ORM comme Prisma si utilisé correctement), limitation du taux de requêtes (rate limiting) sur les endpoints sensibles.

**Renforcement pour données sensibles (20-40h)** : chiffrement des données sensibles au repos, journalisation des accès (audit trail), politique de rétention/suppression des données conforme RGPD si des utilisateurs européens sont concernés, gestion des secrets via variables d'environnement (jamais commitées dans le code).

Un projet qui manipule des données de paiement, de santé, ou des données personnelles sensibles doit systématiquement inclure le niveau renforcé, même si le client ne l'a pas demandé explicitement dans sa description — c'est une des choses à signaler comme risque/information manquante si le client n'en parle pas.