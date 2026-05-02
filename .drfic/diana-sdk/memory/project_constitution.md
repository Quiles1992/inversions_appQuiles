# 📜 CONSTITUCIÓN DEL PROYECTO
## Plataforma Profesional de Inversiones Asistida por Inteligencia Artificial

---

## 0. Naturaleza del Documento (Autoridad Constitucional)

Este documento constituye la **fuente de verdad primaria y superior** del proyecto.

Define los **principios inmutables**, **límites**, **reglas no negociables**, **gobierno de agentes**, **estándares técnicos mínimos** y **criterios rectores** bajo los cuales deberán alinearse **todas las especificaciones, tickets, agentes, skills, decisiones técnicas y código generado**.

Ninguna SPEC, ticket, agente o implementación podrá **contradecir esta Constitución** sin una **enmienda constitucional explícita y documentada**.

---

## 1. Propósito Estratégico

Diseñar, construir y evolucionar una **plataforma web de inversiones profesional**, orientada a **acciones y opciones del mercado estadounidense**, que **asista decisiones humanas de inversión** mediante:

- Análisis técnico cuantitativo multicapa  
- Análisis fundamental, estructural e institucional  
- Evaluación especializada de opciones  
- Confirmación y razonamiento asistido por Inteligencia Artificial  
- Integración con brokers profesionales reales  

La plataforma **no busca sustituir al inversionista**, sino **incrementar la precisión, trazabilidad y calidad de sus decisiones**.

---

## 2. Objetivo Constitucional

Desarrollar una **Plataforma Web de Inversiones asistida por Inteligencia Artificial** que:

- Detecte **señales de compra y venta de alta confianza**
- Combine múltiples **fuentes de verdad desacopladas (cores)**
- Permita al usuario **configurar, activar y ponderar** dichas fuentes
- Integre **brokers profesionales reales**
- Mantenga **control humano obligatorio** sobre cualquier ejecución (v1.0)
- Sea **escalable, auditable, segura y extensible**

Este objetivo es **independiente del stack tecnológico específico**, pero **sujeto a los estándares mínimos definidos en esta Constitución**.

---

## 3. Filosofía Fundamental del Sistema

### 3.1 Modelo Semi‑Automático

El sistema adopta por definición constitucional un modelo **semi‑automático**:

- ❌ No existe ejecución automática sin aprobación humana explícita  
- ✅ La automatización se limita a **análisis, correlación y recomendación**  
- ✅ La decisión final pertenece siempre al usuario  

---

### 3.2 Arquitectura por Cores Desacoplados

El sistema se compone de **cores independientes**, donde cada core:

- Representa una **fuente de verdad especializada**
- Es **desacoplado funcional y técnicamente**
- Puede activarse o desactivarse por el usuario  

Ejemplos de cores:

- Análisis fundamental
- Análsis técnico de soportes, resistencias y tendencias
- Análisis técnico de indicadores (RSI, MACD, BB, EMA/SMA, Volumen, etc.)
- Estructura y tendencia
- Cadena de Opciones
- Flujo institucional
- Noticias y eventos
- Inteligencia Artificial

---

### 3.3 Rol de la Inteligencia Artificial

La IA:

- ✅ Es **un core adicional**
- ✅ Actúa como **confirmador, correlador y evaluador de riesgo**
- ❌ Nunca reemplaza la lógica determinística base
- ❌ Nunca ejecuta operaciones por sí misma en v1.0  

Esto garantiza **transparencia, auditabilidad y control humano**.

---

## 4. Principio de Confluencia

Una señal solo puede considerarse válida cuando:

- Existe **coincidencia entre los cores activos o seleccionados por el usuario**
- Se alcanza un **score y nivel de confianza configurado**
- El razonamiento de cada core es **explicable y trazable**

No existen señales *black‑box*.

---

## 5. Rol del Usuario

El usuario:

- Decide **qué cores participan**
- Configura **estrategias, pesos y thresholds**
- Aprueba o rechaza **toda ejecución**
- Puede auditar **por qué una señal fue generada**

El sistema **asiste**, no sustituye.
``

---

## 6. Alcance Constitucional de la Versión 1.0

### Incluye

- Generación de señales de trading compra o venta
- Evaluación de oportunidades en acciones y opciones
- Integración con brokers profesionales
- Confirmación por IA
- Dashboard profesional trazable
- Persistencia, logs y evidencia operativa

### Excluye

- Auto‑trading sin intervención humana
- IA como única fuente de decisión
- Operación sin trazabilidad
- Señales no explicables

---

## 7. Principios de Ingeniería y Calidad

El proyecto se rige por los siguientes principios no negociables:

- **Spec‑Driven Development** como metodología base
- Separación estricta:
  - **PWA**: UI, contratos, lógica cliente
  - **REST API**: persistencia real, brokers, seguridad
- Arquitectura modular y escalable
- Seguridad estricta de credenciales
- Evidencia funcional obligatoria
- Testing, observabilidad y control de errores

---

## 8. Metodología de Ejecución

El proyecto se rige por la **Metodología AI Skill Development & Spec Driven Assistance AI**, que establece:

- Agentes con roles claros
- Skills reutilizables
- Knowledge previo a tickets
- Gates obligatorios
- Trazabilidad completa desde necesidad hasta código

Esta metodología **no es opcional**.

---

## 9. Stack Tecnológico Constitucional

### 9.1 PWA — Stack Base Obligatorio

La plataforma web (PWA) deberá construirse **obligatoriamente** sobre el siguiente stack base:

- **Vite** como bundler y entorno de desarrollo
- **React** como framework de UI
- **TypeScript** como lenguaje principal
- **JavaScript** permitido solo como interoperabilidad o legado
- Arquitectura modular por features

