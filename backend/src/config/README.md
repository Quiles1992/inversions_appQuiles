# Backend Configuration and SLO Documentation

**T017: Backend Configuration & SLO Thresholds**

This document describes the backend configuration, environment variables, rate limiting thresholds, availability goals, and recovery expectations.

## Configuration Overview

The backend is configured through environment variables defined in `.env.example` and loaded by `backend/src/config/index.ts`.

### Core Environment Variables

```bash
# Server
PORT=3000
NODE_ENV=development

# JWT Authentication (FR-006)
JWT_SECRET=your-secret-key-min-32-chars

# Supabase (Primary Store - FR-008)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# MongoDB (Optional - Historical Data)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/drfic?retryWrites=true&w=majority

# Broker Credentials (FR-007)
IBKR_USERNAME=your-ibkr-username
IBKR_PASSWORD=your-ibkr-password
ALPACA_API_KEY=your-alpaca-key
ALPACA_API_SECRET=your-alpaca-secret

# AI Advisory (Claude API)
CLAUDE_API_KEY=your-claude-api-key

# Rate Limiting (T007)
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

## Service Level Objectives (SLO)

### 1. Availability SLO: >= 99.5% Monthly (SC-006)

**Definition**: Percentage of successfully processed API requests within acceptable latency bounds.

**Target**: 99.5% uptime = 3.6 hours of acceptable downtime per month

**Measurement**:
```
Availability = (Successful Requests / Total Requests) × 100
- Successful = 2xx/3xx status codes
- Failed = 5xx status codes or timeout (> 30s)
- Excluded = Explicit rate-limit rejections (429)
```

**Monitoring**:
- Metric: `api_availability_percent` in `observability_metrics` table
- Aggregation: Daily calculation, 30-day rolling average
- Storage: Supabase `observability_metrics` table

**Alerting**:
```
WARNING:  < 99.0% (using remaining error budget)
CRITICAL: < 98.0% (SLO breached, initiate incident response)
```

**Recovery Actions**:
1. Check broker connections (IBKR/Alpaca)
2. Verify database connectivity (Supabase/MongoDB)
3. Review recent deployments for regressions
4. Scale horizontally if traffic spike detected
5. Engage on-call engineer if unavailable

### 2. Latency SLO: < 250ms p95 for Core Operations (SC-006)

**Core Operations** (measured for SLO):
- `POST /signals` - Create signal with metadata
- `POST /orders` - Create order from signal
- `PUT /orders/:id/approve` - Approve order
- `GET /signals/:id` - Retrieve signal details
- `GET /orders/:id` - Retrieve order status

**Latency Distribution Goals**:
```
p50 (median):  <  100ms  (50% of requests faster)
p75:           <  150ms  (75% of requests faster)
p90:           <  200ms  (90% of requests faster)
p95:           <  250ms  (95% of requests faster) [SLO TARGET]
p99:           <  500ms  (99% of requests faster)
```

**Measurement**:
- Captured in `performance_logs` collection (MongoDB)
- Or `observability_metrics` table (Supabase)
- Includes network latency (browser → server) + processing time

**Latency Factors**:
- JWT validation: ~5ms
- Database query: ~20-50ms (Supabase)
- Broker API call: ~100-500ms (if synchronous)
- Rate limiting check: ~1ms
- Response serialization: ~5-10ms

**Optimization**:
- Leverage indexes: `idx_signals_status`, `idx_orders_account_id`, etc.
- Connection pooling: PgBouncer for Supabase connections
- Caching: In-memory signal cache (invalidated on expiration)
- Async operations: Broker calls in background if possible

**Degradation Response**:
If p95 > 300ms for ≥ 5 consecutive minutes:
1. Check database query slow logs
2. Verify broker API responsiveness
3. Monitor CPU/memory usage
4. Scale database connections if pool exhausted
5. Consider request queuing if overload detected

### 3. Rate Limiting Thresholds (T007, SC-006)

**Algorithm**: Token bucket with per-user limits

**Standard User Limits**:
```
Rate Limit: 100 requests per minute
Window Size: 60 seconds (rolling)
Burst Allowance: 150 requests within 60-second window
```

**Calculation Example**:
```
Allowed tokens = 100 / 60 = 1.67 tokens/second
Burst: Up to 50 extra tokens (token bucket capacity = 150)

If user makes 50 requests in first 10 seconds:
- Allowed: 50 × (1.67 tokens/sec × 10 sec) = 83 tokens available ✓
- Next request at t=11s uses 1 token (82 remaining) ✓
- At t=60s, bucket resets to 100 tokens
```

**Rejection Response**:
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 45
Content-Type: application/json

{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Maximum 100 requests per 60 seconds.",
  "retry_after_seconds": 45
}
```

**Logging**:
- Event: `rate_limit_event`
- Fields: `user_id`, `endpoint`, `limit_threshold`, `window_seconds`, `requests_in_window`, `rejected_at`
- Storage: `rate_limit_events` table
- Aggregation: Hourly report of throttled users

**User Tiers** (future):
```
Premium: 500 requests/minute
Standard: 100 requests/minute (default)
Free: 30 requests/minute
```

### 4. Broker Integration SLO: >= 95% First-Attempt Success

