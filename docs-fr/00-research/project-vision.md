# AI Software Architect - Project Vision

## Pourquoi le projet existe

Le développement logiciel moderne souffre d'un paradoxe : alors que les outils d'IA générative capables d'écrire du code se multiplient, la phase la plus critique du cycle de vie — la définition de l'architecture — reste largement manuelle, chronophage et sujette à des erreurs coûteuses.

AI Software Architect existe pour combler ce fossé. La plateforme transforme des descriptions métier en décisions d'architecture structurées, documentées et justifiées — avant qu'une seule ligne de code ne soit écrite.

---

## Quel problème il résout

**Le problème :** Les phases d'analyse et d'architecture représentent 20 à 40 % du temps projet, mais leurs livrables sont souvent incomplets, implicites ou non partagés. Les erreurs de conception détectées tardivement coûtent 100 fois plus cher à corriger que si elles avaient été identifiées en amont.

**Notre solution :** AI Software Architect automatise la production des artefacts d'architecture :

- Analyse métier structurée
- User Stories
- Architecture logicielle (avec justifications)
- Diagrammes Mermaid (C4, séquence, infrastructure)
- Schéma de base de données
- Architecture cloud
- Backlog de développement
- Plan DevOps
- Estimation des coûts

**Positionnement clé :** Nous ne générons pas de code. Nous générons les **décisions** qui guideront le code. C'est ce qui nous distingue fondamentalement des outils comme v0, Bolt ou Lovable.

---

## Qui sont les utilisateurs

| Persona | Besoin principal |
|---------|------------------|
| Startup Founder | Valider une idée et obtenir une architecture crédible pour lever des fonds |
| Freelance Developer | Accélérer les phases d'analyse pour facturer plus de développement |
| Solution Architect | Automatiser la documentation pour se concentrer sur les choix critiques |
| CTO | Standardiser les décisions techniques et éviter les erreurs récurrentes |

Les détails complets de chaque persona sont définis dans [`personas.md`](./personas.md).

---

## Valeur proposée

- **Gain de temps :** Une architecture standard générée en moins de 5 minutes ; jusqu'à 10 minutes pour des architectures complexes (microservices, systèmes distribués, migrations legacy).
- **Qualité :** Des décisions justifiées, cohérentes et alignées sur les bonnes pratiques.
- **Traçabilité :** Toutes les décisions sont documentées et réutilisables.
- **Réduction des risques :** Détection précoce des antipatterns et des incohérences.
- **Standardisation :** Une base commune pour toute l'équipe technique.

---

## Pourquoi maintenant ?

Trois conditions se sont réunies simultanément en 2024-2026 pour rendre ce projet possible et pertinent :

1. **La maturité des LLMs de raisonnement.** Des modèles comme Claude 3.5/3.7 ou GPT-4o sont capables de produire des raisonnements architecturaux cohérents, de justifier des choix techniques et de maintenir une cohérence entre plusieurs artefacts interdépendants. Ce niveau de capacité n'existait pas avant 2023.

2. **L'explosion des outils de génération de code sans architecture.** v0, Bolt, Lovable et Devin ont créé un marché de masse pour l'IA dans le développement, mais ont tous ignoré la phase amont. Le gap est visible, documenté, et aucun acteur ne l'adresse directement.

3. **La standardisation des formats d'artefacts.** Mermaid est devenu un standard de facto pour les diagrammes dans les repos Git. Les formats Markdown, JSON et OpenAPI sont universellement acceptés. Il est désormais possible de produire des artefacts directement exploitables sans friction d'intégration.

Ces trois facteurs réunis créent une fenêtre d'opportunité unique : le marché est prêt, la technologie est disponible, et la position est non occupée.
