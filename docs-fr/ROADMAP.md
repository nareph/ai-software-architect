# Feuille de route

## Vision

AI Software Architect est une plateforme d'ingénierie propulsée par l'IA capable de transformer des exigences métier en artefacts techniques actionnables :

* Analyse métier
* User Stories
* Architecture logicielle
* Diagrammes Mermaid
* Schéma de base de données
* Architecture cloud
* Backlog de développement
* Plan DevOps
* Estimation des coûts

L'objectif n'est pas de générer du code. L'objectif est de générer les **décisions d'architecture** nécessaires avant le développement.

---

## Phase 0 — Recherche & Définition produit ✅

* Vision du projet
* Analyse de marché
* Personas
* Énoncé du problème

---

## Phase 1 — Exigences produit ✅

* Document d'exigences produit (PRD)
* Cas d'usage
* Parcours utilisateur

---

## Phase 2 — Conception système ✅

* Architecture système
* Modèle de domaine
* Conception de base de données
* Spécification API
* Sécurité

---

## Phase 3 — Architecture IA ✅

* Vue d'ensemble de l'architecture IA
* Système d'agents
* Stratégie de prompts
* Sélection des modèles
* Framework d'évaluation

---

## Phase 4 — MVP ✅

### Fonctionnalités réalisées

**Auth & Utilisateurs**
* Inscription et connexion email/mot de passe
* Sessions JWT via NextAuth.js v5
* Hashage sécurisé des mots de passe (bcrypt coût 12)

**Gestion des projets**
* Formulaire de création de projet (nom, description, sélecteur de langue, template, contraintes)
* Langue au niveau du projet (FR/EN, dissociée de la locale UI)
* Suppression douce (archive) + suppression définitive via SQL
* Dashboard avec vue grille/liste

**Pipeline de génération**
* 5 agents IA séquentiels (Analyste métier, Architecte solution, Architecte DB, Générateur de diagrammes, Chef de projet)
* Intégration LLM réelle : Gemini 3.5 Flash (primaire) + DeepSeek V4 Flash (fallback)
* Retry automatique (max 2 tentatives par étape)
* Streaming SSE de progression en temps réel
* Pipeline mock pour le développement (USE_MOCK_GENERATION=true)
* Retry d'artefact individuel en cas d'échec (bouton UI)
* Réparation JSON pour les réponses LLM tronquées

**Validation de cohérence**
* 5 règles pondérées : entities_db_coverage, features_stories_coverage, actors_backlog_coverage, modules_diagram_sync, db_stories_consistency
* Score réel (0-1) remplaçant le placeholder aléatoire
* Liste d'issues avec niveaux de sévérité (error, warning, info)

**Visualisation des artefacts**
* 5 vues typées : BusinessAnalysis, Architecture, DatabaseSchema, Diagrams, Backlog
* Rendu Mermaid (thème adaptatif, clair/sombre)
* User stories repliables dans la vue Backlog

**Export**
* Markdown (.md) — sortie structurée complète
* JSON (.json) — structuré avec métadonnées
* PDF (.pdf) — page de couverture + 5 pages d'artefacts (@react-pdf/renderer)

**Feedback / Chat**
* Panel slide-in (style Notion AI)
* Mode modifier : met à jour l'artefact + crée une nouvelle version en DB
* Mode expliquer : répond aux questions sans modifier l'artefact
* UI du panel dans la langue du projet (FR/EN), pas la langue de l'UI
* Messages d'erreur LLM localisés

**i18n**
* Routage par URL (/fr/*, /en/*)
* Sélecteur de langue dans la sidebar et la nav auth
* Toutes les chaînes UI dans messages/fr.json et messages/en.json
* Artefacts générés dans la langue du projet (indépendant de la locale UI)

**Sécurité**
* Rate limiting : 20 générations/heure, 30 exports/heure (Upstash Redis)
* Sanitisation XSS sur la sortie LLM (rehype-sanitize)
* RBAC : vérification de propriété des ressources sur toutes les routes API

**Documentation**
* GitBook EN (primaire) : docs/
* GitBook FR (variante) : docs_fr/
* README.md (EN) à la racine du projet

---

## Phase 5 — Fonctionnalités IA avancées ⬜

### Workflow multi-agents

```
Analyste métier
      ↓
  Architecte
      ↓
Expert base de données
      ↓
  Expert DevOps
      ↓
  Réviseur (Agent de revue d'architecture)
```

### Fonctionnalités prévues
* Agent de revue d'architecture (détection d'anti-patterns)
* Estimation des coûts (AWS, Azure, GCP)
* Recommandations technologiques basées sur le contexte
* UI d'historique des versions (navigable)
* Sous-agents parallèles pour les projets complexes

---

## Phase 6 — Excellence technique ⬜

### Tests
* Unitaires
* Intégration
* E2E
* Tests d'évaluation IA

### Observabilité
* OpenTelemetry
* Logs, Métriques, Tracing

### CI/CD
* GitHub Actions
* Docker
* Terraform

---

## Phase 7 — Assets portfolio ⬜

* Vidéo de démonstration (10-15 min)
* Articles de blog
* Études de cas

---

## Phase 8 — V2 ⬜

* Modèle C4, UML, Diagrammes de séquence, Diagrammes d'infrastructure
* Graphe de connaissances architecturales
* RAG (documentation technique, RFCs, bonnes pratiques)
* Intégration IDE (VS Code, Cursor, Claude Code)
* Claude Sonnet 4.6 comme LLM primaire

---

## Critères de succès

Le projet est réussi quand :

* Une idée produit peut être transformée en architecture complète en moins de 5 minutes
* Les diagrammes sont directement utilisables
* Le backlog est cohérent
* Les recommandations techniques sont justifiées
* La documentation est produite automatiquement
* Un recruteur senior comprend immédiatement la valeur du projet après une démo de 3 minutes
