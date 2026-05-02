# Feature Validation Checklist

## Traceability Codes
- Requerimientos: FR-006, FR-007, FR-008, FR-009, FR-013
- Criterio de éxito: SC-006
- Plan/Implementación: PL-001..PL-012

| Criterio | Código | Estado | Evidencia | Acción sugerida |
|---|---|---|---|---|
| Consistencia entre la especificación y el plan sobre el mecanismo de autenticación | FR-006 | OK | `spec.md` ahora define JWT Bearer auth en Auth Context; `plan.md` define el mecanismo oficial v1 de JWT | Ninguna acción inmediata, la especificación y el plan están alineados |
| Consistencia entre el alcance funcional del spec y el resumen técnico del plan | PL-001 | OK | Ambos mencionan señales BUY/SELL/HOLD, PWA + backend REST API, brokers IBKR/Alpaca y AI como confirmador | Ninguna acción inmediata, continuar validando detalles de implementación en tareas posteriores |
| Calidad de la nueva estructura de proyecto propuesta en el plan | PL-002 | OK | `plan.md` ya lista los archivos de contrato actuales en `contracts/` y la estructura de frontend/backend está definida | Ninguna acción inmediata, la estructura del plan refleja la realidad del proyecto |
| Trazabilidad de requerimientos en la spec | FR-006..FR-013 | OK | `spec.md` incluye IDs de sección en los bloques clave de backend, auth, data model y persistencia | Ninguna acción inmediata; la trazabilidad de requisitos está mejorada |
| Trazabilidad entre spec y plan para criterios de aceptación globales | SC-006 | OK | El plan ahora incluye un cuadro de correspondencia entre requisitos del spec y artefactos del plan | Ninguna acción inmediata; la correspondencia está documentada |
| Identificación de riesgos técnicos relevantes | PL-007 | OK | El plan identifica riesgos operativos importantes como disponibilidad, credenciales en `.env`, and adapter extensibility | Documentar riesgos adicionales faltantes como dependencia en Claude API, validación de IBKR/Alpaca y la gestión de datos opcionales en MongoDB |
| Consistencia de la arquitectura de datos y del modelo en spec vs plan | FR-008 | OK | El spec define entidades con atributos clave; el plan contextualiza almacenamiento en Supabase y MongoDB opcional | Verificar que el modelo de datos se refleje en `data-model.md` y mantenga la misma terminología |
| Cumplimiento de criterios constitucionales en el plan | PL-001..PL-012 | OK | El plan incluye un bloque de Constitution Check con los mandatos clave del proyecto | Mantener la verificación constitucional en futuras iteraciones de plan y tareas |
| Coherencia del pipeline de entrega de documentos | PL-004 | OK | El plan ya referencia los contratos actuales en `contracts/auth-context.md`, `contracts/broker-adapter.md` y `contracts/signal-lifecycle.md` | Ninguna acción inmediata; la documentación de entrega está alineada |
| Claridad de los requisitos de fallos y ordenes fallidas | FR-009 | OK | `spec.md` ahora detalla el flujo de órdenes fallidas y el requerimiento de nueva aprobación manual | Ninguna acción inmediata; el flujo de fallos está documentado en el spec y en el plan |
| Nivel de especificidad de los requisitos de retención de logs | SC-006 | OK | El plan y el spec mencionan 365 días de retención de evidencia operativa y trazas | Confirmar en el plan y en el diseño de datos que esta retención quede operativa en Supabase/MongoDB |
| Riesgo de divergencia por branch / ruta de feature | PL-001 | OK | El plan ahora documenta la diferencia entre la rama actual `LARIOS3.1.4` y la feature directory configurada | Ninguna acción inmediata; se ha capturado el riesgo y la forma de ejecutarlo desde esta rama |
| Calidad general de la definición de alcance excluido | FR-006..FR-013 | OK | El spec lista exclusiones claras como auto-trading, IA única, señales black-box y crypto | Mantener estas exclusiones en el plan y en las tareas para evitar creep de alcance |
| Alineación de la terminología de AI con el modelo constitucional | FR-008 | OK | Ambos documentos llaman a la IA “confirmador” y establecen que no debe ejecutar | Continuar utilizando una terminología consistente en la documentación técnica y las tareas |
