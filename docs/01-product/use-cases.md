# AI Software Architect - Use Cases

## Contexte

Ces cas d'utilisation décrivent des scénarios typiques où AI Software Architect est utilisé. Chaque cas suit le même flux : saisie utilisateur → analyse → génération des artefacts.

---

## Cas 1 : SaaS de réservation (ex: salle de sport, co-working)

**Description :** Un entrepreneur veut créer une plateforme de réservation pour des salles de sport. Les utilisateurs peuvent consulter les créneaux disponibles, réserver un cours, payer en ligne et annuler.

**Spécificités :**
- Multi-rôles : administrateur, coach, membre
- Gestion des abonnements (mensuel, annuel)
- Paiement en ligne (Stripe)
- Notifications (email, SMS)
- Disponible en mobile et desktop

**Artefacts attendus :**
- Analyse métier : acteurs, fonctionnalités, règles de gestion
- Architecture : API REST, BDD PostgreSQL, Redis pour les sessions, microservice notifications
- Schéma DB : tables `users`, `roles`, `subscriptions`, `bookings`, `schedules`, `payments`
- Diagrammes : C4 niveau 2 (conteneurs)
- Backlog : 10 user stories (ex: "En tant que membre, je veux voir les créneaux disponibles")

---

## Cas 2 : E-commerce (vente de produits physiques)

**Description :** Un commerce de détail veut migrer son activité en ligne. Vente de vêtements, gestion de stock, expédition et retours.

**Spécificités :**
- Catalogue de produits (catégories, attributs, images)
- Panier d'achat (persistant)
- Processus de commande (paiement, confirmation, expédition, suivi)
- Gestion des retours et remboursements
- Intégration avec ERP existant

**Artefacts attendus :**
- Analyse métier : flux de commande, gestion de stock, retours
- Architecture : Monolithe modulaire (ou microservices selon volume), API GraphQL, Elasticsearch pour la recherche
- Schéma DB : tables `products`, `categories`, `orders`, `order_items`, `inventory`, `returns`
- Diagrammes : Diagramme de séquence pour le processus de commande
- Backlog : 15 user stories (incluant gestion stock et retours)

---

## Cas 3 : Marketplace (multi-vendeurs)

**Description :** Une plateforme mettant en relation des vendeurs et des acheteurs (ex: Etsy, Airbnb). Chaque vendeur gère son propre catalogue et ses commandes.

**Spécificités :**
- Multi-vendeurs avec des dashboards séparés
- Commission sur chaque vente
- Système d'évaluation (vendeur, produit)
- Gestion des litiges
- Paiement différé (escrow)

**Artefacts attendus :**
- Analyse métier : cycle de vie d'une vente, commission, évaluations
- Architecture : Microservices (vendeurs, commandes, paiements, évaluations), Event-driven (Kafka)
- Schéma DB : tables `vendors`, `products`, `orders`, `commissions`, `reviews`, `disputes`
- Diagrammes : Diagramme de déploiement (Kubernetes, services)
- Backlog : 20 user stories (incluant la gestion des litiges)

---

## Cas 4 : Application mobile (fitness / santé)

**Description :** Une application mobile de suivi d'activité physique. Les utilisateurs enregistrent leurs séances, fixent des objectifs, reçoivent des recommandations et partagent leurs progrès.

**Spécificités :**
- Mobile-first (iOS + Android)
- Mode hors-ligne (synchronisation différée)
- Capteurs (accéléromètre, GPS)
- Recommandations personnalisées (IA)
- Partage social

**Artefacts attendus :**
- Analyse métier : fonctionnalités mobiles, données capteurs, synchronisation
- Architecture : Backend API REST, WebSockets pour le live, cache local (SQLite)
- Schéma DB : tables `users`, `workouts`, `goals`, `achievements`, `social_posts`
- Diagrammes : Diagramme de séquence pour la synchronisation hors-ligne
- Backlog : 12 user stories (incluant la gestion du hors-ligne)

---

## Cas 5 : API publique (SaaS B2B)

**Description :** Une entreprise développe une API publique permettant à des partenaires d'intégrer ses services (ex: paiement, géolocalisation, IA).

**Spécificités :**
- Documentation OpenAPI
- Rate limiting, quotas
- Authentification OAuth2 / API Keys
- Analytics d'usage
- Plans tarifaires (freemium, enterprise)

**Artefacts attendus :**
- Analyse métier : cas d'usage API, volumes d'appels, SLA
- Architecture : API Gateway, microservices, Redis pour cache et rate limiting
- Schéma DB : tables `clients`, `api_keys`, `usage_logs`, `subscriptions`
- Diagrammes : Diagramme de séquence d'authentification OAuth2
- Backlog : 10 user stories (incluant la facturation à l'usage)

---

## Cas 6 : Migration d'un système legacy (monolithe → microservices)

**Description :** Une PME de 150 employés opère depuis 8 ans sur un monolithe PHP/MySQL gérant la facturation, la gestion des clients et le suivi des commandes. La base de code est devenue difficile à maintenir, les déploiements prennent plusieurs heures et chaque modification risque de casser une autre partie du système. La direction technique souhaite migrer progressivement vers une architecture microservices sans interrompre l'activité.

**Spécificités :**
- Système en production avec des milliers d'utilisateurs actifs — zéro interruption acceptable
- Migration progressive (strangler fig pattern) : les modules sont migrés un à un
- Trois domaines à découpler en priorité : Facturation, CRM, Gestion des commandes
- Interopérabilité temporaire entre l'ancien système et les nouveaux services pendant la transition
- Équipe de 8 développeurs avec une expérience limitée en architecture distribuée
- Budget infrastructure limité : migration vers AWS avec optimisation des coûts

**Contraintes techniques :**
- L'ancien système doit continuer à fonctionner pendant toute la durée de la migration
- Les données doivent être synchronisées entre le monolithe et les nouveaux services
- Aucune perte de données tolérée (audit trail complet requis)

**Artefacts attendus :**
- Analyse métier : cartographie des domaines existants, dépendances entre modules, risques de migration
- Architecture : Plan de migration en 3 phases (strangler fig), architecture cible microservices, stratégie de coexistence monolithe/microservices
- Schéma DB : Modèle de données cible par service, stratégie de séparation des bases de données, plan de migration des données
- Diagrammes : Architecture AS-IS (monolithe actuel), architecture TO-BE (microservices cible), diagramme de séquence pour la coexistence temporaire
- Backlog : 25 user stories organisées en 3 phases de migration, avec critères d'acceptance et points de non-régression
- Plan de risques : Identification des points de rupture potentiels et stratégies de rollback

**Pourquoi ce cas est important pour AI Software Architect :**

Ce cas illustre la capacité de la plateforme à gérer des contextes complexes au-delà du green field. Les Solution Architects et CTOs en entreprise font face à ce type de projet bien plus souvent qu'à des créations from scratch. Il démontre que AI Software Architect n'est pas seulement un outil pour startups, mais un assistant d'architecture pour des décisions techniques à fort enjeu.
