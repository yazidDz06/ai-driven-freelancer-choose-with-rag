---
id: realtime-complexity
title: "Temps réel / WebSocket — niveaux de complexité"
category: realtime
project_types: [web-app, saas, mobile-app]
tags: [realtime, websocket, chat, collaboration]
hours_min: 12
hours_max: 100
---

Le temps réel recouvre des besoins très différents selon ce qu'on veut synchroniser.

**Mises à jour live simples (12-24h)** : rafraîchir un compteur ou un statut sans recharger la page (ex : "3 nouvelles commandes"). Souvent réalisable par polling léger (requête toutes les 5-10s) sans même avoir besoin de WebSocket.

**Chat / messagerie (30-60h)** : connexions WebSocket persistantes, gestion de la présence (qui est en ligne), historique des messages, reconnexion automatique en cas de coupure réseau. Nécessite une vraie infrastructure WebSocket (Socket.io ou équivalent).

**Édition collaborative (60-100h)** : plusieurs utilisateurs modifient le même contenu en même temps (type Google Docs). Demande une gestion de conflits (CRDT ou OT), bien plus complexe qu'un simple chat, et rarement justifié pour un MVP.

Un projet qui dit juste "notifier l'utilisateur en direct" pointe vers le niveau simple ; un projet avec "messagerie entre utilisateurs" ou "tableau de bord live pour plusieurs personnes" pointe vers le niveau chat au minimum.