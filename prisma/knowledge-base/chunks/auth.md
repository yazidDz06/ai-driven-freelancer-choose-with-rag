---
id: auth-complexity
title: "Authentification — niveaux de complexité"
category: authentication
project_types: [web-app, saas, mobile-app, marketplace]
tags: [auth, oauth, rbac, sso, security]
hours_min: 16
hours_max: 120
---

L'authentification se décline en plusieurs niveaux de complexité, chacun avec un coût de développement très différent.

**Niveau simple (16-24h)** : inscription/connexion par email + mot de passe, hashage bcrypt, réinitialisation de mot de passe par email. Suffisant pour un MVP ou un outil interne à faible enjeu de sécurité.

**Niveau OAuth (24-40h)** : ajout de la connexion via Google/GitHub/etc. Demande la gestion de plusieurs fournisseurs d'identité, la fusion de comptes si un email existe déjà, et le stockage sécurisé des tokens d'accès.

**Niveau OAuth + RBAC (40-80h)** : en plus de l'OAuth, mise en place d'un système de rôles et permissions (admin, éditeur, lecteur...), avec vérification des droits sur chaque route de l'API. Nécessaire dès qu'un produit a plusieurs types d'utilisateurs avec des accès différents.

**Niveau SSO/entreprise (80-120h)** : SAML ou OpenID Connect pour s'intégrer aux annuaires d'entreprise (Okta, Azure AD), gestion fine des sessions, audit trail des connexions. Rarement nécessaire pour un MVP, presque toujours pour un produit B2B vendu à de grandes organisations.

Le choix du niveau dépend directement du type d'utilisateurs du produit : un outil grand public commence presque toujours au niveau simple ou OAuth ; un produit B2B avec plusieurs rôles internes nécessite au minimum RBAC.