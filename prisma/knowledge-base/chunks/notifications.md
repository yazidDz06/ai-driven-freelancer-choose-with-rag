---
id: notifications-complexity
title: "Systèmes de notification — niveaux de complexité"
category: notifications
project_types: [web-app, saas, mobile-app]
tags: [notifications, email, push, realtime]
hours_min: 8
hours_max: 60
---

Les notifications sont souvent sous-estimées dans les devis initiaux car elles touchent plusieurs canaux différents.

**Email uniquement (8-16h)** : envoi d'emails transactionnels via un service comme Resend ou SendGrid — confirmation d'inscription, réinitialisation de mot de passe, notifications d'activité. Le plus simple à mettre en place.

**Email + notifications in-app (20-35h)** : ajout d'un centre de notifications dans l'interface (liste des événements récents, marquage lu/non lu), généralement stocké en base et affiché via polling ou WebSocket léger.

**Email + push + in-app avec préférences (40-60h)** : ajout des notifications push mobile/navigateur, plus un système de préférences permettant à l'utilisateur de choisir quels événements déclenchent quel canal. Demande une architecture de type "événement → règles de préférence → dispatch multi-canal" plus robuste.

Un projet avec du temps réel (chat, tableau de bord live) a presque toujours besoin d'au minimum le niveau intermédiaire, car les utilisateurs s'attendent à voir les nouveautés sans recharger la page.