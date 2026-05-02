# Requirements Checklist

## Auth Context [FR-006]
- [ ] Use `Authorization: Bearer <JWT>` for all authenticated requests
- [ ] Validate JWT signature and expiration in backend
- [ ] Return `401 AUTH_CONTEXT_MISSING` when auth header is absent
- [ ] Return `401 AUTH_CONTEXT_INVALID_TOKEN` for invalid tokens
- [ ] Return `404 AUTH_CONTEXT_USER_NOT_FOUND` when user is missing
- [ ] Return `403 AUTH_CONTEXT_USER_INACTIVE` when user is inactive

## Broker Adapter [FR-007]
- [ ] Support IBKR and Alpaca brokers in v1.0
- [ ] Keep broker-specific logic behind an adapter interface
- [ ] Mark broker timeouts or technical rejections as `failed`
- [ ] Require manual re-approval before retrying failed orders
- [ ] Preserve observability and traceability for broker errors

## Signal Lifecycle [FR-008]
- [ ] Record signals with `id`, `symbol`, `action`, `confidence`, `sourceCores`, `rationale`
- [ ] Keep signal data persistent and append-only
- [ ] Maintain signal explainability and traceability
- [ ] Expire signals after a defined validity window
- [ ] Preserve original signal rationale on order creation

## Order Concurrency [FR-013]
- [ ] Implement optimistic concurrency on order updates
- [ ] Return `409 ORDER_VERSION_STALE` when an order version is stale
- [ ] Ensure stale updates require a read-modify-confirm retry path

## Observability & Rate Limiting [SC-006]
- [ ] Emit metrics for request throughput and throttling
- [ ] Log audit events for broker interactions and order lifecycle changes
- [ ] Track rate limit rejections with actionable data
- [ ] Preserve traceability of request and order state transitions
