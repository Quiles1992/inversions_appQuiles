# SPEC-001-TKT-HD-DRFIC-001 — PLATAFORMA DE INVERSIONES CON IA (DR.FIC)

Framework: Spec-Driven Development (GitHub Copilot Spec-Kit)  
Estado: Activa  
Autoridad: Subordinada estrictamente a constitution.md

- **Control de Cambios:** 001-ucc-drfic
- **Ticket de Usuario:** 001-tkt-drfic

---

## 0. AUTORIDAD CONSTITUCIONAL

Esta especificación deriva directamente de la Constitución del Proyecto y está subordinada a ella como fuente de verdad primaria.

Reglas no negociables:
- Modelo semi-automático obligatorio
- La IA no ejecuta operaciones
- Control humano explícito en toda ejecución
- Arquitectura por cores desacoplados
- Señales explicables y trazables

Ante cualquier conflicto, prevalece constitution.md.

---

## Clarifications

### Session 2026-05-02

- Q: What are the main data entities in the platform? → A: User, Account, Position, Order, Signal
- Q: What are the key attributes for the User entity? → A: id (UUID), email (string), name (string)
- Q: What are the key attributes for the Account entity? → A: id (UUID), user_id (UUID), broker (string)
- Q: What are the key attributes for the Position entity? → A: symbol (string), quantity (float), avg_price (float)
- Q: What are the key attributes for the Order entity? → A: id (UUID), type (string), status (string)
- Q: What are the key attributes for the Signal entity? → A: id (UUID), symbol (string), action (string), confidence (float)

## 1. OBJETIVO GENERAL

Diseñar, construir y operar una Plataforma Web Profesional de Inversiones asistida por Inteligencia Artificial, enfocada en acciones y opciones del mercado estadounidense, que:

- Genere señales BUY / SELL / HOLD de alta confianza
- Combine múltiples fuentes de verdad especializadas (cores)
- Utilice IA únicamente como confirmador y evaluador de riesgo
- Integre brokers profesionales reales
- Mantenga control humano obligatorio sobre toda ejecución

---

## 2. FILOSOFÍA DEL SISTEMA

### 2.1 Modelo Semi-Automático

- No existe auto-trading en la versión 1.0
- La IA no ejecuta ni decide
- El usuario aprueba o rechaza toda operación
- La automatización se limita a análisis, correlación y recomendación

### 2.2 Arquitectura por Cores Desacoplados

El sistema se compone de cores independientes, activables por el usuario:

- Market Data
- Technical Indicators
- Technical Structure
- Institutional Flow
- News & Events
- Options Analysis
- Confluence Engine
- AI Advisor (confirmador)

Cada core representa una fuente de verdad explicable.

---

## 3. ALCANCE FUNCIONAL (VERSIÓN 1.0)

### Incluye
- Señales en acciones y opciones US
- Dashboard profesional
- Integración con IBKR y Alpaca
- Persistencia y trazabilidad
- Evidencia operativa por ticket

### Excluye
- Auto-trading
- IA como única fuente
- Señales black-box
- Crypto

---

## 4. ARQUITECTURA GENERAL

- PWA (React + TypeScript)
- Backend REST API (Node.js + Express)
- Supabase como base principal
- MongoDB opcional para logs y señales históricas
- Integración con IBKR y Alpaca
- AI Advisor (Claude API)

---

## REQUERIMIENTOS FUNCIONALES, CRITERIOS Y CONTRATOS

### Requerimientos funcionales clave
- FR-006: Autenticación JWT Bearer para todas las rutas protegidas.
- FR-007: Broker adapter desacoplado que abstrae IBKR y Alpaca.
- FR-008: Persistencia de ciclo de vida de señales con metadata explicable.
- FR-009: Flujo de aprobación manual para órdenes y recuperación de fallas de broker.
- FR-013: Concurrencia optimista en órdenes con respuesta `409 ORDER_VERSION_STALE`.

### Criterios de calidad y no funcionales
- SC-006: Observabilidad y rate limiting con métricas, logs de auditoría y trazabilidad.

### Mapeo de contratos
- `contracts/auth-context.md`: define la autenticación JWT, los encabezados y los códigos de error obligatorios.
- `contracts/broker-adapter.md`: define la abstracción de broker, las operaciones de orden y el manejo de fallas.
- `contracts/signal-lifecycle.md`: define la persistencia de señales, su explicabilidad, estado y expiración.
- `specs/001-plataforma-inversiones-ia/plan.md`: mapea las actividades de planeación (PL-001..PL-012) con las tareas y los artefactos de implementación.

