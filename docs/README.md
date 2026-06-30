# AI Software Architect

> Transform a business description into a complete software architecture in under 5 minutes.

## What is this?

AI Software Architect is an AI-powered platform that generates structured technical architecture artifacts from a plain text description — **before a single line of code is written**.

This is not a code generator. It generates the **decisions** that guide the code.

## The problem it solves

Every code generation tool (v0, Bolt, Lovable, Devin) skips the most critical phase of software development: **architecture**. They jump straight to implementation, making implicit decisions with no visibility or control.

AI Software Architect fills this gap. It sits **upstream** of all code generation tools and produces the artifacts that teams need before development starts.

## What gets generated

From a single business description, the platform produces five interconnected artifacts:

| Artifact | Description |
|---|---|
| **Business Analysis** | Actors, features, business rules, constraints, assumptions |
| **Architecture** | Stack, modules, patterns, justifications, risks |
| **Database Schema** | Tables, columns, relations, indexes |
| **Mermaid Diagrams** | C4 container, sequence diagram, ERD |
| **Development Backlog** | Epics, user stories, story points, acceptance criteria |

All artifacts are **coherence-validated** against each other before delivery.

## Who is it for?

| Persona | Primary need |
|---|---|
| **Startup Founder** | Turn an idea into a credible architecture to raise funding |
| **Freelance Developer** | Speed up analysis phases to bill more development time |
| **Solution Architect** | Automate documentation to focus on critical decisions |
| **CTO** | Standardize technical decisions and prevent recurring mistakes |

## Why now?

Three conditions converged in 2024-2025 to make this project both possible and relevant:

1. **LLM reasoning maturity** — Models like Claude 3.5/3.7 and GPT-4o can produce coherent architectural reasoning, justify technical choices, and maintain consistency across multiple interdependent artifacts.

2. **The vibe coding explosion** — v0, Bolt, Lovable and Devin created a mass market for AI in development — and all ignored the architecture phase. The gap is visible and no player addresses it directly.

3. **Artifact format standardization** — Mermaid is the de facto standard for diagrams in Git repos. Markdown, JSON, and OpenAPI are universally accepted. It is now possible to produce directly usable artifacts without integration friction.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.9 (App Router, Turbopack) |
| Language | TypeScript 5.x |
| UI | React 19 + Tailwind CSS 4 + shadcn/ui |
| Database | Neon PostgreSQL (serverless) |
| ORM | Drizzle ORM |
| Auth | NextAuth.js v5 |
| Cache / Rate limiting | Upstash Redis |
| LLM — MVP | Google Gemini 3.5 Flash (free tier) |
| LLM — V1 | Claude Sonnet 4.6 (Anthropic) |
| Deployment | Vercel |

## Live demo

[ai-software-architect-zeta.vercel.app](https://ai-software-architect-zeta.vercel.app)

## Repository

[github.com/nareph/ai-software-architect](https://github.com/nareph/ai-software-architect)
