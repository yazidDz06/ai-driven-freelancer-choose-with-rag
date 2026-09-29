---
id: admin-dashboard-complexity
title: "Dashboard admin — niveaux de complexité"
category: admin
project_types: [saas, marketplace, e-commerce]
tags: [admin, dashboard, analytics, crud]
hours_min: 16
hours_max: 90
---

**CRUD basique (16-30h)** : lister, créer, modifier, supprimer les entités principales (utilisateurs, produits, commandes) via des tableaux et formulaires simples. Souvent réalisable rapidement avec une librairie de composants UI existante.

**Dashboard avec statistiques (30-55h)** : ajout de graphiques et indicateurs clés (revenus, nombre d'utilisateurs actifs, taux de conversion), généralement calculés via des requêtes d'agrégation sur la base de données, parfois avec mise en cache si les calculs sont lourds.

**Dashboard analytique avancé (60-90h)** : filtres complexes, exports de données, tableaux de bord personnalisables par l'utilisateur admin, comparaisons de périodes. Rarement nécessaire pour un MVP — souvent une fonctionnalité qui vient en V2 une fois que le produit a des utilisateurs réels à analyser.

Presque tout produit avec des comptes utilisateurs a besoin au minimum du niveau CRUD basique pour que l'équipe puisse gérer les données sans passer par la base directement.