# Implementation Plan: Plataforma de Inversiones con IA (DR.FIC)

**Branch**: [001-plataforma-inversiones-ia] | **Date**: 2026-05-02 | **Spec**: specs/001-plataforma-inversiones-ia/spec.md
**Input**: Feature specification from specs/001-plataforma-inversiones-ia/spec.md

**Note**: This plan is based on the DR.FIC feature specification and the project constitution. The repository is currently on branch `LARIOS3.1.4`, while the feature directory is configured in `.specify/feature.json`.

## Summary

Build a modular PWA and backend REST API for a professional investment platform that delivers explainable BUY / SELL / HOLD signals for US equities and options.
The implementation aligns with constitutional rules by using React + TypeScript for the frontend, Node.js + Express for the API, Supabase as primary storage, MongoDB as optional historical logging, JWT-based auth, and manual order approval with AI advisory verification.

## Technical Context

**Language/Version**: TypeScript / Node.js 20+ / React 18
**Primary Dependencies**: React 18, Vite, Zustand, Tailwind CSS, Express, Supabase SDK, MongoDB driver, Claude API client, IBKR/Alpaca SDKs or adapter layer
**Storage**: Supabase as primary relational store; MongoDB optional for signal history, AI reasoning, and logs
**Testing**: Jest / Vitest for unit tests, Supertest for backend contract tests, end-to-end smoke tests for critical approval flow
**Target Platform**: Web PWA frontend + Linux-hosted backend service
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Backend availability >= 99.5% monthly, request latency target < 250ms p95 for core API calls
**Constraints**: No auto-trading in v1.0, AI advisory only, explicit human approval required for every order, credentials must live in `.env`, explainability and traceability required
**Scale/Scope**: Professional investment platform for early production adoption, multi-broker architecture, support for US equity and options workflows

## Constitution Check

- Must use React + TypeScript for the PWA: PASS
- Must use Node.js + Express for REST API: PASS
- Must keep AI as confirmador only and not executor: PASS
- Must require explicit user approval before broker order submission: PASS
- Must maintain credential secrecy via `.env`: PASS
- Must produce explainable, traceable signals: PASS
- Must exclude auto-trading in v1.0: PASS
- Must retain operational evidence and audit logs for at least 365 days: PASS

## Acceptance Criteria Traceability

| Spec Requirement | Plan Artifact | Notes |
|---|---|---|
| FR-006 | Auth Context section / contracts/auth-context.md | JWT bearer auth and error codes are explicitly defined |
| FR-007 | Backend responsibilities / contracts/broker-adapter.md | Broker adapter abstraction and failure handling are documented |
| FR-008 | Signal lifecycle and data model sections | Explainable signal persistence and metadata fields are captured |
| FR-009 | Order approval flow and recovery notes | Manual approval plus failed broker retry policy are described |
| FR-013 | Order service and concurrency notes | Optimistic concurrency and `409 ORDER_VERSION_STALE` behavior are captured |
| SC-006 | Rate limiting and observability sections | SLO, metrics, logs, and traceability requirements are included |
| PL-001..PL-012 | Full plan and contracts sections | All implementation phases and artifact mappings are traceable |

## Project Structure

### Documentation (this feature)

```text
specs/001-plataforma-inversiones-ia/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── auth-context.md
│   ├── broker-adapter.md
│   └── signal-lifecycle.md
├── spec.md
└── checklists/
    └── feature-validation.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── adapters/
│   ├── models/
│   └── routes/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── stores/
│   ├── services/
│   └── hooks/
└── tests/
```

**Structure Decision**: Select a web application layout with separate `frontend/` and `backend/` projects. This reflects the feature's PWA + REST API architecture and keeps UI, API, and broker integration responsibilities clearly separated.

## Complexity Tracking

No constitutional violations were identified. The selected architecture is aligned with the constitution and avoids added complexity by preserving the mandated frontend/backend separation and by treating MongoDB as optional for non-critical historical data.

## Branch / Feature Config Note

- Current repo branch: `LARIOS3.1.4`
- Configured feature directory in `.specify/feature.json`: `specs/001-plataforma-inversiones-ia`
- To run speckit commands from this branch, use an explicit feature directory override or switch to the feature branch `001-plataforma-inversiones-ia`.
