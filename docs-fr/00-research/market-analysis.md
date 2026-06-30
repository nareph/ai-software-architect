# AI Software Architect - Market Analysis

## Étude des solutions existantes

### v0.dev (Vercel) → v0.app

**Ce qu'ils font :** Assistant IA pour le scaffolding frontend. Transforme des prompts textuels en composants React stylés avec Tailwind CSS. La nouvelle version v0.app est "agentique" : elle peut rechercher, raisonner, déboguer et planifier. Elle génère des applications full-stack avec UI, contenu, backend et logique.

**Ce qu'ils ne font pas :** Pas d'architecture logicielle, pas de modélisation de base de données, pas de backlog, pas d'analyse métier structurée. Reste centré sur la génération d'UI et de code frontend.

**Positionnement :** "AI builder for everyone" — outil de prototypage rapide, pas un assistant d'architecture.

---

### Bolt (StackBlitz)

**Ce qu'ils font :** Agent IA de développement web full-stack. Bolt v2 propose des agents multi-modèles (Claude, etc.) avec infrastructure intégrée (bases de données, hébergement, authentification, paiements). Exécute des tâches complexes en parallèle.

**Ce qu'ils ne font pas :** Pas d'analyse métier préalable, pas de documentation architecturale structurée. L'utilisateur doit savoir ce qu'il veut construire.

**Positionnement :** "Vibe coding pro" — génération de code, pas de conception architecturale.

---

### Lovable

**Ce qu'ils font :** Plateforme de développement par chat. Génère des applications full-stack avec frontend React et backend Supabase. Mode Agent capable d'explorer le codebase, corriger des bugs et refactorer. Intégration GitHub et déploiement en un clic.

**Ce qu'ils ne font pas :** Stack technologique relativement verrouillée (React + Supabase). Pas de conception d'architecture indépendante du code.

**Positionnement :** Outil "vibe coding" le plus complet pour le web — mais focalisé sur l'implémentation, pas la conception.

---

### Devin (Cognition)

**Ce qu'ils font :** "Premier ingénieur logiciel IA autonome". Peut écrire, exécuter et tester du code. Planifie et exécute des tâches complexes, de la migration de code à la résolution d'incidents. Opère dans un environnement sandboxé avec shell, éditeur et navigateur.

**Ce qu'ils ne font pas :** Ne produit pas d'architecture en amont. Conçu pour des tâches bien définies, pas pour la conception de systèmes.

**Positionnement :** Agent d'implémentation autonome, pas architecte.

---

### Claude Code (Anthropic)

**Ce qu'ils font :** Agent en ligne de commande qui lit les codebases, édite des fichiers, exécute des commandes. Couvre tout le cycle de vie : exploration, conception, construction, déploiement, support.

**Ce qu'ils ne font pas :** Nécessite un codebase existant. Pas de génération d'architecture à partir d'une simple description métier.

**Positionnement :** Assistant de développement intégré à l'environnement de code, pas outil de conception amont.

---

### Cursor

**Ce qu'ils font :** IDE autonome (fork de VS Code) centré sur l'IA. Compréhension de l'ensemble du codebase. Agents locaux et cloud, exécution parallèle.

**Ce qu'ils ne font pas :** Outil de codage, pas de génération d'architecture. Nécessite un projet existant.

**Positionnement :** "IDE rebuilt around AI" — assistant de développement, pas architecte.

---

### Replit Agent

**Ce qu'ils font :** Agent de bout en bout capable de planifier, coder, tester et déployer. Supporte tous les frameworks et langages (Python, Java, Rust, Go, C#, Angular, Vue). Agent de sécurité pour audits de code.

**Ce qu'ils ne font pas :** Pas de phase d'architecture dédiée. L'agent passe directement à l'implémentation.

**Positionnement :** Environnement de développement cloud avec agent IA, pas outil de conception.

---

## Outils de modélisation traditionnels

Ces outils représentent le marché existant de la conception architecturale — les vrais concurrents sur l'espace "architecture avant le code". Ils sont utilisés aujourd'hui par les architectes seniors que nous ciblons.

