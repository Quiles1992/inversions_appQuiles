# Tasks: Plataforma de Inversiones con IA (DR.FIC)

**Input**: specs/001-plataforma-inversiones-ia/spec.md, plan.md, research.md, data-model.md, contracts/

## Traceability Summary
- Requirements: FR-006, FR-007, FR-008, FR-009, FR-013
- Success Criteria: SC-006
- Planning/Implementation codes: PL-001..PL-012

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 [P] Create the feature documentation structure in specs/001-plataforma-inversiones-ia/plan.md, research.md, data-model.md, quickstart.md, and contracts/ (PL-001)
- [x] T002 [P] Initialize the backend and frontend project skeletons in backend/ and frontend/ with the directory layout defined in plan.md (PL-002)
- [x] T003 [P] Create `.env.example` and backend configuration loader in backend/src/config/ to support Supabase, MongoDB, broker credentials, Claude API, JWT, and rate limiting (PL-003)
- [x] T004 [P] Update specs/001-plataforma-inversiones-ia/checklists/requirements.md and checklists/feature-validation.md with the current FR/SC/PL traceability and the new contract files (PL-004)

---

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T005 [P] Implement JWT bearer authentication middleware in backend/src/middleware/auth.ts with validation for `Authorization: Bearer <JWT>` and error codes `401 AUTH_CONTEXT_MISSING`, `401 AUTH_CONTEXT_INVALID_TOKEN`, `404 AUTH_CONTEXT_USER_NOT_FOUND`, `403 AUTH_CONTEXT_USER_INACTIVE` (PL-005) [FR-006]
- [x] T006 [P] Implement the broker adapter abstraction in backend/src/adapters/broker-adapter.ts, plus broker-specific stubs in backend/src/adapters/ibkr-adapter.ts and backend/src/adapters/alpaca-adapter.ts, ensuring broker logic is decoupled from order and signal services (PL-006) [FR-007]
- [x] T007 [P] Implement rate limiting middleware in backend/src/middleware/rate-limit.ts and configure an SLO for request throughput and rejection handling, including logged metrics for rate limit events (PL-007) [SC-006]
- [x] T008 [P] Implement observability infrastructure in backend/src/services/observability.ts and backend/src/middleware/logging.ts to emit request/tracing/audit logs and support the SC-006 observability requirement (PL-008) [SC-006]
- [x] T009 Implement the order model with optimistic concurrency versioning in backend/src/models/order.ts and order persistence code in backend/src/services/order-service.ts, including the `409 ORDER_VERSION_STALE` response path (PL-009) [FR-013]
- [x] T010 Implement the signal lifecycle model in backend/src/models/signal.ts and persist signal explainability fields in backend/src/services/signal-service.ts, including rationale, sourceCores, confidence, createdAt, and expiresAt (PL-010) [FR-008]

---

## Phase 3: User Story 1 - Manual Order Approval and Failure Recovery (Priority: P1)

**Goal**: Deliver the backend flow that generates an order from a signal, requires manual user approval, and recovers safely from broker failures.

**Independent Test**: Submit a signal-driven order, approve it manually, simulate a broker failure, verify the order becomes `failed`, and confirm a retry requires a new manual approval.

- [x] T011 [US1] Implement order submission and approval endpoints in backend/src/routes/order-routes.ts and backend/src/controllers/order-controller.ts, ensuring the order creation starts as `pending_approval` and requires explicit approval before broker submission (PL-011) [FR-009]
- [x] T012 [US1] Implement broker failure recovery logic in backend/src/services/broker-service.ts and backend/src/services/order-service.ts so that broker timeouts and rejections mark orders as `failed` and require a new manual approval for retry (PL-012) [FR-009]

---

## Phase 4: User Story 2 - Signal Persistence and Explainability (Priority: P2)

**Goal**: Deliver explainable signal persistence, lifecycle tracking, and retrieval for decision support.

**Independent Test**: Create a signal, verify it stores confidence, source cores, and rationale, and retrieve it through a backend endpoint or log query.

- [x] T013 [US2] Implement a signal creation flow in backend/src/controllers/signal-controller.ts and backend/src/routes/signal-routes.ts that stores explainability metadata and lifecycle state (PL-011) [FR-008]
- [x] T014 [US2] Implement signal expiration and archival behavior in backend/src/services/signal-service.ts, ensuring signals can expire by `expiresAt` and remain audit-traceable (PL-012) [FR-008]

---

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T015 [P] Add database migration or schema definition files in backend/src/models/ with Supabase and MongoDB persistence details, based on specs/001-plataforma-inversiones-ia/data-model.md (PL-001)
- [ ] T016 [P] Add backend contract tests or documentation checks in specs/001-plataforma-inversiones-ia/contracts/ to validate auth, broker adapter, signal lifecycle, and order recovery behavior (PL-004)
- [ ] T017 [P] Add SLO documentation in specs/001-plataforma-inversiones-ia/plan.md and backend/src/config/README explaining rate limiting thresholds, availability goals, and recovery expectations (PL-007)

