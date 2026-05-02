# Data Model

## Entities

### User
- id: UUID
- email: string
- name: string
- role: string (`user`, `admin`)
- status: string (`active`, `inactive`)
- createdAt: datetime
- updatedAt: datetime

### Account
- id: UUID
- userId: UUID
- broker: string (`ibkr`, `alpaca`)
- externalAccountId: string
- status: string (`active`, `disabled`, `pending`) 
- createdAt: datetime
- updatedAt: datetime

### Position
- id: UUID
- accountId: UUID
- symbol: string
- quantity: number
- avgPrice: number
- marketValue: number
- updatedAt: datetime

### Signal
- id: UUID
- accountId: UUID
- symbol: string
- action: string (`BUY`, `SELL`, `HOLD`)
- confidence: number (0.0 - 1.0)
- sourceCores: string[]
- rationale: string
- createdAt: datetime
- expiresAt: datetime

### Order
- id: UUID
- accountId: UUID
- userId: UUID
- signalId: UUID
- symbol: string
- side: string (`BUY`, `SELL`)
- quantity: number
- limitPrice?: number
- status: string (`pending_approval`, `approved`, `rejected`, `failed`, `executed`)
- reason: string
- createdAt: datetime
- approvedAt?: datetime
- executedAt?: datetime
- failedAt?: datetime

### AIReasoning (optional)
- id: UUID
- signalId: UUID
- modelName: string
- confidenceScore: number
- explanation: string
- createdAt: datetime

## Relationships

- A `User` can own multiple `Account` records.
- An `Account` can hold multiple `Position` records.
- An `Account` can issue multiple `Order` records.
- A `Signal` may be linked to one `Order`.
- An `Order` is created by a `User` and belongs to an `Account`.

## Validation Rules

- `email` must be a valid email and unique.
- `accountId`, `userId`, `signalId` must reference existing records.
- `quantity` must be positive.
- `confidence` must be between 0.0 and 1.0.
- `action` and `side` must be one of the allowed values.
- `limitPrice` is optional but required for limit orders.

## State Transitions

### Order lifecycle
- `pending_approval` → `approved` or `rejected`
- `approved` → `executed` or `failed`
- `rejected` and `failed` are terminal states for v1.0

### Signal lifecycle
- Signals are created, evaluated, and may expire.
- `Signal` records are append-only to preserve auditability.

## Storage Notes

- Core relational entities (`User`, `Account`, `Position`, `Order`, `Signal`) are stored in Supabase.
- Optional AI reasoning details and historical signal traces may be stored in MongoDB for performance and extensibility.
- Audit logs and operational evidence should be stored in an append-only manner with retention of at least 365 days.
