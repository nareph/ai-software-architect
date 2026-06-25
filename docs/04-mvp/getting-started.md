# AI Software Architect - Getting Started

## Prérequis

| Outil | Version minimale | Vérification |
|---|---|---|
| Node.js | 20.9.0 | `node --version` |
| pnpm | 9.x | `pnpm --version` |
| Git | 2.x | `git --version` |

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

## Étape 3 — Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Ouvre `.env.local` et renseigne chaque variable :

### NEXTAUTH_SECRET
```bash
# Générer un secret fort
openssl rand -base64 32
```
Colle le résultat dans `NEXTAUTH_SECRET`.

### DATABASE_URL — Neon PostgreSQL

1. Crée un compte sur [neon.tech](https://neon.tech)
2. Crée un nouveau projet → copie la **Connection string**
3. Colle-la dans `DATABASE_URL`

Format attendu :
```
postgresql://user:password@ep-xxx.eu-west-2.aws.neon.tech/dbname?sslmode=require
```

### GEMINI_API_KEY — Google AI Studio (free tier)

1. Va sur [aistudio.google.com](https://aistudio.google.com)
2. Clique sur **Get API Key** → **Create API key**
3. Colle la clé dans `GEMINI_API_KEY`

> Le free tier est suffisant pour le MVP bêta (≤ 10 utilisateurs, ≤ 5 projets).

### DEEPSEEK_API_KEY — DeepSeek Platform (fallback)

1. Crée un compte sur [platform.deepseek.com](https://platform.deepseek.com)
2. Va dans **API Keys** → **Create new key**
3. Colle la clé dans `DEEPSEEK_API_KEY`

> Coût quasi-nul avec le KV cache actif (~$0.007/génération).

### UPSTASH_REDIS — Rate limiting & cache

1. Crée un compte sur [upstash.com](https://upstash.com)
2. Crée une base Redis → région **EU-West-1** (ou la plus proche)
3. Copie **REST URL** et **REST Token**

---

## Étape 4 — Initialiser la base de données

```bash
# Générer les migrations depuis le schéma Drizzle
pnpm db:generate

# Appliquer les migrations sur Neon
pnpm db:migrate
```

Vérifie que les tables ont été créées :
```bash
# Ouvre Drizzle Studio (interface visuelle)
pnpm db:studio
```

---

## Étape 5 — Lancer le serveur de développement

```bash
pnpm dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

Turbopack est activé par défaut (Next.js 16) — le démarrage initial prend ~2 secondes.

---

## Étape 6 — Créer un compte et tester

1. Va sur [http://localhost:3000/register](http://localhost:3000/register)
2. Crée un compte avec ton email
3. Connecte-toi sur [http://localhost:3000/signin](http://localhost:3000/signin)
4. Clique sur **Nouveau projet**
5. Saisis une description de projet (minimum 50 mots)
6. Clique sur **Générer mon architecture**

---

## Structure des scripts disponibles

| Script | Description |
|---|---|
| `pnpm dev` | Serveur de développement (Turbopack) |
| `pnpm build` | Build de production |
| `pnpm start` | Serveur de production |
| `pnpm lint` | Linting ESLint |
| `pnpm type-check` | Vérification TypeScript sans compilation |
| `pnpm db:generate` | Générer les migrations depuis le schéma |
| `pnpm db:migrate` | Appliquer les migrations |
| `pnpm db:studio` | Ouvrir Drizzle Studio |
| `pnpm db:push` | Push direct du schéma (dev uniquement) |

---

## Déploiement sur Vercel

### 1. Connecter le repo

1. Va sur [vercel.com](https://vercel.com)
2. **New Project** → importe le repo GitHub
3. Framework détecté automatiquement : **Next.js**

### 2. Configurer les variables d'environnement

Dans Vercel → Settings → Environment Variables, ajoute toutes les variables de `.env.local` :

```
NEXTAUTH_URL          → https://ai-software-architect.vercel.app
NEXTAUTH_SECRET       → (même valeur que local)
DATABASE_URL          → (même valeur que local)
GEMINI_API_KEY        → (même valeur que local)
DEEPSEEK_API_KEY      → (même valeur que local)
UPSTASH_REDIS_REST_URL   → (même valeur que local)
UPSTASH_REDIS_REST_TOKEN → (même valeur que local)
```

### 3. Déployer

```bash
# Via Vercel CLI (optionnel)
pnpm dlx vercel --prod

# Ou simplement push sur main → déploiement automatique
git push origin main
```

### 4. Appliquer les migrations en production

Après le premier déploiement, applique les migrations sur la base Neon de production :

```bash
DATABASE_URL=<prod-url> pnpm db:migrate
```

---

## Résolution des problèmes courants

### `Error: DATABASE_URL is not defined`
→ Vérifie que `.env.local` existe et contient `DATABASE_URL`.
→ Redémarre le serveur après modification du `.env.local`.

### `Error: Invalid Gemini API key`
→ Vérifie que la clé commence par `AI...` et a été copiée sans espaces.
→ Vérifie que l'API Gemini est activée dans Google AI Studio.

### `Turbopack: Module not found`
→ Supprime `.next/` et relance `pnpm dev`.

### `drizzle-kit: No migrations found`
→ Lance `pnpm db:generate` avant `pnpm db:migrate`.

### `NextAuth: NEXTAUTH_URL mismatch`
→ En développement : `NEXTAUTH_URL=http://localhost:3000`
→ En production : `NEXTAUTH_URL=https://ton-domaine.vercel.app`
