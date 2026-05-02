-- Supabase Schema Migration for Investment Platform
-- Created: 2026-05-02
-- Description: Core relational entities for user management, accounts, orders, and signals
-- Retention: All audit logs and operational evidence retained for at least 365 days

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User table
-- Stores user authentication and profile information
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'admin')),
  status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_status (status)
);

-- Account table
-- Represents broker connections for each user
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  broker VARCHAR(50) NOT NULL CHECK (broker IN ('ibkr', 'alpaca')),
  external_account_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'disabled', 'pending')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_accounts_user_id (user_id),
  INDEX idx_accounts_status (status),
  INDEX idx_accounts_broker (broker),
  UNIQUE KEY unique_external_account (broker, external_account_id)
);

-- Position table
-- Represents current holdings in a user's account
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  quantity DECIMAL(20, 8) NOT NULL,
  avg_price DECIMAL(20, 8) NOT NULL,
  market_value DECIMAL(20, 8),
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_positions_account_id (account_id),
  INDEX idx_positions_symbol (symbol),
  UNIQUE KEY unique_position (account_id, symbol)
);

-- Signal table
-- Stores AI-generated trading signals with explainability metadata
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  action VARCHAR(50) NOT NULL CHECK (action IN ('BUY', 'SELL', 'HOLD')),
  confidence DECIMAL(3, 2) NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
  source_cores TEXT NOT NULL, -- JSON array stored as string
  rationale TEXT NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'expired', 'archived')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  INDEX idx_signals_account_id (account_id),
  INDEX idx_signals_symbol (symbol),
  INDEX idx_signals_status (status),
  INDEX idx_signals_expires_at (expires_at),
  -- Append-only constraint: signals are immutable once created
  CHECK (expires_at > created_at)
);

-- Order table
-- Stores orders with approval workflow and versioning for optimistic concurrency
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  signal_id UUID REFERENCES signals(id) ON DELETE SET NULL,
  symbol VARCHAR(20) NOT NULL,
  side VARCHAR(50) NOT NULL CHECK (side IN ('BUY', 'SELL')),
  quantity DECIMAL(20, 8) NOT NULL,
  limit_price DECIMAL(20, 8),
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending_approval', 'approved', 'rejected', 'failed', 'executed')),
  version INT NOT NULL DEFAULT 1, -- Optimistic concurrency control
  reason TEXT,
  failed_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  executed_at TIMESTAMP,
  failed_at TIMESTAMP,
  INDEX idx_orders_account_id (account_id),
  INDEX idx_orders_user_id (user_id),
  INDEX idx_orders_signal_id (signal_id),
  INDEX idx_orders_status (status),
  INDEX idx_orders_symbol (symbol),
  CHECK (quantity > 0)
);

-- Audit Log table
-- Tracks all significant operations for compliance and troubleshooting
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  signal_id UUID REFERENCES signals(id) ON DELETE SET NULL,
  details TEXT NOT NULL, -- JSON object stored as string
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_logs_event_type (event_type),
  INDEX idx_audit_logs_user_id (user_id),
  INDEX idx_audit_logs_created_at (created_at),
  -- Retention policy: at least 365 days
  CHECK (created_at > DATE_SUB(CURDATE(), INTERVAL 365 DAY))
);

-- Rate Limit Events table
-- Tracks rate limit rejections for observability (SC-006)
CREATE TABLE IF NOT EXISTS rate_limit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  endpoint VARCHAR(255) NOT NULL,
  limit_threshold INT NOT NULL,
  window_seconds INT NOT NULL,
  requests_in_window INT NOT NULL,
  rejected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_rate_limit_user_id (user_id),
  INDEX idx_rate_limit_endpoint (endpoint),
  INDEX idx_rate_limit_rejected_at (rejected_at)
);

-- Broker Event Log table
-- Tracks interactions with brokers (IBKR, Alpaca) for debugging and compliance
CREATE TABLE IF NOT EXISTS broker_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  broker VARCHAR(50) NOT NULL,
  event_type VARCHAR(100) NOT NULL, -- e.g., 'submission', 'execution', 'rejection', 'timeout'
  broker_response TEXT, -- JSON response from broker
  success BOOLEAN NOT NULL,
  error_message TEXT,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_broker_events_order_id (order_id),
  INDEX idx_broker_events_broker (broker),
  INDEX idx_broker_events_event_type (event_type),
  INDEX idx_broker_events_created_at (created_at)
);

-- Observability Metrics table
-- Tracks system performance metrics for SLO monitoring (SC-006)
CREATE TABLE IF NOT EXISTS observability_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(20, 8) NOT NULL,
  metric_unit VARCHAR(50),
  aggregation_window_seconds INT,
  tags TEXT, -- JSON object of tags
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_observability_metrics_name (metric_name),
  INDEX idx_observability_metrics_recorded_at (recorded_at),
  INDEX idx_observability_metrics_aggregation (aggregation_window_seconds)
);

-- Update timestamps trigger
-- Automatically updates updated_at on record modification
CREATE TRIGGER IF NOT EXISTS update_users_timestamp BEFORE UPDATE ON users
  FOR EACH ROW SET NEW.updated_at = CURRENT_TIMESTAMP;

CREATE TRIGGER IF NOT EXISTS update_accounts_timestamp BEFORE UPDATE ON accounts
  FOR EACH ROW SET NEW.updated_at = CURRENT_TIMESTAMP;

CREATE TRIGGER IF NOT EXISTS update_orders_timestamp BEFORE UPDATE ON orders
  FOR EACH ROW SET NEW.updated_at = CURRENT_TIMESTAMP;

-- Comments for documentation
COMMENT ON TABLE users IS 'User authentication and profile information. Supports admin and regular users with active/inactive status.';
COMMENT ON TABLE accounts IS 'Broker account connections (IBKR, Alpaca) linked to users. One user can have multiple accounts.';
COMMENT ON TABLE positions IS 'Current holdings tracked per account per symbol. Updated as positions change.';
COMMENT ON TABLE signals IS 'AI-generated trading signals with full explainability metadata including source cores and confidence scores. Append-only for auditability.';
COMMENT ON TABLE orders IS 'Trading orders with approval workflow and optimistic concurrency control via version field. Required manual approval before broker submission.';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail of all system events. Retained for minimum 365 days per compliance requirements.';
COMMENT ON TABLE rate_limit_events IS 'Tracks rate limit rejections for observability and SLO monitoring (SC-006).';
COMMENT ON TABLE broker_events IS 'Detailed broker interaction log including submissions, executions, rejections, and timeouts with full response data.';
COMMENT ON TABLE observability_metrics IS 'System performance metrics for SLO tracking including latency, throughput, availability, and error rates.';