---

## Dependencies & Execution Order

- **T001-T004** (Phase 1) can start immediately in parallel.
- **T005-T010** (Phase 2) depend on Phase 1 completion.
- **T011-T012** depend on T005, T006, T008, and T009.
- **T013-T014** depend on T006, T008, and T010.
- **T015-T017** can proceed after Phase 2 foundation is stable and should be done in parallel with later story work.

### Dependency Graph

- T005 → T011, T013
- T006 → T009, T010, T011, T013
- T007 → T011, T013, T015
- T008 → T011, T012, T013, T014
- T009 → T011, T012
- T010 → T013, T014

### SLO / Rate Limiting Notes

- Rate limiting is a foundational requirement: enforce request thresholds in T007 and log rejections in T008.
- The SLO target is backend availability >= 99.5% monthly with a p95 latency goal for core API calls.
- Rate limit events should be visible in observability dashboards and drive retry behavior on the client side.

### Concurrency and Recovery

- Use optimistic concurrency on orders with a version field in T009.
- Return `409 ORDER_VERSION_STALE` when an order update is stale.
- Recovery by dependency means retry logic must refresh the latest order state before retrying approval or broker submission (T012, T014).

## Traceability Matrix

| Requirement Code | Activity | Evidence |
|---|---|---|
| FR-006 | T005 Authenticate users via JWT bearer token | backend/src/middleware/auth.ts, specs/001-plataforma-inversiones-ia/contracts/auth-context.md |
| FR-007 | T006 Implement decoupled broker adapter interface | backend/src/adapters/broker-adapter.ts, specs/001-plataforma-inversiones-ia/contracts/broker-adapter.md |
| FR-008 | T010/T013 Persist explainable signal lifecycle | backend/src/models/signal.ts, specs/001-plataforma-inversiones-ia/contracts/signal-lifecycle.md |
| FR-009 | T011/T012 Handle failed broker orders and manual reapproval | backend/src/services/order-service.ts, backend/src/services/broker-service.ts |
| FR-013 | T009 Implement optimistic concurrency with 409 ORDER_VERSION_STALE | backend/src/models/order.ts, backend/src/controllers/order-controller.ts |
| SC-006 | T007/T008 Implement observability and rate limiting | backend/src/services/observability.ts, backend/src/middleware/rate-limit.ts |
| PL-001 | T001/T003/T015 Setup docs, data model, project skeleton | specs/001-plataforma-inversiones-ia/plan.md, data-model.md, backend/src/models/ |
| PL-002 | T002 Establish frontend/backend baseline structure | backend/, frontend/ |
| PL-003 | T003 Configure env and persistence support for Supabase/MongoDB | backend/src/config/ |
| PL-004 | T004 Update contracts/checklists for traceability | specs/001-plataforma-inversiones-ia/contracts/, checklists/ |
| PL-005 | T005/T011 Implement auth and order approval flow | backend/src/middleware/auth.ts, backend/src/routes/order-routes.ts |
| PL-006 | T006 Define broker adapter and stubs | backend/src/adapters/ |
| PL-007 | T007/T017 Define rate limiting and SLO | backend/src/middleware/rate-limit.ts, specs/001-plataforma-inversiones-ia/plan.md |
| PL-008 | T008 Implement observability foundation | backend/src/services/observability.ts |
| PL-009 | T009 Implement order versioning and stale update handling | backend/src/models/order.ts |
| PL-010 | T010/T013 Implement signal lifecycle persistence | backend/src/models/signal.ts, backend/src/controllers/signal-controller.ts |
| PL-011 | T011/T013 Complete manual approval and signal persistence | backend/src/controllers/order-controller.ts, backend/src/controllers/signal-controller.ts |
| PL-012 | T012/T014 Complete failure recovery and expiration | backend/src/services/broker-service.ts, backend/src/services/signal-service.ts |

## Disclaimer FR-013

- FR-013 requires optimistic concurrency for order updates.
- If an order update arrives with a stale version, the system must return `409 ORDER_VERSION_STALE` and surface a recovery path to refresh the latest order state.
- Clients must not retry blindly; they must reload order details and confirm dependencies before a retry.

## Closure Criteria

- All Phase 1 and Phase 2 tasks complete with passing contract and integration checks.
- JWT auth is validated end-to-end and returns the specified error codes.
- Broker adapter can instantiate both IBKR and Alpaca stubs and preserve decoupling from order logic.
- Rate limiting rejects and logs throttled requests, and observability captures audit events.
- Orders update with versioning and stale updates return `409 ORDER_VERSION_STALE`.
- Failed broker orders transition to `failed` and require manual reapproval.
- Signals persist rationale, source cores, confidence, and expiration state.
- The traceability matrix in this file matches the final task artifacts.
