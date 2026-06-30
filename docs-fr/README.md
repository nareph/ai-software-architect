# AI Software Architect

> Transformez une description métier en une architecture logicielle complète en moins de 5 minutes.

## C'est quoi ?

AI Software Architect est une plateforme propulsée par l'IA qui génère des artefacts d'architecture technique structurés à partir d'une description textuelle libre — **avant qu'une seule ligne de code ne soit écrite**.

Ce n'est pas un générateur de code. Il génère les **décisions** qui guideront le code.

## Le problème résolu

Tous les outils de génération de code (v0, Bolt, Lovable, Devin) sautent la phase la plus critique du développement logiciel : **l'architecture**. Ils passent directement à l'implémentation, prenant des décisions implicites sans visibilité ni contrôle.

AI Software Architect comble ce vide. Il se positionne **en amont** de tous les outils de génération de code et produit les artefacts dont les équipes ont besoin avant de démarrer le développement.

## Ce qui est généré

À partir d'une seule description métier, la plateforme produit cinq artefacts interconnectés :

| Artefact | Description |
|---|---|
| **Analyse métier** | Acteurs, fonctionnalités, règles métier, contraintes, hypothèses |
| **Architecture** | Stack, modules, patterns, justifications, risques |
| **Schéma de base de données** | Tables, colonnes, relations, index |
| **Diagrammes Mermaid** | C4 container, diagramme de séquence, ERD |
| **Backlog de développement** | Épics, user stories, story points, critères d'acceptance |

Tous les artefacts sont **validés en cohérence** entre eux avant livraison.

## Pour qui ?

| Persona | Besoin principal |
|---|---|
| **Startup Founder** | Transformer une idée en architecture crédible pour lever des fonds |
| **Freelance Developer** | Accélérer les phases d'analyse pour facturer plus de développement |
| **Solution Architect** | Automatiser la documentation pour se concentrer sur les décisions critiques |
| **CTO** | Standardiser les décisions techniques et éviter les erreurs récurrentes |

## Pourquoi maintenant ?

Trois conditions se sont réunies en 2024-2025 pour rendre ce projet à la fois possible et pertinent :

1. **La maturité du raisonnement des LLMs** — Des modèles comme Claude 3.5/3.7 et GPT-4o peuvent produire un raisonnement architectural cohérent, justifier des choix techniques, et maintenir la cohérence entre plusieurs artefacts interdépendants.
2. **L'explosion du vibe coding** — v0, Bolt, Lovable et Devin ont créé un marché de masse pour l'IA dans le développement — et ont tous ignoré la phase d'architecture. Le vide est visible et aucun acteur ne l'adresse directement.
3. **La standardisation des formats d'artefacts** — Mermaid est devenu le standard de facto pour les diagrammes dans les repos Git. Markdown, JSON et OpenAPI sont universellement acceptés. Il est désormais possible de produire des artefacts directement exploitables sans friction d'intégration.

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 16.2.9 (App Router, Turbopack) |
| Langage | TypeScript 5.x |
| UI | React 19 + Tailwind CSS 4 + shadcn/ui |
| Base de données | Neon PostgreSQL (serverless) |
| ORM | Drizzle ORM |
| Auth | NextAuth.js v5 |
| Cache / Rate limiting | Upstash Redis |
| LLM — MVP | Google Gemini 3.5 Flash (free tier) |
| LLM — V1 | Claude Sonnet 4.6 (Anthropic) |
| Déploiement | Vercel |

## Démo en ligne

[ai-software-architect-zeta.vercel.app](https://ai-software-architect-zeta.vercel.app)

## Dépôt

[github.com/nareph/ai-software-architect](https://github.com/nareph/ai-software-architect)