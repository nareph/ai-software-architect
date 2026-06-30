# Use Cases

## Context

These use cases describe typical scenarios where AI Software Architect is used. Each case follows the same flow: user input → analysis → artifact generation.

---

## Case 1: Booking SaaS (e.g. gym, co-working)

**Description:** An entrepreneur wants to create a booking platform for gyms. Users can view available slots, book a class, pay online, and cancel.

**Specifics:**
- Multi-role: administrator, coach, member
- Subscription management (monthly, annual)
- Online payment (Stripe)
- Notifications (email, SMS)
- Available on mobile and desktop

**Expected artifacts:**
- Business analysis: actors, features, business rules
- Architecture: REST API, PostgreSQL DB, Redis for sessions, notification microservice
- DB schema: `users`, `roles`, `subscriptions`, `bookings`, `schedules`, `payments` tables
- Diagrams: C4 level 2 (containers)
- Backlog: 10 user stories

---

## Case 2: E-commerce (physical products)

**Description:** A retail business wants to move its activity online. Selling clothes, inventory management, shipping, and returns.

**Expected artifacts:**
- Business analysis: order flow, inventory management, returns
- Architecture: Modular monolith (or microservices by volume), GraphQL API, Elasticsearch for search
- DB schema: `products`, `categories`, `orders`, `order_items`, `inventory`, `returns` tables
- Diagrams: Sequence diagram for the order process
- Backlog: 15 user stories (including inventory and returns management)

---

## Case 3: Marketplace (multi-vendor)

**Description:** A platform connecting sellers and buyers (e.g. Etsy, Airbnb). Each seller manages their own catalog and orders.

**Expected artifacts:**
- Business analysis: sale lifecycle, commission, evaluations
- Architecture: Microservices (vendors, orders, payments, reviews), Event-driven (Kafka)
- DB schema: `vendors`, `products`, `orders`, `commissions`, `reviews`, `disputes` tables
- Diagrams: Deployment diagram (Kubernetes, services)
- Backlog: 20 user stories (including dispute management)

---

## Case 4: Mobile application (fitness / health)

**Description:** A mobile fitness tracking application. Users log their sessions, set goals, receive recommendations, and share their progress.

**Expected artifacts:**
- Business analysis: mobile features, sensor data, synchronization
- Architecture: REST API backend, WebSockets for live, local cache (SQLite)
- DB schema: `users`, `workouts`, `goals`, `achievements`, `social_posts` tables
- Diagrams: Sequence diagram for offline synchronization
- Backlog: 12 user stories (including offline management)

---

## Case 5: Public API (B2B SaaS)

**Description:** A company develops a public API allowing partners to integrate its services (e.g. payment, geolocation, AI).

**Expected artifacts:**
- Business analysis: API use cases, call volumes, SLA
- Architecture: API Gateway, microservices, Redis for cache and rate limiting
- DB schema: `clients`, `api_keys`, `usage_logs`, `subscriptions` tables
- Diagrams: OAuth2 authentication sequence diagram
- Backlog: 10 user stories (including usage billing)

---

## Case 6: Legacy system migration (monolith → microservices)

**Description:** A 150-employee SME has been running on a PHP/MySQL monolith for 8 years managing billing, customer management, and order tracking. The codebase has become difficult to maintain. The technical team wants to progressively migrate to a microservices architecture without interrupting operations.

**Specifics:**
- Production system with thousands of active users — zero downtime acceptable
- Progressive migration (strangler fig pattern)
- Three priority domains: Billing, CRM, Order Management
- Temporary interoperability between old and new systems
- Team of 8 developers with limited distributed architecture experience
- Limited infrastructure budget: migration to AWS with cost optimization

**Expected artifacts:**
- Business analysis: existing domain mapping, module dependencies, migration risks
- Architecture: 3-phase migration plan (strangler fig), target microservices architecture
- DB schema: target data model per service, database separation strategy
- Diagrams: AS-IS architecture (current monolith), TO-BE architecture (target microservices)
- Backlog: 25 user stories organized in 3 migration phases
- Risk plan: potential breaking points and rollback strategies
