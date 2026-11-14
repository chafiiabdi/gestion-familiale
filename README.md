# Gestion Familiale — V1

Application web gratuite de suivi familial, en français et en francs djiboutiens (**DJF**).

## Fonctionnalités

- **Bus bleu et bus jaune** : chauffeur, rang saisi manuellement, état, remarques et dates d'expiration de l'assurance, de la vignette et de la patente.
- **Débriefing** : enregistrer les contrôles à raison de deux fois par mois. Pour chaque bus, ajouter plusieurs points (panne ou réparation, points à régler, bonnes nouvelles, livraison de gasoil), avec description, date prévue et statut modifiable (à régler, en cours, réglé, information). Les anciens comptes rendus restent visibles.
- **Finances des bus** : recettes, dépenses et bilans par mois, semestre et année. Les dépenses peuvent être saisies ligne par ligne (raison + montant DJF), avec total automatique et détail dans l'historique.
- **Dettes** : montant initial, remboursements depuis un bus, solde restant et déduction des remboursements du résultat net du bus (recettes brutes inchangées).
- **Maisons** : budget de maman à 45 000 DJF (30 000 + 15 000) et budget de Salma à vérifier.
- **Planning de Robleh** : jours de travail et nuits de garde.
- **Khuruj de Boukari** : budget, vêtements, sac et tâches supplémentaires.
- **Sauvegarde** : export et restauration d'un fichier JSON.

## Utilisation

L'application est contenue dans le fichier `index.html`. Pour la tester sur ton ordinateur, télécharge ce fichier et ouvre-le avec ton navigateur.

### Publication sur GitHub Pages

Sur GitHub, ouvre **Settings → Pages**, puis choisis **Deploy from a branch**, branche **main**, dossier **/(root)** et clique sur **Save**. L'adresse prévue est :

https://chafiiabdi.github.io/gestion-familiale/

Cette adresse ne sera accessible qu'après activation et déploiement effectif de GitHub Pages. GitHub Pages sur un dépôt public rend l'interface publique.

## Confidentialité et limites

**Version monoposte** : les informations enregistrées utilisent `localStorage` dans le navigateur. Elles ne sont pas transmises à GitHub et ne sont pas synchronisées entre appareils. Effacer les données du site peut les faire disparaître : il est nécessaire d'exporter des sauvegardes.

Ne pas enregistrer de mots de passe, numéros de comptes, données bancaires, documents confidentiels ou informations familiales sensibles. Ne jamais publier les exports JSON dans le dépôt.

Le rang du bus n'est **pas suivi par GPS en temps réel**. WhatsApp et la banque ne sont pas connectés automatiquement. Pour un partage entre téléphones, il faut ajouter une authentification et une base sécurisée, comme Supabase avec politiques d'accès appropriées.

Le dépôt est séparé des projets SIG et ne modifie aucun de leurs fichiers.

## Synchronisation entre téléphones (préparation)

La rubrique **Synchronisation** conserve les données localement sur chaque appareil et propose une copie cloud Supabase accessible après identification. Le dépôt GitHub reste public, mais les données cloud doivent rester privées et protégées par les règles RLS du fichier `supabase/schema.sql`.

**Important :** la synchronisation n'est pas active tant qu'un **nouveau projet Supabase dédié** n'est pas créé et configuré. Ne pas utiliser le projet Supabase `pmr` : les informations familiales doivent être séparées des données SIG.

1. Créer un projet Supabase indépendant « gestion-familiale ».
2. Exécuter `supabase/schema.sql` dans l'éditeur SQL de ce nouveau projet (uniquement).
3. Dans l'application, ouvrir **Synchronisation** et saisir l'URL du nouveau projet et sa clé **publishable** (jamais `service_role`).
4. Créer un compte et se connecter. Exporter d'abord une sauvegarde JSON des données locales.
5. Sur le premier téléphone, choisir **Envoyer les données de cet appareil**. Sur le second téléphone, ouvrir le même lien GitHub Pages, se connecter avec le même compte et choisir **Récupérer les données du cloud**.
6. Les modifications sont envoyées et vérifiées périodiquement lorsque la connexion Internet est disponible.

**Limite V1 :** si les deux appareils modifient des données simultanément, la dernière sauvegarde complète écrite sur le cloud peut écraser une modification concurrente. Il n'y a pas encore de fusion automatique des données. Il est préférable d'éditer à tour de rôle et de faire des exports JSON réguliers. À terme, créer deux comptes personnels rattachés à un même groupe familial serait plus sûr que de partager un mot de passe.

### Activation guidée dans l'application

Le menu **Synchronisation** contient maintenant un bouton **Copier le SQL de configuration** et un lien direct vers [l'éditeur SQL du projet familial](https://supabase.com/dashboard/project/nvctiwhfydidlfjumfgd/sql/new). Le SQL doit être exécuté **dans le projet familial**, et non dans PMR. Cela crée `family_snapshots`, la table utilisée par `sync.js` ; la table existante `gestion_famille` n'est pas modifiée.

La publication sur GitHub ne remplace pas l'exécution du SQL dans Supabase. Une clé publique ne permet pas d'administrer la base. Après exécution du SQL, utiliser le même compte de connexion Supabase sur les deux appareils ; les modifications sont synchronisées périodiquement. Ne jamais publier les sauvegardes privées.
