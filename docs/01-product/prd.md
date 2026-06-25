# AI Software Architect - Product Requirements Document (PRD)

## Objectif du produit

AI Software Architect est une plateforme d'ingénierie assistée par IA qui transforme des besoins métier en artefacts techniques exploitables (architecture, schéma DB, backlog, diagrammes) avant toute écriture de code.

---

## Périmètre (MVP)

### Fonctionnalités incluses

| Fonctionnalité | Description |
|----------------|-------------|
| **Input textuel** | L'utilisateur saisit une description de son projet (minimum 50 mots). |
| **Analyse métier** | Extraction automatique des exigences, acteurs, fonctionnalités et contraintes. |
| **Génération de l'architecture** | Proposition de stack technique, modules, et justifications. |
| **Schéma de base de données** | Modèle conceptuel avec tables, relations et contraintes. |
| **Diagrammes Mermaid** | Génération automatique des diagrammes (C4 niveau 2 ou séquence). |
| **Backlog de développement** | Liste de user stories avec priorité et story points (Fibonacci). |
| **Export** | Téléchargement au format Markdown, PDF et JSON. |

### Fonctionnalités exclues (V1)

- Génération de code source
- Intégration avec des IDEs (VS Code, Cursor)
- Agents autonomes multi-modèles dynamiques
- Base de connaissances partagée (RAG)
- Estimation des coûts cloud (AWS, Azure, GCP)

---

## Contraintes techniques

| Domaine | Contrainte |
|---------|------------|
| **Temps de réponse** | La génération complète doit prendre moins de 2 minutes pour un projet standard. |
| **Langue** | Interface et documentation en français (MVP), anglais prévu en V2. |
| **Modèle LLM principal** | Claude Sonnet 4.6 (Anthropic) — modèle fixe pour le MVP. |
| **Modèle LLM fallback** | GPT-4o via OpenRouter — activé automatiquement en cas d'indisponibilité du modèle principal. |
| **Sélection dynamique de modèle** | Reportée en V2, avec comparaison Claude / GPT / Gemini / DeepSeek. |
| **Stockage** | PostgreSQL pour les projets, artefacts et historique de versions. |
| **Authentification** | Simple email/password (MVP), SSO prévu en V2. |
| **Limite de rate** | 20 requêtes par heure par utilisateur (gratuit). |

---

## Stratégie de validation des artefacts

La qualité des artefacts générés est un prérequis non négociable. Chaque artefact passe par une étape de validation automatique avant d'être affiché à l'utilisateur.

### Pipeline de validation

```
LLM génère l'artefact
        ↓
Validation structurelle (format, complétude)
        ↓
Validation de cohérence inter-artefacts
        ↓
        ├─ Succès → Affichage à l'utilisateur
        └─ Échec → Retry automatique (max 2 tentatives)
                        ↓
                  Échec persistant → Notification utilisateur + option retry manuel
```

### Règles de cohérence inter-artefacts

| Vérification | Description |
|---|---|
| **Architecture ↔ Schéma DB** | Les entités mentionnées dans l'architecture doivent exister dans le schéma DB. |
| **Schéma DB ↔ Backlog** | Les user stories impliquant des données doivent référencer des tables existantes. |
| **Analyse métier ↔ Architecture** | Les acteurs identifiés doivent correspondre à des rôles dans l'architecture. |
| **Diagrammes ↔ Architecture** | Les composants des diagrammes Mermaid doivent refléter l'architecture générée. |

### Gestion des erreurs LLM

- **Timeout (> 30 s par artefact) :** L'étape est marquée en erreur, les autres étapes continuent. L'utilisateur peut relancer manuellement l'étape défaillante.
- **Artefact invalide (2 retries échoués) :** L'utilisateur est notifié avec une description de l'erreur. Il peut modifier son input et relancer.
- **Incohérence détectée :** L'artefact est affiché avec un indicateur d'avertissement `⚠️ Point d'attention détecté`. L'utilisateur peut demander une correction ciblée via le chat.

---

## Objectifs produits (OKRs)

| Objectif | Métrique | Cible |
|----------|----------|-------|
| **Adoption** | Nombre de projets générés par semaine | > 100 |
| **Qualité** | Taux d'approbation par des architectes | > 80 % |
| **Engagement** | Taux de retour utilisateur (feedback) | > 30 % |
| **Efficacité** | Réduction du temps de conception estimé | > 70 % |

---

## KPIs détaillés

| KPI | Définition | Seuil critique |
|-----|------------|----------------|
| **Temps de génération** | Délai entre la soumission et l'affichage des artefacts | < 120 secondes |
| **Taux de complétion** | Pourcentage de générations qui aboutissent sans erreur | > 95 % |
| **Score de cohérence** | Vérification automatique de la cohérence entre artefacts | > 90 % |
| **Satisfaction utilisateur** | Note moyenne sur 5 (enquête post-génération) | > 4.0 |
| **Taux d'export** | Pourcentage d'utilisateurs qui exportent les artefacts | > 60 % |
| **Taux de retry manuel** | Pourcentage de générations nécessitant un retry utilisateur | < 5 % |

---

## UX Principles

1. **Simplicité** : Un seul champ de saisie, un bouton "Générer".
2. **Transparence** : Affichage de la progression étape par étape.
3. **Contrôle** : Possibilité de modifier les inputs intermédiaires.
4. **Clarté** : Visualisation structurée (onglets, diagrammes, tableaux).
5. **Actionnabilité** : Les artefacts sont directement exploitables par les équipes.

---

## Critères de sortie du MVP

- [ ] 10 utilisateurs bêta ont généré au moins 3 projets chacun
- [ ] 100 % des cas de test (définis dans `use-cases.md`) passent avec succès
- [ ] Le temps de génération moyen est inférieur à 2 minutes
- [ ] 5 architectes seniors ont validé la qualité des résultats
- [ ] L'interface est responsive (mobile, tablette, desktop)
- [ ] Le pipeline de validation inter-artefacts est actif et couvre 100 % des règles définies
- [ ] Le mécanisme de retry automatique est opérationnel et testé
