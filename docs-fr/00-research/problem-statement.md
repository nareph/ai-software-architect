# AI Software Architect - Problem Statement

## Le coût de la phase d'architecture

La phase d'architecture représente aujourd'hui un coût caché considérable dans les projets logiciels :

**Coût direct :** 20 à 40 % du temps projet est consacré aux phases d'analyse et de conception. Pour un projet de 6 mois, cela représente 1 à 2 mois de travail d'architectes et de chefs de projet.

**Coût indirect :** Les décisions implicites ou mal documentées génèrent une dette technique qui se traduit par :
- 15 à 20 % de temps de développement supplémentaire
- Des refontes coûteuses en phase de maintenance
- Une augmentation des bugs liés à des choix architecturaux inadaptés

**Coût d'opportunité :** Le temps passé à documenter et concevoir pourrait être investi dans l'innovation ou l'amélioration des produits existants.

---

## Les erreurs fréquentes

### 1. Décisions implicites
Les architectes prennent des décisions sans les documenter. L'équipe de développement les découvre progressivement, souvent trop tard.

### 2. Incohérences entre artefacts
L'analyse métier, l'architecture et le backlog ne sont pas alignés. Les user stories ne reflètent pas les choix architecturaux.

### 3. Absence de justification
Les choix techniques sont rarement justifiés. Les équipes héritent de décisions sans comprendre le "pourquoi".

### 4. Réinvention systématique
Chaque projet repart de zéro. Les patterns éprouvés ne sont pas réutilisés d'un projet à l'autre.

### 5. Documentation obsolète
Les documents d'architecture sont rarement mis à jour. Ils deviennent rapidement inutilisables.

---

## Les limitations des solutions actuelles

### Outils de génération de code (v0, Bolt, Lovable)
- **Problème :** Ils sautent l'étape d'architecture et passent directement au code.
- **Conséquence :** Les décisions sont prises implicitement par l'IA, sans visibilité ni contrôle.
- **Risque :** Des architectures inadaptées aux besoins réels, difficiles à faire évoluer.

### Assistants de développement (Cursor, Claude Code)
- **Problème :** Ils supposent qu'un codebase existe déjà.
- **Conséquence :** Ils n'aident pas à la phase de conception amont.
- **Risque :** Les mauvaises décisions sont prises avant même que l'assistant ne soit utilisé.

### Agents autonomes (Devin)
- **Problème :** Ils exécutent des tâches bien définies, mais ne conçoivent pas l'architecture.
- **Conséquence :** Ils sont efficaces pour l'implémentation, pas pour la réflexion stratégique.
- **Risque :** Autonomisation de l'implémentation sans vision architecturale globale.

### Outils de modélisation traditionnels (Miro, Structurizr, Archi)
- **Problème :** Ils sont manuels et chronophages. Structurizr et Archi requièrent une expertise élevée.
- **Conséquence :** Peu utilisés en pratique, sauf dans les grands projets fortement contraints.
- **Risque :** Sous-utilisation chronique, documentation inexistante dans la majorité des projets réels.

### LLMs généralistes (ChatGPT, Claude en usage ad hoc)
- **Problème :** Ils peuvent produire des artefacts d'architecture, mais sans structure, sans pipeline et sans validation de cohérence.
- **Conséquence :** Les résultats dépendent entièrement de la qualité du prompt. Chaque utilisateur réinvente son propre workflow.
- **Risque :** Artefacts inconsistants, non exportables, non reproductibles. Pas d'adoption organisationnelle possible.

---

## Pourquoi AI Software Architect est nécessaire

AI Software Architect comble un vide critique dans l'écosystème actuel :

1. **Elle agit en amont** — avant que le code ne soit écrit, là où les décisions ont le plus d'impact.
2. **Elle produit des artefacts structurés** — pas du code, mais des documents exploitables par les équipes.
3. **Elle justifie les décisions** — chaque choix technique est accompagné de son raisonnement.
4. **Elle assure la cohérence** — tous les artefacts sont alignés et traçables.
5. **Elle standardise** — les bonnes pratiques sont réutilisées d'un projet à l'autre.

---

## Pourquoi maintenant ?

Ce projet n'aurait pas été viable il y a trois ans. Trois évolutions convergentes créent aujourd'hui la fenêtre d'opportunité :

### 1. La maturité des LLMs de raisonnement complexe

Les modèles de génération de 2021-2022 produisaient du texte plausible, pas du raisonnement architectural cohérent. Les modèles actuels (Claude 3.5/3.7, GPT-4o) sont capables de :
- Maintenir la cohérence entre plusieurs artefacts interdépendants
- Justifier des choix techniques avec des arguments métier et techniques
- Détecter des antipatterns dans une description de haut niveau
- Adapter les recommandations au contexte (taille d'équipe, budget, contraintes techniques)

Ce niveau de capacité rend pour la première fois possible une génération d'artefacts d'architecture directement exploitables par des équipes professionnelles.

### 2. La standardisation des formats d'artefacts

Mermaid est devenu un standard de facto pour les diagrammes dans les repos Git (GitHub, GitLab le rendent nativement). Le Markdown est universel. OpenAPI et JSON sont acceptés dans tous les outils de gestion de projet. Il est désormais possible de produire des artefacts directement intégrables dans les workflows existants sans friction.

### 3. Le vide laissé par l'explosion du "vibe coding"

v0, Bolt, Lovable et Devin ont créé un marché de masse pour l'IA dans le développement en 2023-2024 — et ont tous ignoré la phase d'architecture. Ce faisant, ils ont rendu le problème encore plus visible : générer du code sans architecture préalable crée des projets difficiles à maintenir, à faire évoluer et à transférer. Le marché commence à ressentir cette douleur. Le moment est idéal pour proposer la pièce manquante.

---

## Métriques de succès

| Métrique | Cible |
|----------|-------|
| Temps de génération (projet standard) | < 5 minutes |
| Temps de génération (projet complexe) | < 10 minutes |
| Taux d'approbation par des architectes seniors | > 80 % |
| Réduction du temps passé en phase d'analyse | > 70 % |
| Cohérence entre artefacts (vérification automatique) | > 95 % |
| Taux d'utilisation des recommandations techniques | > 75 % |
