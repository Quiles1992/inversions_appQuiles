# Broker Adapter

## Purpose

Define the abstraction layer for connecting to and interacting with brokers in a decoupled way.

## Requirements

- The broker layer must support IBKR and Alpaca in v1.0.
- Broker logic must be encapsulated behind a stable internal adapter interface.
- The rest of the system must not depend on broker-specific APIs.

## Adapter Contract

### Connect Broker

- Input: `accountId`, `broker`, `credentials`
- Output: connection status and connected account metadata

### Standard Broker Operations

- `fetchMarketData(symbol)`
- `syncPositions(accountId)`
- `prepareOrder(order)`
- `submitOrder(order)`
- `getOrderStatus(orderId)`

## Failure Handling

- Broker timeouts or technical rejections must mark the associated order as `failed`.
- Failed orders cannot proceed without new manual approval.
- Adapter errors must be logged with traceability and returned as structured error responses.

## Extensibility

- The adapter should allow adding future brokers without changing core signal or order workflows.
- Example future brokers: Tradier, TD Ameritrade / Schwab, NinjaTrader.
