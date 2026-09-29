---
id: deployment-infra
title: "Déploiement et infrastructure — options selon l'échelle"
category: deployment
project_types: [web-app, saas, mobile-app, marketplace]
tags: [deployment, docker, infra, scaling]
hours_min: 4
hours_max: 50
---

Le choix d'infrastructure dépend presque entièrement de l'échelle attendue, pas de la complexité fonctionnelle du produit.

**PaaS managé (4-12h)** : Vercel pour le frontend, Render/Railway pour le backend, une base managée (Supabase/Neon). Aucune gestion de serveur, déploiement automatique à chaque push. Le bon choix pour un MVP, un portfolio, ou une startup qui valide son marché.

**VM/Docker auto-géré (15-30h)** : un ou plusieurs serveurs (VPS) avec Docker Compose, reverse proxy (Nginx/Caddy), certificats SSL, sauvegardes manuelles configurées. Donne plus de contrôle et coûte souvent moins cher à volume moyen, mais demande des compétences DevOps et une astreinte pour les incidents.

**Infrastructure multi-région / haute disponibilité (35-50h+)** : plusieurs régions géographiques, bascule automatique en cas de panne, CDN pour les assets statiques. Seulement pertinent à partir d'un volume d'utilisateurs conséquent ou d'exigences contractuelles de disponibilité (SLA).

Pour un MVP ou un portfolio, le PaaS managé est presque toujours le bon choix : la complexité de gestion d'infrastructure n'apporte aucune valeur tant que le produit n'a pas d'utilisateurs réels à grande échelle.