// src/lib/mock/artifacts.ts
// Données mock pour simuler les artefacts générés par l'IA
// À remplacer par les vrais appels LLM en Phase B

export const MOCK_DELAY_MS = {
  business_analysis: 4000,
  architecture:      6000,
  database_schema:   5000,
  diagrams:          4000,
  backlog:           7000,
}

export const MOCK_ARTIFACTS = {
  business_analysis: {
    summary: "Plateforme SaaS de réservation permettant aux utilisateurs de consulter des créneaux, réserver des cours, payer en ligne et gérer leurs abonnements. Le système supporte plusieurs rôles (administrateur, coach, membre) et est accessible sur mobile et desktop.",
    actors: [
      { name: "Membre", role: "Utilisateur principal", description: "Consulte les créneaux, réserve des cours, gère son abonnement et ses paiements." },
      { name: "Coach", role: "Prestataire de service", description: "Gère ses disponibilités, consulte ses réservations, valide les présences." },
      { name: "Administrateur", role: "Gestionnaire de la plateforme", description: "Gère les utilisateurs, les plannings, les abonnements et consulte les rapports." },
      { name: "Stripe", role: "Système externe — paiement", description: "Traite les paiements en ligne et gère les abonnements récurrents." },
    ],
    features: [
      { name: "Consultation des créneaux", description: "Affichage du calendrier des cours disponibles avec filtres par coach, discipline et horaire.", priority: "critical", actor: "Membre" },
      { name: "Réservation de cours", description: "Sélection et confirmation d'un créneau avec vérification des disponibilités en temps réel.", priority: "critical", actor: "Membre" },
      { name: "Paiement en ligne", description: "Intégration Stripe pour le paiement des cours à l'unité et des abonnements.", priority: "critical", actor: "Membre" },
      { name: "Gestion des abonnements", description: "Souscription, modification et annulation des abonnements mensuels et annuels.", priority: "critical", actor: "Membre" },
      { name: "Annulation de réservation", description: "Possibilité d'annuler jusqu'à 24h avant le cours avec remboursement automatique.", priority: "high", actor: "Membre" },
      { name: "Notifications email/SMS", description: "Confirmations, rappels et alertes envoyés automatiquement aux membres et coachs.", priority: "high", actor: "Membre" },
      { name: "Tableau de bord coach", description: "Vue des réservations, gestion des disponibilités et suivi des présences.", priority: "high", actor: "Coach" },
      { name: "Back-office administrateur", description: "Gestion complète des utilisateurs, plannings, rapports financiers et configuration.", priority: "medium", actor: "Administrateur" },
    ],
    businessRules: [
      "Un membre ne peut pas réserver deux cours au même horaire.",
      "L'annulation est possible jusqu'à 24h avant le début du cours.",
      "Un abonnement mensuel donne droit à 8 cours par mois, un abonnement annuel à 96 cours.",
      "Un coach doit valider sa disponibilité au moins 7 jours à l'avance.",
      "Le remboursement en cas d'annulation est automatique via Stripe sous 5 jours ouvrés.",
    ],
    constraints: [
      "L'application doit être responsive (mobile, tablette, desktop).",
      "Les paiements sont traités exclusivement via Stripe.",
      "Les notifications SMS sont limitées aux confirmations et rappels critiques.",
    ],
    assumptions: [
      "Un seul établissement sportif dans un premier temps (multi-établissements prévu en V2).",
      "Les coachs sont des employés de l'établissement, pas des prestataires externes.",
      "La devise est l'Euro, aucune conversion de devise n'est nécessaire.",
    ],
    outOfScope: [
      "Application mobile native (iOS/Android) — webapp responsive uniquement.",
      "Gestion de la comptabilité et de la facturation fiscale.",
      "Système de visioconférence pour les cours en ligne.",
    ],
  },

  architecture: {
    overview: "Architecture monolithe modulaire déployée sur Vercel avec Neon PostgreSQL. Choix justifié par la taille d'équipe (1-3 développeurs), le budget limité et la nécessité d'itérer rapidement. La séparation en modules prépare une migration vers microservices si l'échelle le justifie.",
    style: "Monolithe modulaire",
    justification: "Pour une équipe de 1 à 3 développeurs avec un budget cloud limité, le monolithe modulaire offre le meilleur rapport simplicité/maintenabilité. Les microservices seraient prématurés et ajouteraient une complexité opérationnelle non justifiée à ce stade.",
    stack: [
      { layer: "Frontend", technology: "Next.js 16 (App Router)", version: "16.x", justification: "SSR natif, API Routes intégrées, déploiement Vercel optimisé.", alternatives: ["Remix", "Nuxt.js"] },
      { layer: "Backend", technology: "Next.js API Routes", version: "16.x", justification: "Évite un backend séparé pour le MVP, simplifie le déploiement.", alternatives: ["Express.js séparé", "Fastify"] },
      { layer: "Base de données", technology: "Neon PostgreSQL", version: "16.x", justification: "Serverless, compatible Vercel, free tier généreux, PostgreSQL standard.", alternatives: ["PlanetScale", "Supabase"] },
      { layer: "ORM", technology: "Drizzle ORM", version: "0.38+", justification: "Typesafe, léger, compatible Edge Runtime, migrations versionnées.", alternatives: ["Prisma", "Kysely"] },
      { layer: "Authentification", technology: "NextAuth.js v5", version: "5.x", justification: "Intégration native Next.js, JWT, extensible pour OAuth en V2.", alternatives: ["Clerk", "Auth0"] },
      { layer: "Paiement", technology: "Stripe", version: "latest", justification: "Standard de facto, documentation excellente, webhooks fiables.", alternatives: ["Paddle", "Lemon Squeezy"] },
      { layer: "Notifications", technology: "Resend (email) + Twilio (SMS)", version: "latest", justification: "Resend pour l'email transactionnel moderne, Twilio pour les SMS.", alternatives: ["SendGrid", "Vonage"] },
      { layer: "Cache", technology: "Upstash Redis", version: "latest", justification: "Serverless, compatible Vercel, rate limiting et cache de sessions.", alternatives: ["Redis Cloud", "Memcached"] },
    ],
    modules: [
      { name: "Auth Module", responsibility: "Authentification, sessions, gestion des rôles et permissions.", technology: "NextAuth.js v5", dependencies: [], exposedApis: ["/api/auth/*"] },
      { name: "Booking Module", responsibility: "Gestion des réservations, vérification des disponibilités, annulations.", technology: "Next.js API Routes + Drizzle", dependencies: ["Auth Module", "Notification Module"], exposedApis: ["/api/bookings"] },
      { name: "Subscription Module", responsibility: "Gestion des abonnements, intégration Stripe Billing, webhooks.", technology: "Next.js API Routes + Stripe SDK", dependencies: ["Auth Module"], exposedApis: ["/api/subscriptions", "/api/webhooks/stripe"] },
      { name: "Schedule Module", responsibility: "Gestion des plannings des coachs et des créneaux disponibles.", technology: "Next.js API Routes + Drizzle", dependencies: ["Auth Module"], exposedApis: ["/api/schedules"] },
      { name: "Notification Module", responsibility: "Envoi d'emails (Resend) et SMS (Twilio) transactionnels.", technology: "Resend SDK + Twilio SDK", dependencies: [], exposedApis: [] },
    ],
    patterns: [
      { name: "Repository Pattern", justification: "Abstraction de la couche données pour faciliter les tests et l'évolution du schéma." },
      { name: "Webhook Pattern", justification: "Indispensable pour les événements Stripe asynchrones (paiements, abonnements)." },
      { name: "Optimistic UI", justification: "Amélioration de la réactivité perçue lors des réservations." },
    ],
    risks: [
      { description: "Dépendance forte à Stripe — tout changement de provider implique une refonte du module paiement.", severity: "medium", mitigation: "Encapsuler Stripe derrière une interface abstraite PaymentProvider." },
      { description: "Performance des requêtes de calendrier lors de pics d'utilisation.", severity: "low", mitigation: "Mise en cache Redis des créneaux disponibles avec TTL de 5 minutes." },
    ],
    scalabilityNotes: "Le monolithe peut tenir jusqu'à ~5 000 utilisateurs actifs simultanés sur Vercel. Au-delà, extraction du Booking Module en microservice indépendant.",
    securityNotes: "RBAC via NextAuth, toutes les routes API vérifient le rôle de l'utilisateur. Webhooks Stripe signés et vérifiés. PII chiffrés en base.",
  },

  database_schema: {
    engine: "PostgreSQL",
    justification: "Choix naturel pour un système de réservation avec des relations complexes (users ↔ bookings ↔ schedules ↔ subscriptions). Les garanties ACID sont indispensables pour éviter les doubles réservations.",
    tables: [
      {
        name: "users",
        description: "Utilisateurs de la plateforme (membres, coachs, administrateurs).",
        columns: [
          { name: "id", type: "UUID", nullable: false, unique: true, primaryKey: true, foreignKey: null, default: "gen_random_uuid()", description: "Identifiant unique." },
          { name: "email", type: "VARCHAR(255)", nullable: false, unique: true, primaryKey: false, foreignKey: null, default: null, description: "Email unique de l'utilisateur." },
          { name: "name", type: "VARCHAR(255)", nullable: true, unique: false, primaryKey: false, foreignKey: null, default: null, description: "Nom complet." },
          { name: "password_hash", type: "VARCHAR(255)", nullable: true, unique: false, primaryKey: false, foreignKey: null, default: null, description: "Hash bcrypt du mot de passe." },
          { name: "role", type: "VARCHAR(20)", nullable: false, unique: false, primaryKey: false, foreignKey: null, default: "'member'", description: "Rôle: member | coach | admin." },
          { name: "created_at", type: "TIMESTAMPTZ", nullable: false, unique: false, primaryKey: false, foreignKey: null, default: "NOW()", description: "Date de création." },
          { name: "deleted_at", type: "TIMESTAMPTZ", nullable: true, unique: false, primaryKey: false, foreignKey: null, default: null, description: "Soft delete." },
        ],
        indexes: [{ columns: ["email"], unique: true, description: "Recherche par email." }],
      },
      {
        name: "schedules",
        description: "Créneaux horaires définis par les coachs.",
        columns: [
          { name: "id", type: "UUID", nullable: false, unique: true, primaryKey: true, foreignKey: null, default: "gen_random_uuid()", description: "Identifiant unique." },
          { name: "coach_id", type: "UUID", nullable: false, unique: false, primaryKey: false, foreignKey: { table: "users", column: "id", onDelete: "CASCADE" }, default: null, description: "Coach responsable du créneau." },
          { name: "title", type: "VARCHAR(255)", nullable: false, unique: false, primaryKey: false, foreignKey: null, default: null, description: "Titre du cours." },
          { name: "starts_at", type: "TIMESTAMPTZ", nullable: false, unique: false, primaryKey: false, foreignKey: null, default: null, description: "Début du créneau." },
          { name: "ends_at", type: "TIMESTAMPTZ", nullable: false, unique: false, primaryKey: false, foreignKey: null, default: null, description: "Fin du créneau." },
          { name: "capacity", type: "INTEGER", nullable: false, unique: false, primaryKey: false, foreignKey: null, default: "10", description: "Nombre maximum de participants." },
          { name: "created_at", type: "TIMESTAMPTZ", nullable: false, unique: false, primaryKey: false, foreignKey: null, default: "NOW()", description: "Date de création." },
        ],
        indexes: [
          { columns: ["coach_id"], unique: false, description: "Créneaux par coach." },
          { columns: ["starts_at", "ends_at"], unique: false, description: "Recherche par plage horaire." },
        ],
      },
      {
        name: "bookings",
        description: "Réservations des membres sur des créneaux.",
        columns: [
          { name: "id", type: "UUID", nullable: false, unique: true, primaryKey: true, foreignKey: null, default: "gen_random_uuid()", description: "Identifiant unique." },
          { name: "member_id", type: "UUID", nullable: false, unique: false, primaryKey: false, foreignKey: { table: "users", column: "id", onDelete: "CASCADE" }, default: null, description: "Membre ayant réservé." },
          { name: "schedule_id", type: "UUID", nullable: false, unique: false, primaryKey: false, foreignKey: { table: "schedules", column: "id", onDelete: "CASCADE" }, default: null, description: "Créneau réservé." },
          { name: "status", type: "VARCHAR(20)", nullable: false, unique: false, primaryKey: false, foreignKey: null, default: "'confirmed'", description: "confirmed | cancelled | attended." },
          { name: "cancelled_at", type: "TIMESTAMPTZ", nullable: true, unique: false, primaryKey: false, foreignKey: null, default: null, description: "Date d'annulation." },
          { name: "created_at", type: "TIMESTAMPTZ", nullable: false, unique: false, primaryKey: false, foreignKey: null, default: "NOW()", description: "Date de réservation." },
        ],
        indexes: [
          { columns: ["member_id", "schedule_id"], unique: true, description: "Empêche les doubles réservations." },
          { columns: ["schedule_id"], unique: false, description: "Toutes les réservations d'un créneau." },
        ],
      },
      {
        name: "subscriptions",
        description: "Abonnements des membres avec intégration Stripe.",
        columns: [
          { name: "id", type: "UUID", nullable: false, unique: true, primaryKey: true, foreignKey: null, default: "gen_random_uuid()", description: "Identifiant unique." },
          { name: "member_id", type: "UUID", nullable: false, unique: false, primaryKey: false, foreignKey: { table: "users", column: "id", onDelete: "CASCADE" }, default: null, description: "Membre abonné." },
          { name: "stripe_subscription_id", type: "VARCHAR(255)", nullable: true, unique: true, primaryKey: false, foreignKey: null, default: null, description: "ID Stripe de l'abonnement." },
          { name: "plan", type: "VARCHAR(20)", nullable: false, unique: false, primaryKey: false, foreignKey: null, default: null, description: "monthly | annual." },
          { name: "status", type: "VARCHAR(20)", nullable: false, unique: false, primaryKey: false, foreignKey: null, default: "'active'", description: "active | cancelled | past_due." },
          { name: "current_period_end", type: "TIMESTAMPTZ", nullable: true, unique: false, primaryKey: false, foreignKey: null, default: null, description: "Fin de la période en cours." },
          { name: "created_at", type: "TIMESTAMPTZ", nullable: false, unique: false, primaryKey: false, foreignKey: null, default: "NOW()", description: "Date de souscription." },
        ],
        indexes: [{ columns: ["member_id"], unique: false, description: "Abonnement d'un membre." }],
      },
    ],
    relations: [
      { from: "schedules.coach_id", to: "users.id", type: "many_to_one", description: "Un coach peut avoir plusieurs créneaux." },
      { from: "bookings.member_id", to: "users.id", type: "many_to_one", description: "Un membre peut avoir plusieurs réservations." },
      { from: "bookings.schedule_id", to: "schedules.id", type: "many_to_one", description: "Un créneau peut avoir plusieurs réservations." },
      { from: "subscriptions.member_id", to: "users.id", type: "one_to_one", description: "Un membre a un abonnement actif à la fois." },
    ],
    enums: [
      { name: "user_role", values: ["member", "coach", "admin"] },
      { name: "booking_status", values: ["confirmed", "cancelled", "attended"] },
      { name: "subscription_plan", values: ["monthly", "annual"] },
      { name: "subscription_status", values: ["active", "cancelled", "past_due"] },
    ],
    notes: [
      "Index unique sur (member_id, schedule_id) dans bookings pour garantir l'absence de doubles réservations au niveau base de données.",
      "soft delete sur users pour conserver l'historique des réservations des membres supprimés.",
      "stripe_subscription_id nullable pour les membres sans abonnement actif.",
    ],
  },

  diagrams: {
    c4_container: `C4Container
    title Plateforme de Réservation Sportive

    Person(member, "Membre", "Réserve des cours et gère son abonnement")
    Person(coach, "Coach", "Gère ses créneaux et consulte ses réservations")
    Person(admin, "Administrateur", "Gère la plateforme")

    System_Boundary(app, "Plateforme de Réservation") {
      Container(webapp, "Web App", "Next.js 16", "Interface utilisateur responsive")
      Container(api, "API Routes", "Next.js API", "Logique métier et endpoints REST")
      Container(db, "Base de données", "Neon PostgreSQL", "Données persistantes")
      Container(cache, "Cache", "Upstash Redis", "Sessions et rate limiting")
    }

    System_Ext(stripe, "Stripe", "Paiements et abonnements")
    System_Ext(resend, "Resend", "Emails transactionnels")
    System_Ext(twilio, "Twilio", "Notifications SMS")

    Rel(member, webapp, "Utilise", "HTTPS")
    Rel(coach, webapp, "Utilise", "HTTPS")
    Rel(admin, webapp, "Utilise", "HTTPS")
    Rel(webapp, api, "Appelle", "HTTP/JSON")
    Rel(api, db, "Lit/Écrit", "SQL/TLS")
    Rel(api, cache, "Cache", "Redis Protocol")
    Rel(api, stripe, "Paiements", "HTTPS/API")
    Rel(api, resend, "Emails", "HTTPS/API")
    Rel(api, twilio, "SMS", "HTTPS/API")`,

    sequence: `sequenceDiagram
    participant M as Membre
    participant W as Web App
    participant A as API Routes
    participant DB as PostgreSQL
    participant S as Stripe

    M->>W: Consulte les créneaux disponibles
    W->>A: GET /api/schedules
    A->>DB: SELECT schedules WHERE available
    DB-->>A: Liste des créneaux
    A-->>W: Créneaux disponibles
    W-->>M: Affiche le calendrier

    M->>W: Sélectionne un créneau
    W->>A: POST /api/bookings
    A->>DB: CHECK disponibilité (SELECT COUNT)
    DB-->>A: Disponible
    A->>DB: INSERT booking
    A->>S: Crée PaymentIntent
    S-->>A: client_secret
    A-->>W: client_secret + bookingId
    W-->>M: Page de paiement Stripe
    M->>S: Confirme le paiement
    S-->>A: Webhook payment.succeeded
    A->>DB: UPDATE booking status = confirmed
    A-->>M: Email de confirmation`,

    erd: `erDiagram
    users {
      uuid id PK
      varchar email UK
      varchar name
      varchar role
      timestamptz created_at
      timestamptz deleted_at
    }

    schedules {
      uuid id PK
      uuid coach_id FK
      varchar title
      timestamptz starts_at
      timestamptz ends_at
      int capacity
    }

    bookings {
      uuid id PK
      uuid member_id FK
      uuid schedule_id FK
      varchar status
      timestamptz cancelled_at
      timestamptz created_at
    }

    subscriptions {
      uuid id PK
      uuid member_id FK
      varchar stripe_subscription_id UK
      varchar plan
      varchar status
      timestamptz current_period_end
    }

    users ||--o{ schedules : "coach_id"
    users ||--o{ bookings : "member_id"
    schedules ||--o{ bookings : "schedule_id"
    users ||--o| subscriptions : "member_id"`,
  },

  backlog: {
    epics: [
      { id: "EP-01", name: "Authentification & Profils", description: "Inscription, connexion, gestion des rôles et profils utilisateurs.", priority: "critical" },
      { id: "EP-02", name: "Calendrier & Créneaux", description: "Consultation et gestion des créneaux de cours.", priority: "critical" },
      { id: "EP-03", name: "Réservations", description: "Flux complet de réservation et d'annulation.", priority: "critical" },
      { id: "EP-04", name: "Abonnements & Paiements", description: "Intégration Stripe, gestion des abonnements.", priority: "high" },
      { id: "EP-05", name: "Notifications", description: "Emails et SMS transactionnels.", priority: "medium" },
    ],
    stories: [
      {
        id: "US-001", epicId: "EP-01", title: "Inscription membre",
        asA: "visiteur", iWant: "créer un compte membre avec mon email", soThat: "j'accède à la plateforme de réservation",
        priority: "critical", storyPoints: 3,
        acceptanceCriteria: ["Le formulaire valide l'email et le mot de passe (min 8 caractères)", "Un email de confirmation est envoyé après inscription", "L'utilisateur est redirigé vers le dashboard après validation"],
        technicalNotes: "Utiliser NextAuth Credentials + bcrypt. Table users avec role = 'member'.",
        dependencies: [],
      },
      {
        id: "US-002", epicId: "EP-01", title: "Connexion utilisateur",
        asA: "membre enregistré", iWant: "me connecter avec mon email et mot de passe", soThat: "j'accède à mon espace personnel",
        priority: "critical", storyPoints: 2,
        acceptanceCriteria: ["L'erreur 'identifiants incorrects' est affichée sans préciser lequel est faux", "La session dure 24h avec renouvellement automatique", "Redirection vers la page demandée après connexion"],
        technicalNotes: "NextAuth v5 JWT strategy. Vérification bcrypt du hash.",
        dependencies: ["US-001"],
      },
      {
        id: "US-003", epicId: "EP-02", title: "Consultation du calendrier",
        asA: "membre connecté", iWant: "voir les créneaux disponibles cette semaine", soThat: "je peux choisir un cours qui me convient",
        priority: "critical", storyPoints: 5,
        acceptanceCriteria: ["Le calendrier affiche les 7 prochains jours par défaut", "Chaque créneau affiche le titre, le coach, l'horaire et les places restantes", "Les créneaux complets sont affichés mais non réservables"],
        technicalNotes: "GET /api/schedules avec filtres date. Index sur starts_at.",
        dependencies: ["US-002"],
      },
      {
        id: "US-004", epicId: "EP-03", title: "Réservation d'un cours",
        asA: "membre connecté", iWant: "réserver un créneau disponible", soThat: "ma place soit garantie pour ce cours",
        priority: "critical", storyPoints: 8,
        acceptanceCriteria: ["La réservation est impossible si le créneau est complet", "Un membre ne peut pas réserver deux cours au même horaire", "Une confirmation par email est envoyée immédiatement après la réservation"],
        technicalNotes: "Transaction PostgreSQL pour éviter les race conditions. Index unique (member_id, schedule_id).",
        dependencies: ["US-003"],
      },
      {
        id: "US-005", epicId: "EP-03", title: "Annulation de réservation",
        asA: "membre avec une réservation", iWant: "annuler ma réservation", soThat: "je libère ma place et récupère mon crédit",
        priority: "high", storyPoints: 5,
        acceptanceCriteria: ["L'annulation est possible jusqu'à 24h avant le cours", "Un message d'erreur clair est affiché si le délai est dépassé", "L'email de confirmation d'annulation est envoyé dans les 5 minutes"],
        technicalNotes: "Vérifier starts_at - NOW() > 24h. UPDATE booking status = cancelled.",
        dependencies: ["US-004"],
      },
      {
        id: "US-006", epicId: "EP-04", title: "Souscription à un abonnement",
        asA: "membre connecté", iWant: "souscrire à un abonnement mensuel ou annuel", soThat: "j'accède à un nombre de cours défini chaque mois",
        priority: "high", storyPoints: 13,
        acceptanceCriteria: ["Les deux plans (mensuel 8 cours / annuel 96 cours) sont clairement présentés", "Le paiement est traité via Stripe Checkout", "L'abonnement est actif immédiatement après le paiement"],
        technicalNotes: "Stripe Checkout Session + webhook checkout.session.completed. Mettre à jour subscriptions table.",
        dependencies: ["US-002"],
      },
      {
        id: "US-007", epicId: "EP-02", title: "Gestion des créneaux (coach)",
        asA: "coach connecté", iWant: "créer et modifier mes créneaux de cours", soThat: "les membres peuvent réserver mes cours",
        priority: "high", storyPoints: 8,
        acceptanceCriteria: ["Un coach ne peut créer des créneaux qu'au minimum 7 jours à l'avance", "La capacité maximum est configurable par créneau", "Un créneau avec des réservations existantes ne peut pas être supprimé"],
        technicalNotes: "RBAC : vérifier role = coach. POST/PUT/DELETE /api/schedules.",
        dependencies: ["US-002"],
      },
      {
        id: "US-008", epicId: "EP-05", title: "Rappel de cours",
        asA: "membre avec une réservation", iWant: "recevoir un rappel 24h avant mon cours", soThat: "je n'oublie pas ma séance",
        priority: "medium", storyPoints: 5,
        acceptanceCriteria: ["Le rappel est envoyé par email ET SMS 24h avant le cours", "Le rappel contient le titre du cours, l'horaire et le nom du coach", "Le rappel n'est pas envoyé si la réservation a été annulée"],
        technicalNotes: "Job CRON Vercel toutes les heures. Resend pour email, Twilio pour SMS.",
        dependencies: ["US-004"],
      },
    ],
    totalStoryPoints: 49,
    estimatedSprintsCount: 3,
    mvpStories: ["US-001", "US-002", "US-003", "US-004", "US-005"],
  },
}

// ── Mock pipeline simulation ─────────────────────────────────────────────────
export type ArtifactType = keyof typeof MOCK_ARTIFACTS

export const PIPELINE_STEPS: ArtifactType[] = [
  'business_analysis',
  'architecture',
  'database_schema',
  'diagrams',
  'backlog',
]

export const STEP_LABELS: Record<ArtifactType, string> = {
  business_analysis: 'Analyse métier',
  architecture:      'Architecture',
  database_schema:   'Schéma de base de données',
  diagrams:          'Diagrammes Mermaid',
  backlog:           'Backlog de développement',
}
