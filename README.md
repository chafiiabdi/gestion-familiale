# Gestion Familiale — V1

Application web gratuite de suivi familial, en français et en francs djiboutiens (**DJF**).

## Fonctionnalités

- **Bus bleu et bus jaune** : chauffeur, rang saisi manuellement, état, remarques et dates d'expiration de l'assurance, de la vignette et de la patente.
- **Débriefing** : enregistrer les contrôles à raison de deux fois par mois.
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
