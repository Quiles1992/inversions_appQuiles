# Quickstart

## Purpose

This quickstart describes the high-level developer workflow for the Plataforma de Inversiones con IA feature.

## Prerequisites

- Node.js 20+ installed
- npm or pnpm available
- Git repository cloned
- `.env` configured with credentials for:
  - Supabase
  - MongoDB (optional)
  - IBKR / Alpaca
  - Claude API
  - JWT signing secret

## Recommended Workspace Structure

```text
frontend/
backend/
specs/001-plataforma-inversiones-ia/
```

## Feature Development Workflow

1. Review `specs/001-plataforma-inversiones-ia/spec.md` for the full feature definition.
2. Review `specs/001-plataforma-inversiones-ia/plan.md` for the implementation plan.
3. Review `specs/001-plataforma-inversiones-ia/research.md` for design rationale.
4. Review `specs/001-plataforma-inversiones-ia/data-model.md` for the entity schema.
5. Review `specs/001-plataforma-inversiones-ia/contracts/backend-rest-api.md` for API contracts.

## Local Startup

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Workflow Commands

- Use `/speckit.plan` to generate or update planning artifacts.
- Use `/speckit.tasks` after plan completion to generate task lists.
- Keep all feature work aligned with `specs/001-plataforma-inversiones-ia/spec.md` and the constitution.

## Developer Notes

- All broker actions require manual approval in v1.0.
- The backend must reject order submission without an approved status.
- Signals must remain explainable and traceable.
- Credentials must never be committed; use `.env` only.
