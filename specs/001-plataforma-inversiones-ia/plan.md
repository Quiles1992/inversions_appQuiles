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

## Service Level Objectives (SLO) - T017

**T017** defines SLO targets and recovery expectations for the backend platform. All metrics are monitored through the observability infrastructure (T008) and rate limiting middleware (T007).

### Availability SLO (SC-006)

**Target**: >= 99.5% monthly availability

- **Definition**: Percentage of time the backend successfully processes requests within specified latency bounds
- **Measurement**: (Successful requests / Total requests) × 100, measured over 30-day rolling window
- **Tracking**: Recorded in `observability_metrics` table with `metric_name = 'api_availability_percent'`
- **Calculation**: Automated daily via observability service using response status codes (2xx/3xx = success, 5xx = failure)
- **Error Budget**: ~3.6 hours per month of acceptable downtime
- **Triggers**: Alert at 99.0% (approaching SLO), critical at 98.0%

### Latency SLO (SC-006)

**Target**: < 250ms p95 latency for core API operations

Core operations include:
- `POST /signals` - Signal creation
- `POST /orders` - Order creation
- `PUT /orders/:id/approve` - Order approval
- `GET /signals/:id` - Signal retrieval
- `GET /orders/:id` - Order retrieval

**Latency Distribution Goals**:
- p50 (median): < 100ms
- p75: < 150ms
- p95: < 250ms
- p99: < 500ms

**Tracking**: Every API request logs latency in `performance_logs` (MongoDB) or `observability_metrics` (Supabase)

**Degradation**: If p95 > 300ms for more than 5 consecutive minutes, trigger performance investigation

### Broker Integration SLO

**Target**: >= 95% successful broker order submission on first attempt

- **Definition**: Percentage of orders that reach broker without timeout or immediate rejection
- **Measurement**: (Submitted orders / Total approved orders) × 100
- **Retry Policy**: On broker failure (timeout, rejection), order marked as `failed` and requires manual reapproval
- **Tracking**: `broker_events` table captures all interactions with status and retry counts
- **Recovery**: Failed orders can be retried after 5 minutes minimum to avoid cascade failures

### Data Consistency SLO

**Target**: 100% transactional consistency for financial operations

- **Guarantee**: All orders, signals, and account data synchronized between Supabase and MongoDB within 5 seconds
- **Optimistic Concurrency**: Return `409 ORDER_VERSION_STALE` if stale update detected (see FR-013)
- **Audit Trail**: All operations logged in append-only `audit_logs` table with 365-day retention
- **Compensation**: Clients receive explicit error messages to refresh state before retry

### Error Rate SLO

**Target**: < 0.5% error rate (5xx responses)

- **Measurement**: (5xx responses / Total responses) × 100
- **Tracking**: Aggregated hourly in observability dashboard
- **Alerts**: 
  - Warning: > 0.1% error rate for 5 consecutive minutes
  - Critical: > 1.0% error rate

### Rate Limiting SLO (T007)

**Policy**: Token bucket algorithm with per-user limits

**Thresholds**:
- Standard user: 100 requests/minute (1.67 req/sec)
- Rate limit window: 60-second rolling window
- Burst allowance: Up to 150 requests within a 60-second window
- Rejection response: `429 Too Many Requests` with `Retry-After` header
- Logging: Every rejection logged to `rate_limit_events` table for observability

**Recovery**:
- Automatic recovery after window passes
- Client should implement exponential backoff
- No manual intervention required

### Recovery Time Objective (RTO) & Recovery Point Objective (RPO)

**RTO (Time to Recovery)**: 
- Service degradation: < 5 minutes to automated recovery or manual intervention
- Complete outage: < 30 minutes to restore from backup
- Broker connection failure: < 1 minute to failover to backup broker

**RPO (Data Recovery)**:
- Acceptable data loss: 0 (zero) - all transactions persisted before response
- Backup frequency: Daily incremental, weekly full backup
- Retention: 30 days full backups, 90 days incremental backups

### Monitoring & Alerting (T008)

**Observability Dashboards**:
1. **Availability Dashboard**: Real-time availability % with historical trends
2. **Performance Dashboard**: API latency percentiles and error rates
3. **Rate Limiting Dashboard**: Rejection rate and top throttled users
4. **Broker Dashboard**: Order success rate, failure reasons, interaction times
5. **Audit Dashboard**: Operation counts by type, suspicious activity patterns

**Alert Channels**:
- Email: Critical alerts to ops team
- Slack: Performance warnings and rate limit surge notifications
- Logs: All events logged to stdout and `audit_logs` table

**SLO Reporting**:
- Daily: Automated report of SLO metrics vs targets
- Weekly: Incident review and postmortem analysis
- Monthly: SLO achievement certificate and trend analysis

### Performance Tuning Guidelines

**Baseline Expectations**:
- Single order creation: ~50-100ms (network + processing)
- Signal retrieval: ~30-50ms
- Order listing (10 items): ~100-150ms

**Optimization Strategy**:
- Supabase query optimization: Use prepared statements and indexes
- Caching: In-memory cache for frequently accessed signals (expiration-aware)
- Async processing: Heavy computations offloaded to background jobs
- Database connection pooling: PgBouncer for Supabase, connection pool for MongoDB

**Capacity Planning**:
- Current target: 100 concurrent users
- Expected growth: 10x/year in Year 1
- Projected year-end: 1000 concurrent users
- Infrastructure scaling: Horizontal scaling via load balancer and stateless services

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
