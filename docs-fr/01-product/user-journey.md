# AI Software Architect - User Journey

## Vue d'ensemble du parcours

```
1. Accès & Saisie
   |
   v
2. Analyse & Clarification
   |
   v
3. Génération des artefacts
   |
   v
4. Visualisation & Découverte
   |
   v
5. Feedback & Itération
   |
   v
6. Export & Utilisation
```

---

## Étape 1 : Accès et saisie

**Point d'entrée :** Page d'accueil de la plateforme.

**Actions utilisateur :**
- L'utilisateur arrive sur la page d'accueil.
- Il lit une brève présentation du service.
- Il clique sur "Nouveau projet".
- Il saisit la description de son projet dans un champ textuel (minimum 50 mots, recommandé 200+).
- Il peut éventuellement :
  - Choisir un template (e-commerce, SaaS, marketplace, mobile, migration legacy).
  - Ajouter des contraintes spécifiques (ex: "doit être scalable pour 10 000 utilisateurs", "budget cloud limité à 500 €/mois").
- Il clique sur "Générer mon architecture".

**Vérification :**
- Vérification de la longueur du texte.
- Détection automatique de la langue (si autre que français, proposition de traduire).
- Indication visuelle du temps estimé (< 2 min pour un projet standard, < 5 min pour un projet complexe).

**Feedback utilisateur :** Barre de progression "Analyse de votre projet en cours...".

---

## Étape 2 : Analyse et clarification (interactive)

**Objectif :** L'IA analyse la description et, si nécessaire, pose des questions complémentaires pour affiner le périmètre.

**Scénario A (description complète) :**
- L'IA estime avoir suffisamment d'informations.
- Passe directement à l'étape 3.

**Scénario B (description partielle) :**
- L'IA génère 2 à 4 questions clarifiantes.
- L'utilisateur répond dans un chat contextuel.
- Exemples de questions :
  - "Quel est le nombre d'utilisateurs simultanés attendu ?"
  - "Avez-vous une préférence de langage ou de framework ?"
  - "Souhaitez-vous une base de données relationnelle ou NoSQL ?"
  - "Quel est votre budget mensuel pour l'infrastructure cloud ?"
- L'utilisateur valide ses réponses.
- L'IA poursuit l'analyse avec les nouveaux éléments.

**Feedback utilisateur :** Interface de chat fluide avec affichage en temps réel des réponses. L'utilisateur peut annuler et repartir de zéro.

---

## Étape 3 : Génération des artefacts

**Déroulement :** L'orchestration lance la génération séquentielle des artefacts (un par un). Chaque étape s'affiche au fur et à mesure.

**Visualisation des étapes :**

```
✅ Analyse métier terminée
⏳ Architecture en cours... (45%)
⬜ Schéma de base de données
⬜ Diagrammes Mermaid
⬜ Backlog de développement
```

**Validation automatique :** Chaque artefact passe par une étape de validation de cohérence avant d'être marqué comme terminé (voir `prd.md` — Stratégie de validation).

**Si une étape échoue :** L'utilisateur est informé avec un message explicite. Il peut relancer manuellement l'étape défaillante. Les autres étapes continuent.

**Feedback utilisateur :** Barre de progression globale + détails par étape. Estimation du temps restant.

---

## Étape 4 : Visualisation et découverte

**Arrivée sur la page de résultats (dashboard projet).**

**Interface :** Présentation des artefacts sous forme d'onglets :

| Onglet | Contenu |
|--------|---------|
| **📋 Analyse** | Résumé des besoins, acteurs, fonctionnalités, contraintes. |
| **🏗️ Architecture** | Stack technique, modules, justifications, risques identifiés. |
| **🗄️ Base de données** | Schéma ERD (textuel), liste des tables avec colonnes. |
| **📊 Diagrammes** | Rendu Mermaid (C4, séquence, déploiement). |
| **📝 Backlog** | Liste des user stories, priorité, story points, format PDF/Markdown. |

**Actions possibles :**
- Cliquer sur un onglet pour afficher le contenu.
- Agrandir les diagrammes en plein écran.
- Télécharger chaque artefact individuellement.
- Copier le contenu d'une section.

