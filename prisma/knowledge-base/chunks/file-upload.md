---
id: file-upload-complexity
title: "Upload et stockage de fichiers — niveaux de complexité"
category: storage
project_types: [web-app, saas, mobile-app, marketplace]
tags: [upload, storage, s3, media, video]
hours_min: 8
hours_max: 70
---

**Upload simple (8-16h)** : un utilisateur envoie une image ou un document, stocké sur un service comme S3/Cloudinary/Supabase Storage, avec validation de taille et de type de fichier. Le cas le plus courant (photo de profil, pièce jointe).

**Fichiers volumineux / multiples (20-35h)** : upload de plusieurs fichiers à la fois, barre de progression, reprise après coupure, génération de miniatures pour les images. Nécessaire dès qu'on parle de galeries ou de documents multiples par entité.

**Traitement média avancé (40-70h)** : transcodage vidéo, compression automatique, génération de plusieurs formats/résolutions, traitement asynchrone en arrière-plan (queue de jobs). Concerne surtout les plateformes avec beaucoup de contenu vidéo ou audio.

Le stockage lui-même (S3, Cloudinary) coûte peu à intégrer ; c'est la gestion des cas limites (gros fichiers, formats multiples, traitement asynchrone) qui fait varier l'estimation.