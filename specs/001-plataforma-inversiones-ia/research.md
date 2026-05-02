# Research

## Decision: Architecture and stack

- Use a React 18 + TypeScript PWA for the frontend, built with Vite.
- Use Node.js + Express for the backend REST API.
- Use Supabase as the primary persistence layer for users, accounts, positions, orders, and signals.
- Use MongoDB optionally for historical signal logs, AI reasoning traces, and observability data.
- Use JWT bearer authentication for v1, replacing the transitional `x-user-id` header.
- Use IBKR and Alpaca adapters to keep broker integration extensible and decoupled.

## Rationale

- The constitution explicitly mandates a PWA + backend architecture, React/TypeScript, and Node.js/Express.
- Supabase supports relational data persistence and auditability while simplifying backend implementation.
- MongoDB is a good fit for optional, append-only historical logs and AI reasoning artifacts.
- JWT is the standard secure approach for backend auth and aligns with the clarified auth context.
- A broker adapter layer is necessary to meet the constitutional requirement that broker logic not be tightly coupled to a single provider.

## Alternatives considered

- Next.js full-stack approach: rejected because the constitution emphasizes explicit PWA + REST API separation.
- Auto-trading: rejected because v1.0 must preserve human approval for every order.
- Black-box AI signal generation: rejected because all signals must be explainable and traceable.
- Using Supabase only for everything: accepted for core data, but MongoDB remains useful for optional reasoning/logging to preserve performance and separation.

## Klarified Requirements

- Main entities are User, Account, Position, Order, Signal.
- The `User` entity must include `id`, `email`, `name`.
- The `Account` entity must include `id`, `user_id`, `broker`.
- The `Position` entity must include `symbol`, `quantity`, `avg_price`.
- The `Order` entity must include `id`, `type`, `status`.
- The `Signal` entity must include `id`, `symbol`, `action`, `confidence`.
- Backend availability goal is 99.5% monthly.
- Retention policy for evidence and audit logs is 365 days.
- Broker failures must mark orders as FAILED and require manual re-approval.

## Outcomes

- The plan will target a modular architecture with clearly separated frontend and backend layers.
- The main implementation focus is on explainable signal generation, manual order approval, broker adapter design, and auditing.
- The first development increment should establish the auth flow, core data model, order approval workflow, and a minimal broker integration abstraction.
