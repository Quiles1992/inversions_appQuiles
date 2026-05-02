# Database Schema Documentation

**T015: Persistence Layer Configuration**

This directory contains database schema definitions for the investment platform supporting both primary (Supabase) and optional (MongoDB) storage backends.

## Overview

### Supabase (Primary Relational Store)
- Core transactional data: users, accounts, positions, orders, signals
- All writes and critical reads go through Supabase
- Strong consistency and ACID guarantees
- File: `supabase-schema.sql`

### MongoDB (Optional Historical & Performance)
- Historical signal traces and AI reasoning
- Broker interaction logs for debugging
- Performance metrics for observability
- File: `mongodb-schema.json`

## Supabase Schema Details

### Core Tables

#### `users`
Stores authentication and profile information.
```sql
SELECT * FROM users WHERE id = $1;
```

#### `accounts`
Broker account connections (IBKR, Alpaca). One user can have multiple accounts.
```sql
SELECT * FROM accounts WHERE user_id = $1 AND status = 'active';
```

#### `signals`
AI-generated trading signals with explainability metadata.
- **Append-only**: Signals are immutable once created
- **ExpiresAt**: Signals expire after a configured window
- **Status**: active, expired, archived
```sql
SELECT * FROM signals WHERE account_id = $1 AND status = 'active' AND expires_at > NOW();
```

#### `orders`
Trading orders with optimistic concurrency control.
- **Version field**: Used for concurrency control, returns `409 ORDER_VERSION_STALE` on stale updates
- **Approval workflow**: pending_approval → approved/rejected → executed/failed
- **Manual approval required**: Must be approved before broker submission (FR-009)
```sql
SELECT * FROM orders WHERE account_id = $1 AND status = 'pending_approval';
```

#### `audit_logs`
Comprehensive audit trail retained for minimum 365 days.
- **Compliance**: Supports regulatory requirements
- **Traceability**: All significant operations logged
```sql
SELECT * FROM audit_logs WHERE user_id = $1 AND created_at > DATE_SUB(NOW(), INTERVAL 7 DAY);
```

#### `rate_limit_events`
Tracks rate limit rejections for observability (SC-006).
```sql
SELECT COUNT(*) FROM rate_limit_events WHERE user_id = $1 AND rejected_at > DATE_SUB(NOW(), INTERVAL 1 HOUR);
```

#### `broker_events`
Detailed broker interaction logs.
- **Event types**: submission, execution, rejection, timeout
- **Retry tracking**: retry_count field
```sql
SELECT * FROM broker_events WHERE order_id = $1 ORDER BY created_at DESC;
```

#### `observability_metrics`
System performance metrics for SLO monitoring (SC-006).
- **Target availability**: >= 99.5% monthly
- **Target latency**: < 250ms p95 for core API calls
```sql
SELECT AVG(metric_value) FROM observability_metrics WHERE metric_name = 'api_latency_ms' AND recorded_at > DATE_SUB(NOW(), INTERVAL 1 DAY);
```

## MongoDB Collections

### Optional Collections

#### `ai_reasoning`
Stores detailed AI model reasoning and token usage for signals.
- Used for model debugging and cost tracking
- References Supabase `signals` table via `signalId`

#### `signal_history`
Archived signal data with performance tracking.
- Performance after execution: gain/loss, execution price vs current price
- Archival reasons: EXPIRED, MANUAL, SUPERSEDED
- TTL index: Auto-delete after 365 days

#### `broker_interactions`
Detailed broker interaction logs for debugging.
- Full request/response payloads
- Retry attempts and error codes
- Execution time metrics

#### `performance_logs`
API performance metrics for observability.
- Latency percentiles (p95, p99)
- Error rates and status codes
- Per-user and per-endpoint metrics

## Migration Instructions

### For Supabase

1. Create a new Supabase project or use existing instance
2. Connect to PostgreSQL database
3. Run the SQL migration:

```bash
# Load schema into Supabase
psql postgresql://user:password@db.supabase.co:5432/postgres < supabase-schema.sql

# Or use Supabase Studio SQL Editor and paste contents
```

4. Verify tables created:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

### For MongoDB

1. Create MongoDB cluster or use existing instance
2. Validate schema with JSON Schema validator:

```bash
# Using MongoDB CLI
mongosh
db.createCollection("ai_reasoning", {
  validator: {
    $jsonSchema: { /* contents from mongodb-schema.json */ }
  }
})
```

3. Create indexes:

```javascript
// Run these in MongoDB Shell
db.ai_reasoning.createIndex({ signalId: 1 });
db.ai_reasoning.createIndex({ modelName: 1, createdAt: -1 });

db.signal_history.createIndex({ signalId: 1 }, { unique: true });
db.signal_history.createIndex({ accountId: 1, archivedAt: -1 });
db.signal_history.createIndex({ symbol: 1, createdAt: -1 });

// Add TTL indexes for 365-day retention
db.signal_history.createIndex({ createdAt: 1 }, { expireAfterSeconds: 31536000 });
```

## Environment Configuration

See `backend/src/config/index.ts` for database connection configuration:

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_KEY`: Supabase API key
- `MONGODB_URI`: MongoDB connection string (optional)

## Data Relationships

```
Users (1) ──┬──→ (N) Accounts
            │
            └──→ (N) Orders
                    │
                    └──→ (1) Signals

Accounts (1) ──→ (N) Positions
            │
            └──→ (N) Orders
            │
            └──→ (N) Signals

Signals (1) ──→ (N) AIReasoning (MongoDB)
            │
            └──→ (N) Orders

Orders (1) ──→ (N) BrokerEvents
          │
          └──→ (N) AuditLogs
```

## Audit & Compliance

### Retention Policy
- **Supabase**: All audit logs retained for minimum 365 days
- **MongoDB**: TTL indexes configured to auto-delete after 365 days
- **Compliance**: Supports regulatory requirements for operational evidence

### Audit Trail Coverage
- User authentication and profile changes
- Account modifications (status, broker connections)
- All order state transitions
- Signal creation and expiration
- Broker interactions and failures
- Rate limit events
- API access logs

## Performance Tuning

### Supabase Query Optimization
```sql
-- Enable query statistics
EXPLAIN ANALYZE
SELECT * FROM orders 
WHERE account_id = $1 AND status = 'pending_approval'
ORDER BY created_at DESC LIMIT 10;

-- Verify indexes are used
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM signals WHERE account_id = $1 AND expires_at > NOW();
```

### MongoDB Aggregation Examples

```javascript
// Find top 10 slowest API endpoints
db.performance_logs.aggregate([
  { $match: { createdAt: { $gte: new Date(Date.now() - 86400000) } } },
  { $group: { _id: "$endpoint", avgLatency: { $avg: "$latencyMs" } } },
  { $sort: { avgLatency: -1 } },
  { $limit: 10 }
]);

// Calculate error rate by hour
db.performance_logs.aggregate([
  { $match: { createdAt: { $gte: new Date(Date.now() - 86400000) } } },
  { $group: { 
      _id: { $dateToString: { format: "%Y-%m-%dT%H:00:00Z", date: "$createdAt" } },
      total: { $sum: 1 },
      errors: { $sum: { $cond: [{ $gte: ["$statusCode", 400] }, 1, 0] } }
    }
  },
  { $addFields: { errorRate: { $divide: ["$errors", "$total"] } } }
]);
```

## References

- [Supabase Documentation](https://supabase.com/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Investment Platform Spec](../spec.md)
- [Data Model](../data-model.md)
- [SLO Documentation](../plan.md)