Este stack define el **estándar mínimo constitucional** para todas las aplicaciones PWA del ecosistema.

---

### 9.2 Backend — Stack Base Obligatorio

La capa backend deberá implementarse **obligatoriamente** como:

- **REST API**
- **Node.js**
- **Express** como framework base

El backend es responsable de:
- Persistencia real
- Integración con brokers
- Seguridad de credenciales
- Exposición de contratos estables a la PWA

---

## 10. Estándar Constitucional de Documentación de Código

Todo código generado para el proyecto, ya sea por humanos o por agentes de IA, deberá cumplir **obligatoriamente** con el siguiente estándar de documentación:

- Comentarios con el prefijo **`💬FIC:`**
- Utilizar emojis al inicio de los comentarios como: 
  - 💬 para explicación, 
  - ⚠️ para advertencia, 
  - 🐞 para bug, 
  - 💡 para idea
- Documentación **en inglés y español (EN / ES)**
- Aplicado al menos en:
  - Módulos
  - Servicios
  - Hooks públicos
  - Lógica crítica
  - Integraciones con brokers
  - Motores de señales

### Ejemplo Constitucional

```ts
//💬FIC: Calculates RSI indicator for trading signals (EN)
//💬FIC: Calcula el indicador RSI para señales de trading (ES)
export function calculateRSI(...) { ... }
```
La ausencia de este estándar bloquea el cierre de tickets.

---

## 11. Integración con Brokers

### 11.1 Brokers Obligatorios (v1.0)

La plataforma deberá ser funcional y operativa como mínimo con los siguientes brokers:
- **Interactive Brokers (IBKR)** — broker primario profesional
- **Alpaca** — broker secundario / paper trading
- 
Ambos deberán soportar:

Conectividad
Market data
Sincronización de portafolio
Preparación de órdenes asistidas
---

### 11.2 Arquitectura Estándar de Brokers

El sistema deberá implementar una arquitectura de brokers estandarizada, que permita:
- Agregar nuevos brokers sin reescribir la lógica de señales
- Brokers encapsulados como adaptadores
- Mantener contratos internos estables
- Lógica de trading desacoplada del broker

Ejemplos de brokers futuros soportables:

Tradier
TD Ameritrade / Schwab
NinjaTrader
Brokers crypto (en specs futuras)

La lógica de trading no puede acoplarse a un broker específico.

---

## 12. Gobierno Constitucional de Agentes de IA

### 12.1 Naturaleza de los Agentes

Los agentes (**Picoro, Goku, Vegeta, Krilin, Bulma**) son **roles documentados**, no entidades autónomas sin control.

Los agentes:
- No toman decisiones fuera de su rol
- No ejecutan trabajo sin trazabilidad
- No sustituyen la aprobación humana

---

### 12.2 Reglas Obligatorias para Todo Agente

Todo agente de IA que participe en el desarrollo:

- ✅ **DEBE declarar explícitamente el skill activo**
- ✅ **DEBE mostrar cabecera de actividad**
- ✅ **DEBE dejar evidencia verificable de salida**
- ❌ **NO puede ejecutar trabajo fuera de su fase asignada**

La ausencia de cualquiera de estos elementos **bloquea el avance del trabajo**.

---

### 12.3 Orden Operativo Constitucional Obligatorio

El flujo operativo de agentes es **obligatorio e inmutable**:

``Picoro → (Goku ∥ Krilin) → (Vegeta ∥ Bulma) → Aprobación``

- **Picoro**: análisis, investigación y diseño
- **Goku**: implementación
- **Vegeta**: optimización y seguridad
- **Krilin**: gestor de bases de datos y servicios REST API 
- **Bulma**: validación y testing
- **Dr.FIC.**: aprovación y validación humana explícita


Violaciones a este flujo **bloquean el avance del trabajo**.
Cualquier violación a:

- El orden de agentes
- Las reglas de visibilidad
- La falta de evidencia

resulta en:

- ⛔ Bloqueo inmediato del flujo
- ⛔ No cierre de tickets
- ⛔ No avance de fase

---

### 12.4 Independencia de Frameworks

Los agentes definidos en esta Constitución:

- Son **independientes** de los agentes internos de SpecKit u otros frameworks
- Funcionan como **modelo de gobierno y orquestación**
- Pueden operar sobre SpecKit, OpenSpec, u otros frameworks

SpecKit **no reemplaza** este gobierno; **se subordina a él**.

---

## 13. Escalabilidad del Ecosistema

Los principios de esta Constitución aplican a **todas las aplicaciones del ecosistema**, incluyendo:

Esto garantiza reutilización de agentes, skills y gobierno, consistencia técnica, escalabilidad organizacional en:
- Plataformas educativas (cursos, tutoriales, LMS Empresariales)
- Sistemas con agentes  **IA Copilot integrada**
- Aplicaciones PWA + REST API futuras con framework AI Skill Development

---

## 14. Evolución y Enmiendas

La plataforma está diseñada para evolucionar hacia:

- Backtesting avanzado
- Automatización progresiva (opt‑in)
- Nuevos brokers y mercados
- Nuevos cores especializados

Cualquier cambio que:

- Modifique la filosofía
- Altere el rol de la IA
- Habilite ejecución automática

requiere **enmienda constitucional explícita y documentada**.

---

## 15. Declaración Final

Esta Constitución define **qué es y qué no es** la plataforma.

Toda SPEC, ticket, agente, skill o línea de código deberá:

**Respetar, reflejar y reforzar esta Constitución**

---

**Estado**: ✅ Activa  
**Rol**: Fuente de verdad primaria  
**Framework**: Spec‑Driven Development (SpecKit / OpenSpec)

---