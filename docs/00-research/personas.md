# AI Software Architect - Personas

## 1. Startup Founder

**Profil :** Créateur d'entreprise, souvent non-technique ou avec des compétences techniques limitées. Doit valider une idée rapidement pour lever des fonds ou attirer des premiers utilisateurs.

**Objectifs :**
- Transformer une idée en une architecture crédible
- Obtenir une estimation des coûts cloud
- Disposer d'une stack technique recommandée et justifiée
- Produire une documentation présentable pour des investisseurs

**Douleurs :**
- Ne sait pas par où commencer sur le plan technique
- Les développeurs qu'il consulte donnent des avis contradictoires
- Difficulté à estimer les coûts et les délais
- Les outils de génération de code ne l'aident pas à prendre des décisions

**Mesure de succès :** Obtenir une architecture complète et documentée en moins de 5 minutes, présentable à un CTO ou un investisseur.

---

## 2. Freelance Developer

**Profil :** Développeur indépendant qui enchaîne les missions. Souvent seul ou avec une petite équipe. Doit livrer rapidement et à moindre coût.

**Objectifs :**
- Accélérer les phases d'analyse et de conception
- Réduire le temps passé en amont des projets
- Produire une documentation de qualité sans effort
- Facturer plus de jours de développement (vs. analyse)

**Douleurs :**
- Les phases d'analyse ne sont pas facturées ou le sont mal
- Passe trop de temps à documenter des décisions déjà prises
- Manque de recul sur les choix architecturaux
- Doit souvent justifier ses choix auprès des clients

**Mesure de succès :** Réduire de 70 % le temps passé sur les artefacts d'architecture.

---

## 3. Solution Architect

**Profil :** Architecte logiciel senior dans une entreprise de taille moyenne à grande (200 à 2 000 employés). Responsable de la cohérence technique de 3 à 8 projets simultanés. Interlocuteur clé entre les équipes métier et les équipes de développement.

**Contexte opérationnel :**
- Gère plusieurs projets en parallèle avec des équipes différentes
- Doit produire une documentation exploitable par des développeurs juniors et seniors
- Travaille dans un environnement outillé : Confluence, Jira, draw.io, parfois Structurizr
- Ses livrables sont attendus par les équipes avant le sprint 0

**Objectifs :**
- Automatiser la production de la documentation de premier niveau
- Se concentrer sur les arbitrages critiques plutôt que la rédaction répétitive
- Assurer la cohérence entre les projets de son portefeuille
- Disposer d'une traçabilité des décisions architecturales dans le temps

**Douleurs :**
- Passe 30 à 50 % de son temps à rédiger des documents que l'IA pourrait produire automatiquement
- Les équipes de développement ne suivent pas les recommandations faute de documentation claire
- Les décisions prises oralement ne sont jamais formalisées et se perdent
- Chaque nouveau projet repart d'un template vide plutôt que de patterns éprouvés
- La maintenance de la documentation devient impossible dès que le projet prend de la vitesse

**Relation aux outils existants :**
- Utilise déjà draw.io ou Miro pour les diagrammes — trop manuel, trop lent
- A essayé Structurizr — trop de friction pour les équipes qui ne connaissent pas le DSL C4
- Utilise ChatGPT de façon ad hoc — utile mais résultats inconsistants, pas de workflow reproductible

**Mesure de succès :** Production automatisée de 80 % des artefacts d'architecture de premier niveau, permettant de consacrer 100 % du temps restant aux décisions critiques non automatisables.

---

## 4. CTO

**Profil :** Responsable technique d'une scale-up ou PME (50 à 500 employés). Supervise l'ensemble de la stratégie technique, l'organisation des équipes et les choix d'infrastructure. Porte la responsabilité des décisions techniques à moyen et long terme.

**Contexte opérationnel :**
- Supervise entre 3 et 15 projets simultanés portés par des équipes autonomes
- N'est plus dans le code au quotidien — dépend des rapports et artefacts produits par ses équipes
- Doit aligner des équipes avec des niveaux de maturité technique hétérogènes
- Rend des comptes à un board ou des investisseurs sur les choix techniques

**Objectifs :**
- Standardiser les décisions techniques à travers l'organisation pour éviter la fragmentation
- Réduire les erreurs d'architecture récurrentes qui génèrent de la dette technique
- Accélérer l'arrivée en phase de développement des nouveaux projets
- Disposer d'une visibilité consolidée sur les choix techniques de chaque projet

**Douleurs :**
- Chaque équipe réinvente sa propre architecture, créant une fragmentation des patterns et une dette de maintenance
- Les erreurs architecturales se répètent d'un projet à l'autre faute de base de connaissances commune
- Il n'existe aucun standard interne formalisé : les décisions dépendent du bon vouloir de l'architecte le plus senior présent
- Les nouveaux projets démarrent sans documentation, ce qui ralentit l'onboarding des développeurs
- Impossible d'auditer rapidement les choix techniques d'un projet sans plonger dans le code

**Relation aux outils existants :**
- A déjà Confluence + Jira pour la gestion de projet — mais la documentation d'architecture y est rare, incohérente ou obsolète
- Les équipes utilisent draw.io ou des slides PowerPoint pour les architectures — non maintenables
- A conscience que les LLMs peuvent aider, mais n'a pas de processus structuré pour les intégrer dans le workflow

**Ce qu'il cherche concrètement :**
- Un outil que ses équipes adoptent naturellement en début de projet
- Des artefacts exportables dans les outils existants (Confluence, Jira, GitHub)
- Une garantie de cohérence minimale entre ce qui est documenté et ce qui est implémenté

**Mesure de succès :** Tous les nouveaux projets démarrent avec une base architecturale documentée, cohérente et partagée — sans friction pour les équipes.
