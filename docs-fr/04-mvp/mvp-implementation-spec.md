# Spécification d'implémentation MVP

## Périmètre

Le MVP est une application monolithique Next.js 16 permettant à un utilisateur de :
1. Saisir une description de projet avec une langue choisie (FR/EN)
2. Déclencher le pipeline de génération (5 agents IA séquentiels)
3. Visualiser les artefacts générés par onglets
4. Exporter en Markdown, PDF ou JSON
5. Affiner les artefacts via le panel feedback/chat
6. Relancer la génération des artefacts échoués individuellement

---

## Stack technique exacte

| Couche | Technologie | Version |
|---|---|---|
| Framework | Next.js | 16.2.9 |
| Runtime | Node.js | ≥ 20.9.0 |
| Langage | TypeScript | 5.x |
| UI | React | 19.x |
| Styles | Tailwind CSS | 4.x |
| Composants | shadcn/ui (preset Nova) | latest |
| Base de données | Neon PostgreSQL | serverless |
| ORM | Drizzle ORM | 0.38+ |
| Auth | NextAuth.js | 5.x (beta) |
| Cache / Rate limit | Upstash Redis | latest |
| LLM primaire | Google Gemini 3.5 Flash | free tier |
| LLM fallback | DeepSeek V4 Flash | latest |
| Diagrammes | Mermaid.js | 11.x |
| i18n | next-intl | latest |
| Export PDF | @react-pdf/renderer | latest |
| Gestionnaire de paquets | pnpm | 9.x |
| Déploiement | Vercel | - |

---

## Migration Mock → LLM réel

**Pour passer du mock au LLM réel : changer UNE variable d'environnement**

```bash
# Mock (défaut pour la beta MVP)
USE_MOCK_GENERATION=true

# LLM réel (V1 public)
USE_MOCK_GENERATION=false
```

L'orchestrateur dans `src/lib/agents/orchestrator.ts` gère le basculement automatiquement. Aucune modification de route ou de composant nécessaire.

---

## i18n

**Pour changer la langue par défaut de l'UI : changer UNE variable d'environnement**

```bash
NEXT_PUBLIC_DEFAULT_LOCALE=fr   # Français (défaut)
NEXT_PUBLIC_DEFAULT_LOCALE=en   # Anglais
```

Toutes les chaînes UI sont dans `messages/fr.json` et `messages/en.json`. Aucun texte codé en dur dans les composants.

**La langue du projet** est définie indépendamment à la création — les artefacts et le feedback suivent toujours la langue du projet, quelle que soit la locale de l'UI.

---

## Critères de complétion MVP

| Critère | Statut | Description |
|---|---|---|
| Auth fonctionnelle | ✅ | Inscription, connexion, déconnexion |
| Création de projet | ✅ | Formulaire + nom + sélecteur de langue + validation + persistance |
| Langue du projet | ✅ | FR/EN par projet, dissociée de la locale UI |
| Pipeline complet | ✅ | 5 agents séquentiels avec retry (max 2) et fallback |
| Progression temps réel | ✅ | SSE opérationnel, barre de progression mise à jour |
| Visualisation artefacts | ✅ | 5 onglets, Mermaid rendu, vues typées |
| Score de cohérence | ✅ | Validation réelle (5 règles), non aléatoire |
| Retry artefact individuel | ✅ | Bouton retry par artefact échoué, contexte reconstruit |
| Réparation JSON | ✅ | Réponses LLM tronquées auto-réparées |
| Export Markdown | ✅ | Téléchargement .md complet |
| Export JSON | ✅ | Téléchargement .json structuré |
| Export PDF | ✅ | .pdf formaté avec page de couverture |
| Feedback/Chat | ✅ | Modes modifier + expliquer, locale du projet |
| Suppression projet | ✅ | Suppression douce (archive) avec confirmation |
| Rate limiting | ✅ | 20 générations/heure, 30 exports/heure |
| Sanitisation XSS | ✅ | Sortie LLM sanitisée avant affichage |
| Responsive | ✅ | Mobile, tablette, desktop |
| i18n UI | ✅ | Français et anglais supportés |
| Documentation | ✅ | GitBook EN (primaire) + FR (variante) |
| Historique versions | ⬜ | UI navigable — Phase 5 |
| 10 utilisateurs beta | ⬜ | Chacun ayant généré ≥ 3 projets |

---

## Décisions architecturales

### ADR-001 : Langue au niveau du projet
**Décision :** Langue stockée dans la table `projects`, non dérivée de la locale UI.
**Raison :** Les utilisateurs peuvent avoir des projets dans différentes langues. Les artefacts, le feedback et le retry suivent automatiquement la langue du projet.

### ADR-002 : Stratégie de réparation JSON
**Décision :** `repairJSON()` dans LLMClient tente de fermer les structures ouvertes avant d'échouer.
**Raison :** Gemini 3.5 Flash tronque parfois les grandes réponses JSON. La réparation évite les retries inutiles.

### ADR-003 : Retry d'artefact individuel
**Décision :** `POST /api/generate/[projectId]/retry` reconstruit le contexte cumulatif depuis les artefacts complétés en DB.
**Raison :** Le retry complet du pipeline gaspille des tokens et du temps quand une seule étape a échoué.

### ADR-004 : Langue du panel feedback
**Décision :** L'UI du FeedbackPanel suit `project.locale`, pas la locale UI.
**Raison :** Les demandes de modification de contenu doivent être dans la même langue que l'artefact pour maintenir la cohérence.