---

## 5. STACK TECNOLÓGICO OBLIGATORIO

### PWA
- Vite
- React 18
- TypeScript
- Zustand
- TailwindCSS
- TradingView Lightweight Charts

### Backend
- Node.js
- Express
- Supabase
- MongoDB (opcional)
- Interactive Brokers API
- Alpaca Trading API
- Claude API

---

## 6. BACKEND REST API — RESPONSABILIDADES [REQ-BACKEND]

- Conectividad con brokers
- Sincronización de portafolio
- Persistencia server-side
- Ingesta de market data
- Ejecución asistida
- Seguridad y observabilidad
- Marcar la orden como `failed` si el broker rechaza o expira la conexión
- Exigir nueva aprobación manual antes de reintentar órdenes fallidas
- Conservar evidencia de fallo y trazabilidad en logs

---

## 7. AUTH CONTEXT (V1 OFICIAL) [FR-006]

Header requerido:
- Authorization: Bearer <JWT>

Reglas de validación:
- 401 AUTH_CONTEXT_MISSING
- 401 AUTH_CONTEXT_INVALID_TOKEN
- 404 AUTH_CONTEXT_USER_NOT_FOUND
- 403 AUTH_CONTEXT_USER_INACTIVE

Notas:
- En v1, el mecanismo oficial es JWT bearer auth.
- Los clientes deben presentar el token en cada petición autenticada.
- Este requisito se valida como FR-006 en el plan de implementación y en `contracts/auth-context.md`.

Notas:
- En v1, el mecanismo oficial es JWT bearer auth.
- Los clientes deben presentar el token en cada petición autenticada.

---

## 8. DATA MODEL [REQ-DATA]

- User: id (UUID), email (string), name (string)
- Account: id (UUID), user_id (UUID), broker (string)
- Position: symbol (string), quantity (float), avg_price (float)
- Order: id (UUID), type (string), status (string)
- Signal: id (UUID), symbol (string), action (string), confidence (float)

## 9. PERSISTENCIA DE DATOS [REQ-PERSISTENCIA]

Fuentes:
- Supabase: usuarios, cuentas, posiciones, órdenes
- MongoDB (opcional): señales históricas, reasoning IA, logs

Reglas:
- Persistencia únicamente server-side
- Sincronización idempotente
- Evidencia técnica obligatoria por ticket

---

## 10. INTELIGENCIA ARTIFICIAL (AI ADVISOR)

Rol constitucional:
- Core adicional
- Confirmador de confluencia
- Evaluador de riesgo
- Nunca ejecutor
- Nunca fuente única

Capacidades:
- Ajuste de score de confianza
- Explicación de señales
- Identificación de riesgos
- Justificación de no-operación

---

## 11. GOBIERNO DE AGENTES

Agentes oficiales:
- Picoro: arquitectura y especificación
- Goku: implementación
- Vegeta: optimización y seguridad
- Krilin: REST API y bases de datos
- Bulma: testing y validación
- Dr.FIC: aprobación humana

Orden obligatorio:
Picoro → (Goku ∥ Krilin) → (Vegeta ∥ Bulma) → Dr.FIC

---

## 12. CRITERIOS DE ACEPTACIÓN GLOBALES

- FR-006: Todas las rutas protegidas validan JWT bearer y retornan los códigos de error especificados.
- FR-007: La lógica de brokers está desacoplada y es intercambiable entre IBKR y Alpaca.
- FR-008: Cada señal persistida incluye `confidence`, `rationale`, `sourceCores`, `createdAt` y `expiresAt`.
- FR-009: Órdenes fallidas por broker se marcan como `failed` y requieren una nueva aprobación manual antes de reintentar.
- FR-013: Las actualizaciones de orden con versión obsoleta devuelven `409 ORDER_VERSION_STALE`.
- SC-006: El sistema registra eventos de tasa, auditoría y trazabilidad para requests protegidos.
- PL-001..PL-012: La planificación, los contratos y las tareas están mapeados y verificables a través de los artefactos de `plan.md`, `tasks.md` y `contracts/`.
- Respeto total a la Constitución.
- IA no ejecuta operaciones.
- Credenciales solo en `.env`.
- Evidencia funcional por ticket.
- Logs y trazabilidad activos.

---

## 14. DECLARACIÓN FINAL

Este documento:
- Es un único archivo Markdown
- Está listo para ejecutarse con /speckit.specification
- Es constitucionalmente válido
- Es ejecutable por agentes IA
- Representa fielmente el estado actual del proyecto