### Miro / Lucidchart / draw.io

**Ce qu'ils font :** Tableaux blancs collaboratifs et outils de diagrammes. Permettent de dessiner manuellement des architectures, des flux, des ERD et des C4 diagrams.

**Ce qu'ils ne font pas :** Aucune génération automatique à partir d'une description métier. Pas de cohérence garantie entre artefacts. Pas de backlog, pas d'analyse métier intégrée.

**Limite principale :** 100 % manuel. La qualité dépend entièrement de l'expertise de l'utilisateur. Aucun filet de sécurité contre les incohérences.

**Positionnement :** Outils de dessin, pas de conception intelligente.

---

### Structurizr

**Ce qu'ils font :** Outil de modélisation C4 basé sur le code (DSL). Permet de décrire une architecture en texte et de générer des diagrammes cohérents automatiquement.

**Ce qu'ils ne font pas :** Nécessite une expertise C4 et la maîtrise du DSL. Pas d'analyse métier, pas de backlog, pas de recommandations de stack. Aucune génération à partir d'une description naturelle.

**Limite principale :** Courbe d'apprentissage élevée. Réservé aux architectes expérimentés. Pas accessible aux founders ou freelances.

**Positionnement :** Outil expert pour architectes C4 — complémentaire, pas concurrent direct.

---

### Archi (ArchiMate)

**Ce qu'ils font :** Outil de modélisation d'architecture d'entreprise basé sur le standard ArchiMate. Utilisé dans les grandes entreprises pour modéliser les systèmes d'information à grande échelle.

**Ce qu'ils ne font pas :** Outil très complexe, standard propriétaire, courbe d'apprentissage de plusieurs mois. Aucune IA intégrée, aucun lien avec le backlog ou le code.

**Limite principale :** Réservé aux grandes entreprises avec des architectes d'entreprise dédiés. Inadapté aux startups et freelances.

**Positionnement :** Modélisation d'architecture d'entreprise — segment de marché différent.

---

### ChatGPT / Claude (usage généraliste)

**Ce qu'ils font :** Peuvent produire des ébauches d'architecture, des schémas de bases de données ou des backlogs si on leur demande manuellement.

**Ce qu'ils ne font pas :** Pas de workflow structuré. Pas de cohérence garantie entre les artefacts. Pas d'export standardisé. Pas de validation automatique. Chaque utilisateur réinvente son propre processus.

**Limite principale :** Le résultat dépend entièrement de la qualité du prompt. Sans structure, sans pipeline, sans validation — les artefacts ne sont pas prêts à l'emploi.

**Positionnement :** Usage ad hoc, pas une plateforme. C'est précisément ce que AI Software Architect structure et automatise.

---

## Synthèse et positionnement d'AI Software Architect

| Outil | Génération de code | Architecture | Analyse métier | Backlog | Diagrammes | Estimation coûts | Accessible non-experts |
|-------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| v0.app | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Bolt | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Lovable | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Devin | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ |
| Claude Code | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ |
| Cursor | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ |
| Replit Agent | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Miro / draw.io | ❌ | ⚠️ manuel | ❌ | ❌ | ⚠️ manuel | ❌ | ✅ |
| Structurizr | ❌ | ⚠️ partiel | ❌ | ❌ | ✅ | ❌ | ❌ |
| Archi | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| ChatGPT / Claude ad hoc | ❌ | ⚠️ non structuré | ⚠️ non structuré | ⚠️ non structuré | ⚠️ non structuré | ❌ | ✅ |
| **AI Software Architect** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Conclusion :** Aucun outil existant ne combine génération automatique, cohérence inter-artefacts et accessibilité pour non-experts sur la phase d'architecture amont. Les outils de génération de code ignorent cette phase. Les outils de modélisation traditionnels la couvrent partiellement, mais requièrent une expertise élevée et restent 100 % manuels. AI Software Architect occupe un espace vide et complémentaire : **la conception avant l'implémentation, automatisée et accessible**.