**Feedback utilisateur :** Affichage immédiat, possibilité de prendre des notes (annotations). Indicateur de qualité (ex: "✓ Cohérence vérifiée" / "⚠️ Point d'attention détecté").

---

## Étape 5 : Feedback et itération

**Objectif :** L'utilisateur peut demander des modifications ou poser des questions sur un artefact.

**Actions possibles :**
- **Modification partielle :** Sur un artefact, cliquer sur "Modifier" → un champ d'édition s'ouvre (textuel) → l'utilisateur écrit le changement souhaité → l'IA régénère uniquement cet artefact en tenant compte du feedback.
- **Question contextuelle :** Chat intégré : "Pourquoi avez-vous choisi PostgreSQL plutôt que MongoDB ?" → L'IA répond avec une justification.
- **Comparaison :** L'utilisateur peut demander une variante (ex: "Et si je passais en microservices ?") → l'IA génère une alternative et les compare.

**Historique des versions :**
- Chaque génération (initiale ou régénération d'un artefact) crée une nouvelle version.
- L'utilisateur peut consulter l'historique et revenir à une version précédente.
- Les versions sont horodatées et associées à l'input qui les a produites.

**Feedback utilisateur :** Retour visuel immédiat (l'artefact se met à jour). Historique des versions visible dans un panneau latéral.

---

## Étape 6 : Export et utilisation

**Fin du parcours :** L'utilisateur est satisfait du résultat.

**Actions d'export :**

| Format | Contenu | Utilisation |
|--------|---------|-------------|
| **Markdown (.md)** | Tous les artefacts (texte, tableaux, code Mermaid) | Documentation technique dans le repo |
| **PDF** | Version imprimable avec mise en page professionnelle | Présentation aux parties prenantes |
| **JSON** | Données structurées des artefacts | Réutilisation dans d'autres outils (ex: import dans Jira) |

**Options supplémentaires :**
- Partager le projet (lien public ou privé) avec un collègue.
- Ajouter le projet à une collection (ex: "Projets 2025").
- Générer un rapport d'architecture pour les investisseurs.

**Feedback utilisateur :** Confirmation de téléchargement. Proposition de noter l'expérience (1 à 5 étoiles) et de laisser un commentaire.

---

## Persistance des sessions et gestion des projets

La persistance est une décision produit structurante. Voici le comportement défini pour le MVP :

### Sauvegarde automatique

- Chaque projet est sauvegardé automatiquement en base dès la fin de la génération initiale.
- L'utilisateur n'a pas besoin d'une action explicite pour sauvegarder.
- La session peut être fermée à tout moment sans perte de données.

### Accès aux projets existants

- L'utilisateur retrouve tous ses projets dans un **tableau de bord personnel** accessible depuis la navigation principale.
- Chaque projet affiche : nom (déduit de la description), date de création, date de dernière modification, statut (complet / en erreur partielle).

### Reprise d'un projet

Depuis le tableau de bord, l'utilisateur peut :
- **Consulter** les artefacts générés sans relancer une génération.
- **Itérer** sur un artefact spécifique (modifier l'input → régénérer uniquement cet artefact).
- **Relancer une génération complète** si le besoin a évolué — crée une nouvelle version du projet.
- **Archiver** le projet (masqué du tableau de bord principal, conservé en base).
- **Supprimer** le projet (suppression définitive avec confirmation).

### Historique des versions par projet

- Chaque régénération complète ou partielle crée une entrée dans l'historique.
- L'utilisateur peut comparer deux versions d'un même artefact.
- Retour à une version antérieure possible en un clic.

### Limite MVP

- Rétention des projets : 90 jours pour les comptes gratuits, illimitée pour les comptes payants.
- Nombre de projets simultanés : 10 maximum pour les comptes gratuits.

---

## Parcours de retour (itératif)

L'utilisateur peut revenir à tout moment sur un projet existant depuis son tableau de bord. Il peut :
- Consulter les artefacts.
- Lancer une nouvelle génération (si le besoin a évolué).
- Mettre à jour un artefact existant.
- Archiver le projet.

**Boucle de feedback continue :** L'IA s'améliore des modifications apportées par l'utilisateur (via un système de feedback implicite) pour améliorer les futures générations.
