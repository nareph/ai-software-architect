# AI Software Architect - Getting Started

## ⚠️ Local development limitation

Direct connections from Node.js to Neon PostgreSQL may fail locally on certain networks due to ISP-level filtering of AWS IP ranges (eu-central-1). This affects `drizzle-kit` CLI commands and runtime DB queries in development.

**This is a known network constraint — not a bug in the code.**

**Recommended workflow:**
```
Code locally → git push → Vercel auto-deploys → test on preview URL
```

For database schema changes:
1. `pnpm db:generate` locally (no network needed — computes local SQL diff only)
2. Either paste the generated SQL from `drizzle/migrations/` into the [Neon SQL Editor](https://console.neon.tech), or run `pnpm db:push` from an environment with unrestricted network access (e.g. a VPS or GitHub Codespaces)

---

## Prerequisites

| Tool | Version | Check |
|---|---|---|
| Node.js | ≥ 20.9.0 | `node --version` |
| pnpm | 9.x | `pnpm --version` |
| Git | 2.x | `git --version` |
| Vercel account | - | [vercel.com](https://vercel.com) |

---

## Étape 1 — Cloner le repo

```bash
git clone https://github.com/nareph/ai-software-architect.git
cd ai-software-architect
```

---

## Étape 2 — Installer les dépendances

```bash
pnpm install
```

---

## Étape 3 — Configurer les variables d'environnement locales

```bash
cp .env.example .env.local
```

Ouvre `.env.local` et renseigne chaque variable :

### NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```
Colle le résultat dans `NEXTAUTH_SECRET`.

### NEXTAUTH_URL
```
http://localhost:3000
```
En production sur Vercel, cette variable sera remplacée par `https://ton-app.vercel.app`.

### DATABASE_URL — Neon PostgreSQL

1. Crée un compte sur [neon.tech](https://neon.tech)
2. Crée un nouveau projet (région : `eu-central-1` recommandé)
3. Dans **Connection Details**, copie la **Connection string** (format pooled)
4. Colle-la dans `DATABASE_URL`

Format attendu :
```
postgresql://user:password@ep-xxx-pooler.c-4.eu-central-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

### GEMINI_API_KEY — Google AI Studio (free tier)

1. Va sur [aistudio.google.com](https://aistudio.google.com)
2. Clique sur **Get API Key** → **Create API key**
3. Colle la clé dans `GEMINI_API_KEY`

> Le free tier est suffisant pour le MVP bêta (≤ 10 utilisateurs, ≤ 5 projets) — coût : $0.

### DEEPSEEK_API_KEY — DeepSeek Platform (fallback)

1. Crée un compte sur [platform.deepseek.com](https://platform.deepseek.com)
2. Va dans **API Keys** → **Create new key**
3. Colle la clé dans `DEEPSEEK_API_KEY`

### UPSTASH_REDIS — Rate limiting & cache

1. Crée un compte sur [upstash.com](https://upstash.com)
2. Crée une base Redis → région **EU-West-1**
3. Copie **REST URL** et **REST Token**

---

## Étape 4 — Initialiser la base de données

> ⚠️ Si ton réseau bloque les connexions Node.js vers les IPs AWS, utilise le SQL Editor de Neon directement.

**Option A — Via drizzle-kit (réseau non restreint)**
```bash
pnpm db:generate
pnpm db:push
```

**Option B — Via Neon SQL Editor (toujours disponible)**
```bash
# Génère le SQL localement
pnpm db:generate

# Copie le contenu du fichier généré
cat drizzle/migrations/0000_*.sql
```
Colle le SQL dans [console.neon.tech](https://console.neon.tech) → ton projet → **SQL Editor** → **Run**.

---

## Étape 5 — Lancer le serveur de développement

```bash
pnpm dev
```

App disponible sur [http://localhost:3000](http://localhost:3000).

> Note : en développement local, les pages UI s'affichent correctement mais les appels API qui touchent la base de données échoueront si ton réseau bloque les IPs AWS. Teste les fonctionnalités complètes via Vercel.

---

## Étape 6 — Déployer sur Vercel

### Lier le projet (première fois uniquement)
```bash
pnpm vercel link
```

### Ajouter les variables d'environnement
```bash
pnpm vercel env add NEXTAUTH_URL        # https://ton-app.vercel.app
pnpm vercel env add NEXTAUTH_SECRET
pnpm vercel env add DATABASE_URL
pnpm vercel env add GEMINI_API_KEY
pnpm vercel env add DEEPSEEK_API_KEY
pnpm vercel env add UPSTASH_REDIS_REST_URL
pnpm vercel env add UPSTASH_REDIS_REST_TOKEN
```

Pour chaque variable, sélectionne les 3 environnements : **Production, Preview, Development**.

### Déployer
```bash
# Preview deployment (URL unique pour tester)
pnpm vercel deploy

# Production deployment
pnpm vercel deploy --prod
```

Chaque `git push` sur `main` déclenche automatiquement un déploiement Vercel.

---

## Workflow de développement recommandé

```bash
# 1. Coder en local
pnpm dev  # UI only

# 2. Vérifier TypeScript
pnpm type-check

# 3. Pousser et tester sur Vercel
git add .
git commit -m "feat: ..."
git push origin main
# → Vercel déploie automatiquement
# → Tester sur https://ton-app.vercel.app
```

---

## Scripts disponibles

| Script | Réseau requis | Description |
|---|---|---|
| `pnpm dev` | Non (UI only) | Serveur de développement (Turbopack) |
| `pnpm build` | Non | Build de production |
| `pnpm type-check` | Non | Vérification TypeScript |
| `pnpm db:generate` | Non | Générer les migrations Drizzle |
| `pnpm db:push` | Oui (Neon) | Appliquer le schéma sur Neon |
| `pnpm db:studio` | Oui (Neon) | Ouvrir Drizzle Studio |
| `pnpm vercel deploy` | Oui (Vercel) | Déployer sur Vercel |

---

## Résolution des problèmes courants

### `Error: fetch failed` sur les appels DB en local
→ Problème réseau ISP — normal dans certaines régions. Utilise Vercel pour tester.

### `NEXTAUTH_URL mismatch`
→ En développement : `NEXTAUTH_URL=http://localhost:3000`
→ En production Vercel : `NEXTAUTH_URL=https://ton-app.vercel.app`

### `drizzle-kit push` silencieux (pas de message de succès)
→ Peut indiquer un blocage réseau. Vérifie les tables sur [console.neon.tech](https://console.neon.tech).

### `pnpm type-check` échoue sur `Response.json`
→ Ajoute `"ES2023"` dans `lib` du `tsconfig.json`.

### Deux instances de `drizzle-orm` dans `node_modules/.pnpm`
→ Ajoute `"pnpm": { "overrides": { "drizzle-orm": "0.45.2" } }` dans `package.json` puis `pnpm install`.