**Definition**: Orders successfully submitted to broker without timeout/rejection on first attempt.

**Target**: 95% of approved orders reach broker successfully

**Tracking**:
- Table: `broker_events` with `success` boolean
- Fields: `broker`, `event_type`, `error_message`, `retry_count`
- Aggregation: Daily calculation by broker

**Success Criteria**:
- Request sent to broker: ✓
- Response received (even if rejection): ✓
- No timeout or network error: ✓

**Failure Conditions**:
- Network timeout (> 30s)
- Connection refused
- TLS errors
- Rate limit from broker (backoff and retry)

**Failure Handling**:
1. Order marked as `failed`
2. Error reason logged with broker response
3. Audit event created: `broker_submission_failed`
4. User notified to reapprove if desired
5. Broker interaction logged for debugging

**Recovery**:
- Minimum 5-minute wait before retry
- Requires explicit manual reapproval (FR-009)
- Broker failure logs preserved in audit trail

### 5. Broker Connection SLO: >= 99% Uptime

**Target**: Broker connection available for order submission ≥ 99% of time per month

**Connections**:
- IBKR: WebSocket session to IB Gateway or API
- Alpaca: REST API or WebSocket depending on account type

**Monitoring**:
- Heartbeat check: Every 30 seconds
- Success threshold: Response within 5 seconds
- Metric: `broker_connection_uptime_percent`

**Degradation**:
- If connection down > 1 minute: Page on-call engineer
- If connection down > 5 minutes: Failover to backup broker (if configured)
- If both down: Halt order submission, notify users

### 6. Data Consistency & Audit SLO: 100% Accuracy

**Requirement**: All financial transactions must be consistent and auditable.

**Guarantees**:
- Every order written to Supabase before response sent to client
- Every signal with complete metadata (confidence, rationale, expires_at)
- Every broker interaction logged (request, response, result)
- Audit logs retained for minimum 365 days

**Audit Log Coverage**:
- User authentication (login, logout)
- Order creation, approval, rejection, execution, failure
- Signal generation and expiration
- Broker interactions
- Rate limit events
- System errors and exceptions

**Recovery from Data Corruption**:
1. Identify affected records (audit logs show timeline)
2. Restore from daily backup
3. Replay transactions since last backup
4. Verify consistency (order counts, signal counts match audit logs)
5. Post-incident review

## Configuration Tuning

### For Development

```bash
# .env.development
PORT=3000
NODE_ENV=development
RATE_LIMIT_REQUESTS=1000  # High for testing
RATE_LIMIT_WINDOW_MS=60000
SUPABASE_URL=http://localhost:54321  # Local Supabase instance
```

### For Staging

```bash
# .env.staging
PORT=3000
NODE_ENV=production
RATE_LIMIT_REQUESTS=500  # Medium for integration testing
RATE_LIMIT_WINDOW_MS=60000
# Use actual Supabase project
```

### For Production

```bash
# .env.production
PORT=3000
NODE_ENV=production
RATE_LIMIT_REQUESTS=100  # Conservative for production
RATE_LIMIT_WINDOW_MS=60000
# Use hardened Supabase + MongoDB setup with failover
```

## Observability & Metrics

### Metrics Exposed at `/metrics`

```json
{
  "uptime_seconds": 864000,
  "requests_total": 1250000,
  "requests_success": 1248125,
  "requests_error": 1875,
  "availability_percent": 99.85,
  "latency_p50_ms": 85,
  "latency_p95_ms": 240,
  "latency_p99_ms": 480,
  "rate_limit_rejections": 450,
  "broker_submission_success_rate": 0.957,
  "database_connection_pool_size": 20,
  "database_connection_available": 18
}
```

### Health Check Endpoint `/health`

```json
{
  "status": "ok",
  "database": "connected",
  "broker_ibkr": "connected",
  "broker_alpaca": "connected",
  "mongodb": "connected",
  "timestamp": "2026-05-02T19:00:00Z"
}
```

## Incident Response Playbooks

### Latency Spike (p95 > 300ms)

1. Check database slow query log
2. Verify connection pool not exhausted
3. Monitor CPU/memory on app server
4. Check broker API latency
5. Scale app instances if sustained

### Availability Drop (< 99.0%)

1. Check Supabase status page
2. Verify broker connectivity
3. Review error logs for patterns
4. Check rate limiting not blocking legitimate traffic
5. Prepare incident post-mortem

### Rate Limit Surge

1. Identify affected users
2. Check for bot traffic or malicious requests
3. Temporarily increase rate limit if legitimate
4. Implement IP-based rate limiting if needed
5. Review and patch any API inefficiencies

## Testing SLO Compliance

```bash
# Latency test: measure p95 latency
npm run test:latency

# Load test: verify SLO under expected load
npm run test:load -- --users=1000 --duration=300

# Broker integration test: verify broker SLO
npm run test:broker-integration

# Availability test: measure uptime percentage
npm run test:availability -- --duration=86400
```

## References

- [Service Level Agreement (SLA)](../spec.md#slo-requirements)
- [Implementation Plan](../plan.md#service-level-objectives-slo)
- [Rate Limiting Middleware](./middleware/rate-limit.ts)
- [Observability Service](./services/observability.ts)
- [Database Schema](./models/README.md)
