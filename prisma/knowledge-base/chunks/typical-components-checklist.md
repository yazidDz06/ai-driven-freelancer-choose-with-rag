---
id: typical-components-checklist
title: "Checklist des composants typiques d'un projet logiciel"
category: planning
project_types: [web-app, saas, mobile-app, marketplace, e-commerce]
tags: [checklist, planning, components]
hours_min: null
hours_max: null
---

La plupart des projets logiciels, quel que soit leur domaine, sont composés d'un sous-ensemble des briques suivantes. Une description de projet client omet souvent certaines de ces briques implicitement nécessaires — les repérer fait partie du travail d'analyse.

- **Authentification** : quasiment toujours présente dès qu'il y a des comptes utilisateurs.
- **Gestion de profil utilisateur** : modification des informations personnelles, préférences.
- **Contenu principal métier** : les entités propres au domaine du client (produits, réservations, projets, articles...).
- **Recherche et filtrage** : dès qu'il y a plus qu'une poignée d'éléments à parcourir.
- **Paiements** : si le produit génère un revenu direct des utilisateurs finaux.
- **Notifications** : pour informer l'utilisateur d'événements pertinents.
- **Dashboard admin** : pour que l'équipe du client puisse gérer les données sans accès direct à la base.
- **Upload de fichiers/médias** : dès que le produit implique des photos, documents, ou pièces jointes.
- **Multi-tenancy** : uniquement pour les produits SaaS B2B avec plusieurs organisations clientes.
- **Temps réel** : uniquement si le produit a une dimension collaborative ou de suivi live.

Une description client qui semble simple ("une app pour gérer des rendez-vous") implique presque toujours plusieurs de ces briques implicitement (authentification, notifications de rappel, dashboard admin pour le professionnel) même si le client ne les mentionne pas explicitement — c'est une source fréquente de sous-estimation du scope réel.