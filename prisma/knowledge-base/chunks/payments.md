---
id: payments-complexity
title: "Intégration de paiements — niveaux de complexité"
category: payments
project_types: [saas, marketplace, e-commerce]
tags: [payments, stripe, subscriptions, marketplace]
hours_min: 12
hours_max: 100
---

L'intégration de paiements varie énormément selon qu'il s'agit d'un paiement unique ou d'un modèle plus complexe.

**Paiement ponctuel simple (12-20h)** : intégration Stripe Checkout pour un achat unique, webhook de confirmation, page de succès/échec. Le cas le plus simple, adapté à la vente d'un produit ou service unique.

**Abonnements/subscriptions (30-50h)** : gestion de plans tarifaires récurrents, upgrade/downgrade de plan, gestion des échecs de paiement récurrents, portail client Stripe pour la gestion de facturation en self-service.

**Marketplace avec répartition des paiements (60-100h)** : paiements entrants des acheteurs puis reversement (payout) à plusieurs vendeurs, gestion des commissions, conformité réglementaire (KYC des vendeurs), délais de rétention des fonds. Nécessite généralement Stripe Connect ou équivalent, et une logique métier bien plus lourde côté backend.

Un projet qui mentionne "les utilisateurs peuvent vendre leurs propres produits/services sur la plateforme" pointe presque toujours vers le niveau marketplace, même si la description initiale du client ne semble pas complexe à première vue.