export type ObservabilityEvent = 'request' | 'audit' | 'rate_limit' | 'broker_failure';

const metrics: Record<string, number> = {
  requests: 0,
  rateLimitHits: 0,
  brokerFailures: 0
};

export const observability = {
  logRequest: (method: string, path: string, durationMs: number) => {
    metrics.requests += 1;
    console.log(`[OBS] request=${method} path=${path} durationMs=${durationMs}`);
  },
  logAudit: (message: string, details?: Record<string, unknown>) => {
    console.log(`[AUDIT] ${message}`, details ?? {});
  },
  logRateLimit: (key: string) => {
    metrics.rateLimitHits += 1;
    console.warn(`[RATE_LIMIT] key=${key} hits=${metrics.rateLimitHits}`);
  },
  logBrokerFailure: (orderId: string, reason: string) => {
    metrics.brokerFailures += 1;
    console.error(`[BROKER_FAILURE] orderId=${orderId} reason=${reason}`);
  },
  getMetrics: () => ({ ...metrics })
};
